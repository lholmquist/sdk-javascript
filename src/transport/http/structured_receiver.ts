import { CloudEvent, Version } from "../..";
import { Headers, validate, sanitize } from "./headers";
import { Parser } from "../../parsers";
import { parserByContentType } from "../../parsers";
import { structuredParsers as v1Parsers } from "./v1/parsers";
import { structuredParsers as v03Parsers } from "./v03/parsers";
import { isString, isBase64 } from "../../event/validation";
import { CloudEventV1, validate as validateV1 } from "../../event/v1";
import { CloudEventV03, validate as validateV03 } from "../../event/v03";


/**
 * A utility class used to receive structured CloudEvents
 * over HTTP.
 * @see {StructuredReceiver}
 */
export class StructuredHTTPReceiver {
  /**
   * The specification version of the incoming cloud event
   */
  version: Version;
  constructor(version: Version = Version.V1) {
    this.version = version;
  }

  /**
   * Creates a new CloudEvent instance based on the provided payload and headers.
   *
   * @param {object} payload the cloud event data payload
   * @param {object} headers  the HTTP headers received for this cloud event
   * @returns {CloudEvent} a new CloudEvent instance for the provided headers and payload
   * @throws {ValidationError} if the payload and header combination do not conform to the spec
   */
  parse(payload: any, headers: Headers) {
    payload = isString(payload) && isBase64(payload)
      ? Buffer.from(payload, "base64").toString()
      : payload;

    // Clone and low case all headers names
    const sanitizedHeaders = sanitize(headers);

    const parser: Parser = parserByContentType[sanitizedHeaders["content-type"]];
    const incoming = parser.parse(payload);

    const eventObj: { [key: string]: any } = { extensions: {} };
    const parserMap = this.version === Version.V1 ? v1Parsers : v03Parsers;
    parserMap.forEach((value, key) => {
      if (incoming[key]) {
        eventObj[value.name] = value.parser.parse(incoming[key]);
        delete incoming[key];
      }
    });
    for (const key in incoming) {
      eventObj.extensions[key] = incoming[key];
    }

    const cloudevent = CloudEvent.create(eventObj as CloudEventV1 | CloudEventV03);
    console.log('EVGEGNTOBJ', eventObj)

    // Validates the event
    this.version === Version.V1 ? validateV1(cloudevent) : validateV03(cloudevent);
    return cloudevent;
  }
}
