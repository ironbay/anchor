import { OperationCreate, OperationUpdate } from "./operation"
import Ajv, { Schema } from "ajv"
import { GenericError } from "./error"
import addFormats from "ajv-formats"
import { FromSchema } from "json-schema-to-ts"

const ajv = new Ajv()
addFormats(ajv)

export function withData<T extends Schema>(
  input: OperationUpdate | OperationCreate,
  schema: T
) {
  const validate = ajv.compile(schema)
  const result = validate(input.data)
  if (result) return input.data as FromSchema<T>

  throw new GenericError({
    code: "input_error",
    status: 400,
    detail: validate.errors?.[0].message,
    source: {
      pointer: validate.errors?.[0].schemaPath,
    },
  })
}
