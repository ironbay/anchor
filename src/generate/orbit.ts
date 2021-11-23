import { Project, VariableDeclarationKind } from "ts-morph"
import * as Prettier from "prettier"
import { Generate } from "./generate"

const TYPE_MAPPING: Record<string, any> = {
  integer: "number",
}

export const generate: Generate = (schema) => {
  const project = new Project({})
  const output = project.createSourceFile("orbit.ts", "", {
    overwrite: true,
  })

  const result: Record<string, any> = {}

  for (let resource of schema) {
    const output = {
      attributes: {} as Record<string, any>,
      relationships: {} as Record<string, any>,
    }
    result[resource.type] = output
    for (let [field, def] of Object.entries(resource.attributes)) {
      output.attributes[field] = {
        type: TYPE_MAPPING[def.type] || def.type,
      }
    }

    for (let [rel, def] of Object.entries(resource.relationships)) {
      output.relationships[rel] = {
        inverse: def.inverse,
        model: def.resource,
        kind: def.type === "many" ? "hasMany" : "hasOne",
      }
    }
  }

  output.addImportDeclaration({
    moduleSpecifier: "@orbit/records",
    namedImports: ["ModelDefinition"],
  })
  output.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: "Models",
        type: "Record<string, ModelDefinition>",
        initializer: JSON.stringify(result, null, 2),
      },
    ],
    isExported: true,
  })

  const formatted = Prettier.format(output.print(), {
    parser: "typescript",
  })
  output.delete()
  return formatted
}
