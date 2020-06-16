import { ValidationError, CloudEvent } from "../..";
import { headerMap as v1Map } from "./v1";
import { headerMap as v03Map } from "./v03";
import { Version } from "../../event";
import { MappedParser } from "../../parsers";

export interface Headers {
  [key: string]: string
};

export const allowedContentTypes = ["application/json", "application/octet-stream"];
export const requiredHeaders = [ "ce-id", "ce-source", "ce-type", "ce-specversion" ];

export function validate(headers: Headers): Headers {
  const sanitizedHeaders = sanitize(headers);

  // if content-type exists, be sure it's an allowed type
  const contentTypeHeader = sanitizedHeaders["content-type"];
  const noContentType = !allowedContentTypes.includes(contentTypeHeader);
  if (contentTypeHeader && noContentType) {
    throw new ValidationError("invalid content type", [sanitizedHeaders["content-type"]]);
  }

  requiredHeaders
    .filter((required: string) => !sanitizedHeaders[required])
    .forEach((required: string) => {
      throw new ValidationError(`header '${required}' not found`);
    });

  if (!sanitizedHeaders["content-type"]) {
    sanitizedHeaders["content-type"] = "application/json";
  }

  return sanitizedHeaders;
}

/**
 * Returns the HTTP headers that will be sent for this event when the HTTP transmission
 * mode is "binary". Events sent over HTTP in structured mode only have a single CE header
 * and that is "ce-id", corresponding to the event ID.
 * @param {CloudEvent} event a CloudEvent
 * @returns {Object} the headers that will be sent for the event
 */
export function headersFor(event: CloudEvent): Headers {
  const headers: Headers = {};
  let headerMap;
  if (event.specversion === Version.V1) {
    headerMap = v1Map;
  } else {
    headerMap = v03Map;
  }

  headerMap.forEach((mapped: MappedParser, getterName: string) => {
    // @ts-ignore No index signature with a parameter of type 'string' was found on type 'CloudEvent'.
    const value = event[getterName];
    if (value) {
      headers[mapped.name] = mapped.parser.parse(value);
    }
    if (event.extensions) {
      Object.keys(event.extensions)
        .filter((ext) => Object.hasOwnProperty.call(event.extensions, ext))
        .forEach((ext) => {
          headers[`ce-${ext}`] = event.extensions![ext];
        });
    }
  });

  return headers;
}

export function sanitize(headers: Headers) {
  const sanitized: Headers = {};

  Array.from(Object.keys(headers))
    .filter((header) => Object.hasOwnProperty.call(headers, header))
    .forEach((header) => sanitized[header.toLowerCase()] = headers[header]);

  sanitized["content-type"] = sanitizeContentType(sanitized["content-type"]) as string;
  return sanitized;
}

function sanitizeContentType(contentType: string): string|undefined {
  if (contentType) {
    return Array.of(contentType)
      .map((c) => c.split(";"))
      .map((c) => c.shift())
      .shift();
  }
  return contentType;
}
