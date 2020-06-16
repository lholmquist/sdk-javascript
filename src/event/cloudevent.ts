const { v4: uuidv4 } = require("uuid");

import { CloudEventV1, validate as validateV1, CloudEventV1Attributes } from "./v1";
import { CloudEventV03, validate as validateV03, CloudEventV03Attributes } from "./v03";
import Extensions from "./extensions";

export const enum Version { V1 = "1.0", V03 = "0.3" };

/**
 * A CloudEvent describes event data in common formats to provide
 * interoperability across services, platforms and systems.
 * @see https://github.com/cloudevents/spec/blob/v1.0/spec.md
 */
export class CloudEvent implements CloudEventV1, CloudEventV03 {
  id: string;
  type: string;
  source: string;
  specversion: Version;
  datacontenttype?: string;
  dataschema?: string; // TODO: Is a URI type needed?
  subject?: string;
  time?: string|Date;
  data?: any;
  data_base64?: any;
  extensions?: Extensions;

  // V03 deprecated attributes
  schemaurl?: string;
  datacontentencoding?: string;

  constructor(event: CloudEventV1 | CloudEventV03) {
    this.id = event.id || uuidv4();
    this.type = event.type;
    this.source = event.source;
    this.specversion = event.specversion as Version || Version.V1;
    this.datacontenttype = event.datacontenttype;
    this.subject = event.subject;
    this.time = event.time;
    this.data = event.data;
    // @ts-ignore - dataSchema is not on a CloudEventV03
    this.dataSchema = event.dataschema;
    // @ts-ignore - dataBase64 is not on CloudEventV03
    this.data_base64 = event.data_base64;

    if (!this.time) {
      this.time = new Date().toISOString();
    } else if (this.time instanceof Date) {
      this.time = this.time.toISOString();
    }

    // @ts-ignore - dataContentEncoding is not on a CloudEventV1
    this.datacontentencoding = event.datacontentencoding;
    // @ts-ignore - schemaURL is not on a CloudEventV1
    this.schemaurl = event.schemaurl;

    this.extensions = { ...event.extensions };

    // TODO: Deprecated in 1.0
    // sanity checking
    if (this.specversion === Version.V1 && this.schemaurl) {
      throw new TypeError("cannot set schemaURL on version 1.0 event");
    } else if (this.specversion === Version.V03 && this.dataschema) {
      throw new TypeError("cannot set dataSchema on version 0.3 event");
    }
  }

  /**
   * Validates this CloudEvent against the schema
   * @returns boolean
   * @throws if the CloudEvent does not conform to the schema
   */
  validate(): boolean {
    if (this.specversion === Version.V1) {
      return validateV1(this);
    } else if (this.specversion === Version.V03) {
      return validateV03(this);
    }
    return false;
  }

  public static create(attributes: CloudEventV1Attributes | CloudEventV03Attributes, version?: Version): CloudEvent {
    const defaults = {
      specversion: version || Version.V1,
      id: uuidv4()
    }
    return new CloudEvent({ ...defaults, ...attributes });
  }
}
