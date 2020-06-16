import { CloudEvent, Version } from "../..";
import { CloudEventV1, validate as validateV1 } from "../../event/v1";
import { CloudEventV03, validate as validateV03 } from "../../event/v03";
import { Headers, validate } from "./headers";
import { binaryParsers as v1Parsers } from "./v1/parsers";
import { binaryParsers as v03Parsers } from "./v03/parsers";
import { parserByContentType, parserByEncoding, MappedParser } from "../../parsers";
import { isString, isBase64 } from "../../event/validation";

/**
 * A class that receives binary CloudEvents over HTTP. This class can be used
 * if you know that all incoming events will be using binary transport. If
 * events can come as either binary or structured, use {HTTPReceiver}.
 */
export class BinaryHTTPReceiver {
  /**
   * The specification version of the incoming cloud event
   */
  version: Version;
  constructor(version: Version = Version.V1) {
    this.version = version;
  }

  /**
   * Parses an incoming HTTP request, converting it to a {CloudEvent}
   * instance if it conforms to the Cloud Event specification for this receiver.
   *
   * @param {Object|string} payload the HTTP request body
   * @param {Object} headers the HTTP request headers
   * @param {Version} version the spec version of the incoming event
   * @returns {CloudEvent} an instance of CloudEvent representing the incoming request
   * @throws {ValidationError} of the event does not conform to the spec
   */
  parse(payload: any, headers: Headers): CloudEvent {
    payload = isString(payload) && isBase64(payload)
      ? Buffer.from(payload, "base64").toString()
      : payload;

    // Clone and low case all headers names
    const sanitizedHeaders = validate(headers);

    const eventObj: { [key: string]: any } = { extensions: {} };
    const parserMap = this.version === Version.V1 ? v1Parsers : v03Parsers;

    parserMap.forEach((mappedParser: MappedParser, header: string) => {
      if (sanitizedHeaders[header]) {
        eventObj[mappedParser.name] = mappedParser.parser.parse(sanitizedHeaders[header]);
        delete sanitizedHeaders[header];
      }
    });

    const parser = parserByContentType[eventObj.datacontenttype];
    const parsedPayload = parser.parse(payload);

    // Every unprocessed header can be an extension
    for (const header in sanitizedHeaders) {
      if (header.startsWith("ce-")) {
        eventObj.extensions[header.substring("ce-".length)] = sanitizedHeaders[header];
      }
    }

    const cloudevent = CloudEvent.create({ ...eventObj, data: parsedPayload } as CloudEventV1|CloudEventV03 );
    this.version === Version.V1 ? validateV1(cloudevent) : validateV03(cloudevent);
    return cloudevent;
  }

}
