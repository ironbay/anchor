import { Generate, SchemaDefinition } from "../../src"

const schema: SchemaDefinition = [
  {
    type: "user",
    attributes: {
      name: {
        type: "string",
      },
    },
    relationships: {
      posts: {
        type: "many",
        resource: "article",
        inverse: "author",
      },
    },
  },
  {
    type: "post",
    attributes: {
      title: {
        type: "string",
      },
    },
    relationships: {
      author: {
        type: "one",
        resource: "user",
        inverse: "articles",
      },
    },
  },
]

it("typescript", () => {
  const output = Generate.typescript(schema)
  expect(output).toMatchSnapshot()
})

it("jsonschema", () => {
  const output = Generate.jsonschema(schema)
  expect(output).toMatchSnapshot()
})

it("orbit", () => {
  const output = Generate.orbit(schema)
  expect(output).toMatchSnapshot()
})
