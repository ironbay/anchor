import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  setupFilesAfterEnv: [],
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.*test.(ts|tsx|js)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
}

export default config
