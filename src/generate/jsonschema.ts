import { pascalCase, pascalCaseTransform } from "pascal-case"
import type { Schema } from "jsonschema"
import { AttributeDefinition, ResourceDefinition } from "../schema"
import { Generate } from "./generate"

export const generate: Generate = (schema: any) => {
  const result: Record<string, Schema> = {}

  for (let resource of schema) {
    const name = pascalCase(resource.type)
    result[name] = {}
    if (resource.ops?.create !== false) {
      const schema = buildSchema(resource, "create", "optional")
      result[name]["create"] = schema
    }
    if (resource.ops?.read !== false) {
      const schema = buildSchema(resource, "read", "required")
      result[name]["read"] = schema
    }
    if (resource.ops?.update !== false) {
      const schema = buildSchema(resource, "update", "optional")
      result[name]["update"] = schema
    }
  }

  return JSON.stringify(result, null, "  ")
}

function buildSchema<T extends keyof AttributeDefinition["ops"]>(
  resource: ResourceDefinition,
  op: T,
  op_fallback: AttributeDefinition["ops"][T]
): Schema {
  return {
    // $schema: "https://json-schema.org/draft/2020-12/schema",
    title: pascalCase(`${resource.type}_${op}`),
    additionalProperties: false,
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      type: {
        const: resource.type,
      },
      attributes: buildAttribute(
        {
          type: "object",
          properties: resource.attributes,
        },
        op,
        op_fallback
      ),
      relationships: buildRelationships(resource),
    },
    required: ["id", "attributes", "relationships", "type"],
  }
}

function buildRelationships(resource: ResourceDefinition) {
  const result: Schema = {
    type: "object",
    additionalProperties: false,
    properties: {},
  }
  for (let [key, value] of Object.entries(resource.relationships)) {
    result.properties[key] = {
      type: "object",
      additionalProperties: false,
      required: ["data"],
      properties: {
        data: {
          type: "object",
          additionalProperties: false,
          required: ["id", "type"],
          properties: {
            id: {
              type: "string",
            },
            type: {
              const: value.resource,
            },
          },
        },
      },
    }
  }

  return result
}

function buildAttribute<T extends keyof AttributeDefinition["ops"]>(
  def: AttributeDefinition,
  op: T,
  op_fallback: AttributeDefinition["ops"][T]
): Schema {
  if (def.type === "object") {
    const result = {
      type: "object",
      additionalProperties: false,
      properties: {},
      required: [],
    }

    for (let [key, value] of Object.entries(def.properties)) {
      const op_value = value.ops?.[op] || op_fallback
      if (op_value === "omit") continue
      result.properties[key] = buildAttribute(value, op, op_fallback)
      if (op_value === "required") result.required.push(key)
    }

    return result
  }

  if (def.type === "array") {
    return {
      type: "array",
      items: buildAttribute(def.items, op, op_fallback),
    }
  }

  const { ops, ...schema } = def

  return schema
}
