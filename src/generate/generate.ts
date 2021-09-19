import { SchemaDefinition } from "../schema"

export type Generate = (
  schema: SchemaDefinition,
  cache: Record<string, string>
) => string
