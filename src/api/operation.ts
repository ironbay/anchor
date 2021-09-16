export type Operation =
  | OperationGet
  | OperationCreate
  | OperationUpdate
  | OperationList

export type Filter = {
  gt?: string
  gte?: string
  lt?: string
  lte?: string
  eq?: string
}

type OperationGetBase<T extends string = string> = {
  op: "get"
  ref: {
    type: T
  }
}

export type OperationList<T extends string = string> = OperationGetBase<T> & {
  params: {
    filters: Record<string, Filter>
  }
  page: {
    offset?: number
    limit?: number
  }
}

export type OperationGet<T extends string = string> = OperationGetBase<T> & {
  ref: {
    type: T
    id: string
  }
}

export type OperationCreate<T extends string = string> = {
  op: "create"
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
  relationships: {
    [key: string]:
      | {
          data:
            | {
                id: string
                type: string
              }
            | { id: string; type: string }[]
            | undefined
        }
      | undefined
  }
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
  create?(input: OperationCreate<T["type"]>, ctx: C): Promise<SingleResponse<T>>
  update?(input: OperationUpdate<T["type"]>, ctx: C): Promise<SingleResponse<T>>
  list?(input: OperationList<T["type"]>, ctx: C): Promise<ListResponse<T>>
  get?(input: OperationGet<T["type"]>, ctx: C): Promise<SingleResponse<T>>
}
