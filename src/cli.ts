#!/usr/bin/env node

import { program } from "commander"
import { writeFileSync } from "fs"
import path from "path"
import { Generate } from "./generate/generate"
import * as Anchor from "./index"
import chalk from "chalk"

program.command("gen <src>").action((src: string) => {
  const config = Anchor.Config.load(path.resolve(src))
  console.log(
    chalk.cyan(
      "Resources:",
      config.resources.map((item) => item.type).join(", ")
    )
  )
  for (let [type, outputs] of Object.entries(config.outputs)) {
    console.log(chalk.green("Generating", type))
    const g: Generate = Anchor.Generate[type]
    const result = g(config.resources)
    for (let output of outputs) {
      writeFileSync(output, result)
      console.log(chalk.gray("-> Wrote", output))
    }
  }
})

program.parse(process.argv)
