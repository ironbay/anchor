import * as Errors from "./error"
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from "aws-lambda"
import {
  Processor,
  OperationList,
  Response,
  Resource,
  Filter,
} from "./operation"

type Config<C> = {
  processors: Record<string, Processor>
  context: (event: APIGatewayProxyEventV2) => Promise<C>
}

type ApiError = {
  status: number
  source?: {
    pointer?: string
  }
  code: string
  title?: string
  detail?: string
}

export function Handler<C>(config: Config<C>): APIGatewayProxyHandlerV2 {
  return async function (event) {
    try {
      const response = await process(config, event)
      return success(response)
    } catch (ex) {
      if (ex instanceof Errors.GenericError) return error(ex.opts)
      throw ex
    }
  }
}

async function process<C>(config: Config<C>, event: APIGatewayProxyEventV2) {
  const { http } = event.requestContext
  const path = http.path.split("/").filter((i) => i)
  const processor = config.processors[path[0]]
  if (!processor) throw new Errors.NotFoundError()
  const ctx = await config.context(event)

  if (http.method === "GET") {
    if (path.length > 2 || path.length < 1)
      throw new Errors.GenericError({
        status: 400,
        code: "invalid_path",
        detail: `GET requests must be made to /resource or /resource/:id`,
      })

    if (path.length === 2) {
      return invoke(processor, "get", [
        {
          op: "get",
          ref: {
            type: path[0],
            id: path[1],
          },
        },
        ctx,
      ])
    }

    const query = event.queryStringParameters || {}
    const filters: Record<string, Filter> = {}
    for (let [key, value] of Object.entries(query)) {
      const matches = key.match(
        /filter\[([^\]]+)\](\[([^\]]+)\]){0,1}(\[(\d+)\]){0,1}/
      )
      if (!matches) continue
      const attr = matches[1]
      const op = matches[3] || "eq"
      const index = matches[4]
      filters[attr] = filters[attr] || {}
      if (!index) {
        filters[attr][op] = value
        continue
      }
      filters[attr][op] = filters[attr][op] || []
      filters[attr][op][index] = value
    }

    const offset = query["page[offset]"]
    const limit = query["page[limit]"]
    const result: OperationList = {
      op: "get",
      ref: {
        type: path[0],
      },
      params: {
        filters,
      },
      page: {
        offset: offset ? parseInt(offset) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        token: query["page[token]"],
      },
    }
    return invoke(processor, "list", [result, ctx])
  }

  if (http.method === "POST") {
    if (path.length !== 1)
      throw new Errors.GenericError({
        status: 400,
        code: "invalid_path",
        detail: `POST requests must be made to /resource`,
      })
    const body = useBody<{ data: Resource }>(event)
    return invoke(processor, "create", [
      {
        op: "create",
        data: body.data,
        ref: {
          type: path[0],
        },
      },
      ctx,
    ])
  }

  if (http.method === "PATCH") {
    if (path.length !== 2)
      throw new Errors.GenericError({
        status: 400,
        code: "invalid_path",
        detail: `PATCH requests must be made to /resource/{id}`,
      })
    const body = useBody<{ data: Resource }>(event)
    return invoke(processor, "update", [
      {
        op: "update",
        data: body.data,
        ref: {
          type: path[0],
          id: path[1],
        },
      },
      ctx,
    ])
  }
}

async function invoke<F extends keyof Processor>(
  processor: Processor,
  func: F,
  params: Parameters<Processor[F]>
) {
  const cb = processor[func]
  if (!cb) return new Errors.NotSupported()
  return cb.apply(this, params)
}

function useBody<T>(event: APIGatewayProxyEventV2) {
  if (!event.body)
    throw new Errors.GenericError({
      status: 400,
      code: "body_missing",
      detail: "Request body is missing",
    })
  const body = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString()
    : event.body
  try {
    return JSON.parse(body) as T
  } catch {
    throw new Errors.GenericError({
      status: 400,
      code: "invalid_json",
      detail: `JSON was formatted incorrectly: ${body}`,
    })
  }
}

function success(body: Response): APIGatewayProxyResultV2 {
  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  }
}

function error(err: ApiError): APIGatewayProxyResultV2 {
  return {
    statusCode: err.status,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ errors: [err] }),
  }
}
