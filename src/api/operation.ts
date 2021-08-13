export type Operation =
  | OperationGet
  | OperationAdd
  | OperationUpdate
  | OperationList

export type Filter = {
  gt?: string
  gte?: string
  lt?: string
  lte?: string
  eq?: string
}

type OperationGetBase<T extends Resource = Resource> = {
  op: "get"
  ref: {
    type: T["type"]
  }
  params: {
    filters: Record<string, Filter>
  }
}

export type OperationList<T extends Resource = Resource> = OperationGetBase<T>

export type OperationGet<T extends Resource = Resource> =
  OperationGetBase<T> & {
    ref: {
      type: T["type"]
      id: string
    }
  }

export type OperationAdd<T extends string = string> = {
  op: "add"
  ref: {
    type: T
  }
  data: unknown
}

export type OperationUpdate<T extends string = string> = {
  op: "update"
  ref: {
    type: T
    id: string
  }
  data: unknown
}

export type Resource = {
  id: string
  type: string
  attributes: Record<string, any>
  relationships: Record<
    string,
    {
      data:
        | {
            id: string
            type: string
          }
        | { id: string; type: string }[]
    }
  >
}

export type Response<T extends Resource = Resource> =
  | ListResponse<T>
  | SingleResponse<T>

export type ListResponse<T extends Resource = Resource> = {
  data: T[]
  included?: Resource[]
}

export type SingleResponse<T extends Resource = Resource> = {
  data: T | null
  included?: Resource[]
}

export interface Processor<T extends Resource = Resource, C = any> {
  list(input: OperationList<T>, ctx: C): Promise<ListResponse<T>>
  get(input: OperationGet<T>, ctx: C): Promise<SingleResponse<T>>
  add(input: OperationAdd<T["type"]>, ctx: C): Promise<SingleResponse<T>>
  update(input: OperationUpdate<T["type"]>, ctx: C): Promise<SingleResponse<T>>
}
