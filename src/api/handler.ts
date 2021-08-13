import * as Errors from "./error"
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from "aws-lambda"
import {
  Processor,
  OperationGet,
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

    const filters: Record<string, Filter> = {}
    for (let [key, value] of Object.entries(
      event.queryStringParameters || {}
    )) {
      const matches = key.match(/filter\[([^\]]+)\](\[([^\]]+)\]){0,1}/)
      if (!matches) continue
      const attr = matches[1]
      const op = matches[3] || "eq"
      filters[attr] = filters[attr] || {}
      filters[attr][op] = value
    }

    const result: OperationGet | OperationList = {
      op: "get",
      ref: {
        type: path[0],
        id: path[1],
      },
      params: {
        filters,
      },
    }
    if (result.ref.id) return processor.get(result, ctx)
    return processor.list(result, ctx)
  }

  if (http.method === "POST") {
    if (path.length !== 1)
      throw new Errors.GenericError({
        status: 400,
        code: "invalid_path",
        detail: `POST requests must be made to /resource`,
      })
    const body = useBody<{ data: Resource }>(event)
    return processor.add(
      {
        op: "add",
        data: body.data,
        ref: {
          type: path[0],
        },
      },
      ctx
    )
  }

  if (http.method === "PATCH") {
    if (path.length !== 2)
      throw new Errors.GenericError({
        status: 400,
        code: "invalid_path",
        detail: `PATCH requests must be made to /resource/{id}`,
      })
    const body = useBody<{ data: Resource }>(event)
    return processor.update(
      {
        op: "update",
        data: body.data,
        ref: {
          type: path[0],
          id: path[1],
        },
      },
      ctx
    )
  }
}

function useBody<T>(event: APIGatewayProxyEventV2) {
  if (!event.body)
    throw new Errors.GenericError({
      status: 400,
      code: "body_missing",
      detail: "Request body is missing",
    })
  try {
    return JSON.parse(event.body) as T
  } catch {
    throw new Errors.GenericError({
      status: 400,
      code: "invalid_json",
      detail: "JSON was formatted incorrectly",
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
