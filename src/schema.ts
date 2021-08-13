type AttributeCrud = {
  ops?: {
    /**
     * Defaults to optional
     **/
    create?: "required" | "optional" | "omit"
    // Default required
    read?: "required" | "optional" | "omit"
    // Default optional
    update?: "required" | "optional" | "omit"
  }
}

type AttributeNullable = {
  nullable?: boolean
}

export type AttributeDefinition = AttributeNullable &
  AttributeCrud &
  (
    | AttributeStringDefinition
    | AttributeObjectDefinition
    | AttributeArrayDefinition
    | AttributeBooleanDefinition
    | AttributeIntegerDefinition
    | AttributeNumberDefinition
  )

export type AttributeStringDefinition = {
  type: "string"
  minLength?: number
  maxLength?: number
  pattern?: string
  format?:
    | "uri"
    | "email"
    | "date-time"
    | "time"
    | "date"
    | "duration"
    | "hostname"
    | "uuid"
    | "uri"
    | "uri-reference"
    | "ipv4"
    | "ipv6"
    | "regex"
}

type AttributeNumberDefinitionOpts = {
  minimum?: number
  exclusiveMinimum?: number
  maximum?: number
  exclusiveMaximum?: number
  multipleOf?: number
}

export type AttributeNumberDefinition = AttributeNumberDefinitionOpts & {
  type: "number"
}

export type AttributeIntegerDefinition = AttributeNumberDefinitionOpts & {
  type: "integer"
}

export type AttributeBooleanDefinition = {
  type: "boolean"
}

export type AttributeObjectDefinition = {
  type: "object"
  properties: Record<string, AttributeDefinition>
}

export type AttributeArrayDefinition = {
  type: "array"
  items: AttributeDefinition
}

export type RelationshipDefinition = {
  type: "many" | "one"
  resource: string
  inverse?: string
  // Default false
  nullable?: boolean
}

export type ResourceDefinition = {
  type: string
  ops?: {
    /**
     * Specifies whether this resource can be created
     **/
    create?: boolean
    /**
     * Specifies whether this resource can be read
     **/
    read?: boolean
    /**
     * Specifies whether this resource can be updated
     **/
    update?: boolean
    /**
     * Specifies whether this resource can be deleted
     **/
    delete?: boolean
  }
  /**
   * Attributes that this resource supports
   **/
  attributes: Record<string, AttributeDefinition>
  relationships: Record<string, RelationshipDefinition>
}

export type SchemaDefinition = ResourceDefinition[]
