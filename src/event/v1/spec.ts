import Ajv from "ajv";
import { v4 as uuidv4 } from "uuid";

import { CloudEvent } from "../cloudevent";
import { CloudEventV1, CloudEventV1Attributes } from "./cloudevent";
import { ValidationError, isValidType } from "../validation";

import Extensions from "../extensions";
import { schema } from "./schema";

const ajv = new Ajv({ extendRefs: true });
const isValidAgainstSchema = ajv.compile(schema);

const RESERVED_ATTRIBUTES = {
  type: "type",
  specversion: "specversion",
  source: "source",
  id: "id",
  time: "time",
  dataschema: "dataschema",
  datacontenttype: "datacontenttype",
  subject: "subject",
  data: "data",
  data_base64: "data_base64"
};

export function create(attributes: CloudEventV1Attributes): CloudEventV1 {
  const event: CloudEventV1 = {
    specversion: schema.definitions.specversion.const,
    id: uuidv4(),
    time: new Date().toISOString(),
    ...attributes
  };
  return new CloudEvent(event);
}

export function validate(event: CloudEventV1): boolean {
  if (!isValidAgainstSchema(event)) {
    throw new ValidationError("invalid payload", isValidAgainstSchema.errors);
  }
  if (event.extensions) checkExtensions(event.extensions);
  return true;
}

function checkExtensions(extensions: Extensions) {
  for (const key in extensions) {
    if (Object.prototype.hasOwnProperty.call(RESERVED_ATTRIBUTES, key)) {
      throw new ValidationError(`Reserved attribute name: '${key}'`);
    }
  }
}
