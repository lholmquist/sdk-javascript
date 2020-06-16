/**
 * A CloudEvent MAY include any number of additional context attributes with distinct names,
 * known as "extension attributes". Extension attributes MUST follow the same naming convention
 * and use the same type system as standard attributes. Extension attributes have no defined
 * meaning in this specification, they allow external systems to attach metadata to an event,
 * much like HTTP custom headers.
 * @see https://github.com/cloudevents/spec/blob/v1.0/spec.md#extension-context-attributes
 */
export default interface Extensions {
  [key: string]: any
}
