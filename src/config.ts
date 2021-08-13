import { rmSync } from "fs"
import { Project } from "ts-morph"
import { SchemaDefinition } from "./schema"
import * as Generate from "./generate"

export type Definition = {
  resources: SchemaDefinition
  outputs: { [key in keyof typeof Generate]?: string[] }
}

export function define(config: Definition) {
  return config
}

export function load(path: string): Definition {
  const project = new Project({})
  const source = project.addSourceFileAtPath(path)
  source.emitSync()
  const [compiled] = source.getEmitOutput().getOutputFiles()
  const config = require(compiled.getFilePath())
  rmSync(compiled.getFilePath())
  return config.default
}
