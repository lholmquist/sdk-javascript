import { Headers } from "./http/headers"
import { CloudEvent, Version, ValidationError } from "..";
import { BinaryHTTPReceiver as BinaryReceiver } from "./http/binary_receiver";
import { StructuredHTTPReceiver as StructuredReceiver } from "./http/structured_receiver";
import { CloudEventV03 } from "../event/v03";
import { CloudEventV1 } from "../event/v1";
import { Protocol } from "./protocols";

export enum Mode {
  BINARY = "binary", STRUCTURED = "structured"
}

/**
 * A class to receive a CloudEvent from an HTTP POST request.
 */
export class Receiver {
  protocol: Protocol;
  receivers: {
    v1: {
      structured: any,
      binary: any,
      [key: string]: any
    },
    v03: {
      structured: any,
      binary: any,
      [key: string]: any
    }
  };

  /**
   * Create an instance of an HTTPReceiver to accept incoming CloudEvents.
   */
  constructor(protocol: Protocol = Protocol.HTTP) {
    // currently unused, but reserved for future protocol implementations
    this.protocol = protocol;
    this.receivers = {
      v1: {
        structured: new StructuredReceiver(Version.V1),
        binary: new BinaryReceiver(Version.V1)
      },
      v03: {
        structured: new StructuredReceiver(Version.V03),
        binary: new BinaryReceiver(Version.V03)
      }
    };
  }
  /**
   * Acceptor for an incoming HTTP CloudEvent POST. Can process
   * binary and structured incoming CloudEvents.
   *
   * @param {Object} headers HTTP headers keyed by header name ("Content-Type")
   * @param {Object|JSON} body The body of the HTTP request
   * @return {CloudEvent} A new {CloudEvent} instance
   */
  accept(headers: Headers, body: string | object | CloudEventV1 | CloudEventV03): CloudEvent {
    const mode: Mode = getMode(headers);
    const version = getVersion(mode, headers, body);
    switch (version) {
      case Version.V1:
        return this.receivers.v1[mode].parse(body, headers);
      case Version.V03:
        return this.receivers.v03[mode].parse(body, headers);
      default:
        console.error(`Unknown spec version ${version}. Default to ${Version.V1}`);
        return this.receivers.v1[mode].parse(body, headers);
    }
  }
}

function getMode(headers: Headers): Mode {
  const contentType = headers["content-type"];
  if (contentType && contentType.startsWith("application/cloudevents")) {
    return Mode.STRUCTURED;
  }
  if (headers["ce-id"]) { return Mode.BINARY; }
  throw new ValidationError("no cloud event detected");
}

function getVersion(mode: Mode, headers: Headers, body: string | object | CloudEventV03 | CloudEventV1) {
  if (mode === Mode.BINARY) {
    // Check the headers for the version
    const versionHeader = headers["ce-specversion"];
    if (versionHeader) {
      return versionHeader;
    }
  } else {
    // structured mode - the version is in the body
    return (typeof body === "string")
      // @ts-ignore
      ? JSON.parse(body).specversion : body.specversion;
  }
  return Version.V1;
}
