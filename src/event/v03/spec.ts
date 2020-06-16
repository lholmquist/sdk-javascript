import { v4 as uuidv4 } from "uuid";
import Ajv from "ajv";
import { ValidationError, isBase64, isValidType } from "../validation";
import { CloudEventV03, CloudEventV03Attributes } from "./cloudevent";
import { CloudEvent } from "../..";

const RESERVED_ATTRIBUTES = {
  type: "type",
  specversion: "specversion",
  source: "source",
  id: "id",
  time: "time",
  schemaurl: "schemaurl",
  datacontentencoding: "datacontentencoding",
  datacontenttype: "datacontenttype",
  subject: "subject",
  data: "data"
};

const SUPPORTED_CONTENT_ENCODING = {
  base64: {
    check: (data: any) => isBase64(data)
  }
};

import { schema } from "./schema";
import Extensions from "../extensions";
const ajv = new Ajv({ extendRefs: true });
const isValidAgainstSchema = ajv.compile(schema);

export function create(attributes: CloudEventV03Attributes) : CloudEventV03 {
  const event: CloudEventV03 = {
    specversion: schema.definitions.specversion.const,
    id: uuidv4(),
    time: new Date().toISOString(),
    ...attributes
  };
  return new CloudEvent(event);
}

export function validate(event: CloudEventV03): boolean {
  if (!isValidAgainstSchema(event)) {
    throw new ValidationError("invalid payload", isValidAgainstSchema.errors);
  }
  if (event.extensions) checkExtensions(event.extensions);
  return true;
}

function checkExtensions(extensions: Extensions) {
  for (const key in extensions) {
    if (!Object.prototype.hasOwnProperty.call(RESERVED_ATTRIBUTES, key)) {
      if (isValidType(extensions[key])) return;
      else throw new ValidationError("Invalid type of extension value");
    } else {
      throw new ValidationError(`Reserved attribute name: '${key}'`);
    }
  }
}
