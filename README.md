# Anchor
Anchor is a code generation tool for `JSON:API`. It allows you to define your schema once and generate code for all the places where you need to reference it.

It currently supports

- **JSON Schema** - Generate validators for different create/read/update operations
- **Typescript** - Generate types for different create/read/update operations
- **OrbitJS** - Generate a schema that can be loaded into [orbitjs](https://orbitjs.com/)

### Installation
```bash
# npm
npm install --save-dev @ironbay/anchor

# yarn
yarn add --dev @ironbay/anchor
``` 

### Config
Anchor works by referencing a config file defined in typescript.

#### Example
```typescript
import { Config } from "@ironbay/anchor"

export default Config.define({
  outputs: {
    typescript: ["api/src/anchor.ts"],
    jsonschema: ["api/src/anchor.json"],
    orbit: ["react/src/models.ts"],
  },
  
  resources: [
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
          ops: {
            create: "required"
          }
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
})
```
Documentation on the format of this is a work in progress but for now Typescript can help you define this correcty so you should be able to use intellisense to explore the structure.  The attribute type definition follows jsonschema and has an additional `ops` field to define what actions can be taken on the attribute.

### Generate
Generating code is done by calling `anchor gen ./anchor.config.ts`. It's useful to add this as a script to your `package.json`
```json
"scripts": {
  "anchor:gen": "anchor gen ./anchor.config.ts"
}
```
