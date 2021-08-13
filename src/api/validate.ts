import { OperationAdd, OperationUpdate } from "./operation"
import Ajv, { Schema } from "ajv"
import { GenericError } from "./error"
import addFormats from "ajv-formats"

const ajv = new Ajv()
addFormats(ajv)

export function withData<T>(
  input: OperationUpdate | OperationAdd,
  schema: Schema
) {
  const validate = ajv.compile(schema)
  const result = validate(input.data)
  if (result) return input.data as T

  throw new GenericError({
    code: "input_error",
    status: 400,
    detail: validate.errors?.[0].message,
    source: {
      pointer: validate.errors?.[0].schemaPath,
    },
  })
}
