import { v4 as uuidv4 } from "uuid";

import { CloudEventV1, validateV1, CloudEventV1Attributes } from "./v1";
import { CloudEventV03, validateV03, CloudEventV03Attributes } from "./v03";
import { ValidationError, isBinary, asBase64 } from "./validation";
import CONSTANTS from "../constants";
import { isString } from "util";

/**
 * An enum representing the CloudEvent specification version
 */
export const enum Version {
  V1 = "1.0",
  V03 = "0.3",
}

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
  dataschema?: string;
  subject?: string;
  _time?: string | Date;
  _data?: Record<string, unknown | string | number | boolean> | string | number | boolean | null | unknown;
  data_base64?: string;

  // Extensions should not exist as it's own object, but instead
  // exist as properties on the event as siblings of the others
  [key: string]: unknown;

  // V03 deprecated attributes
  schemaurl?: string;
  datacontentencoding?: string;

  constructor(event: CloudEventV1 | CloudEventV1Attributes | CloudEventV03 | CloudEventV03Attributes) {
    // copy the incoming event so that we can delete properties as we go
    // everything left after we have deleted know properties becomes an extension
    const properties = { ...event };

    this.id = (properties.id as string) || uuidv4();
    delete properties.id;

    this.type = properties.type;
    delete properties.type;

    this.source = properties.source;
    delete properties.source;

    this.specversion = (properties.specversion as Version) || Version.V1;
    delete properties.specversion;

    this.datacontenttype = properties.datacontenttype;
    delete properties.datacontenttype;

    this.subject = properties.subject;
    delete properties.subject;

    this._time = properties.time;
    delete properties.time;

    this.datacontentencoding = properties.datacontentencoding as string;
    delete properties.datacontentencoding;

    this.dataschema = properties.dataschema as string;
    delete properties.dataschema;

    this.data_base64 = properties.data_base64 as string;
    delete properties.data_base64;

    this.schemaurl = properties.schemaurl as string;
    delete properties.schemaurl;

    this._setData(properties.data);
    delete properties.data;

    // Make sure time has a default value and whatever is provided is formatted
    if (!this._time) {
      this._time = new Date().toISOString();
    } else if (this._time instanceof Date) {
      this._time = this._time.toISOString();
    }

    // sanity checking
    if (this.specversion === Version.V1 && this.schemaurl) {
      throw new TypeError("cannot set schemaurl on version 1.0 event");
    } else if (this.specversion === Version.V03 && this.dataschema) {
      throw new TypeError("cannot set dataschema on version 0.3 event");
    }

    // finally process any remaining properties - these are extensions
    for (const [key, value] of Object.entries(properties)) {
      this[key] = value;
    }

    this.validate();

    return new Proxy(this, {
      // obj is the instance of the CloudEvent
      // prop is the property being set
      // value is the value on the right side of the equal sign
      set: function (obj, prop: string, value) {
        // Make a copy of the incoming Object
        const updateObj = { ...obj };
        // Update it with the new value
        updateObj[prop] = value;

        // Validate the object
        obj.validate(updateObj);

        // If we succeed, then Update the real object
        // Set the new value normally
        obj[prop] = value;

        return true;
      },
    });
  }

  get time(): string | Date {
    return this._time as string | Date;
  }

  set time(val: string | Date) {
    this._time = new Date(val).toISOString();
  }

  get data(): unknown {
    if (
      this.datacontenttype === CONSTANTS.MIME_JSON &&
      !(this.datacontentencoding === CONSTANTS.ENCODING_BASE64) &&
      isString(this._data)
    ) {
      return JSON.parse(this._data as string);
    } else if (isBinary(this._data)) {
      return asBase64(this._data as Uint32Array);
    }
    return this._data;
  }

  set data(value: unknown) {
    this._setData(value);
  }

  private _setData(value: unknown): void {
    if (isBinary(value)) {
      this._data = value;
      this.data_base64 = asBase64(value as Uint32Array);
    }
    this._data = value;
  }

  toJSON(): Record<string, unknown> {
    const event = { ...this };
    event.time = this.time;
    event.data = this.data;
    return event;
  }

  toString(): string {
    return JSON.stringify(this);
  }

  /**
   * Validates this CloudEvent against the schema
   * @throws if the CloudEvent does not conform to the schema
   * @return {boolean} true if this event is valid
   */
  public validate(cloudEvent?: CloudEvent): boolean {
    if (!cloudEvent) {
      cloudEvent = this;
    }

    try {
      if (cloudEvent.specversion === Version.V1) {
        return validateV1(cloudEvent);
      } else if (cloudEvent.specversion === Version.V03) {
        return validateV03(cloudEvent);
      }
      throw new ValidationError("invalid payload");
    } catch (e) {
      if (e instanceof ValidationError) {
        throw e;
      } else {
        throw new ValidationError("invalid payload", e);
      }
    }
  }
}
