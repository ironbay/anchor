import { pascalCase } from "pascal-case"
import { Project } from "ts-morph"
import * as Prettier from "prettier"
import { Generate } from "./generate"

export const generate: Generate = (schema, cache) => {
  const json = JSON.parse(cache["jsonschema"])
  const project = new Project({})
  const output = project.createSourceFile("typescript.ts", "", {
    overwrite: true,
  })

  output.addImportDeclaration({
    namedImports: ["FromSchema"],
    moduleSpecifier: "json-schema-to-ts",
  })

  for (let resource of schema) {
    const name = pascalCase(resource.type)
    const ns = output.addNamespace({
      name: name + "Resource",
      isExported: true,
    })

    if (resource.ops?.read !== false) {
      ns.addStatements([
        `export const ReadSchema = ${JSON.stringify(json[name].read)} as const`,
      ])
      ns.addTypeAlias({
        name: `Read`,
        type: `FromSchema<typeof ReadSchema>`,
        isExported: true,
      })
    }

    if (resource.ops?.create !== false) {
      ns.addStatements([
        `export const CreateSchema = ${JSON.stringify(
          json[name].create
        )} as const`,
      ])
      ns.addTypeAlias({
        name: `Create`,
        type: `FromSchema<typeof CreateSchema>`,
        isExported: true,
      })
    }

    if (resource.ops?.update !== false) {
      ns.addStatements([
        `export const UpdateSchema = ${JSON.stringify(
          json[name].update
        )} as const`,
      ])
      ns.addTypeAlias({
        name: `Update`,
        type: `FromSchema<typeof UpdateSchema>`,
        isExported: true,
      })
    }
  }

  const formatted = Prettier.format(output.print(), {
    parser: "typescript",
  })
  output.delete()
  return formatted
}

/*
function writeType<T extends keyof AttributeDefinition["ops"]>(
  resource: ResourceDefinition,
  op: T,
  op_fallback: AttributeDefinition["ops"][T]
) {
  return (w: CodeBlockWriter) => {
    Writers.object({
      id: "string",
      type: `"${resource.type}"`,
      attributes: writeAttribute(
        {
          type: "object",
          properties: resource.attributes,
        },
        op,
        op_fallback
      ),
      relationships: writeRelationships(resource),
    })(w)
  }
}

function writeRelationships(resource: ResourceDefinition) {
  return (w: CodeBlockWriter) => {
    w.inlineBlock(() => {
      for (let [rel_name, rel] of Object.entries(resource.relationships)) {
        w.write(`${rel_name}?:`)
        w.inlineBlock(() => {
          w.write(`data: `)
          w.inlineBlock(() => {
            w.writeLine(`id: string`)
            w.writeLine(`type: "${rel.resource}"`)
          })
          w.conditionalWrite(rel.type === "many", "[]")
          w.conditionalWrite(rel.type === "one" && rel.nullable, " | null")
        })
      }
    })
  }
}

function writeAttribute<T extends keyof AttributeDefinition["ops"]>(
  def: AttributeDefinition,
  op: T,
  op_fallback: AttributeDefinition["ops"][T]
) {
  return (w: CodeBlockWriter) => {
    if (def.type === "string") w.write("string")
    if (def.type === "object")
      w.inlineBlock(() => {
        for (let [key, child] of Object.entries(def.properties)) {
          const op_value = child.ops?.[op] || op_fallback
          if (op_value === "omit") continue
          w.newLine()

          w.write(key)
          if (op_value === "optional") w.write("?")
          w.write(": ")
          writeAttribute(child, op, op_fallback)(w)
        }
      })
    if (def.type === "number") w.write("number")
    if (def.type === "integer") w.write("number")
    if (def.type === "boolean") w.write("boolean")
    if (def.type === "array") {
      writeAttribute(def.items, op, op_fallback)(w)
      w.write("[]")
    }
    if (def.nullable) w.write(" | null")
  }
}
*/
