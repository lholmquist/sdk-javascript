import { Base64Parser } from "./base64";
import {
  isString,
  isDefinedOrThrow,
  isStringOrObjectOrThrow,
  ValidationError
} from "../event/validation";
import { Parser } from "./parser";

const invalidPayloadTypeError = new ValidationError("invalid payload type, allowed are: string or object");
const nullOrUndefinedPayload = new ValidationError("null or undefined payload");

const parseJSON = (v: object|string): string => (isString(v) ? JSON.parse(v as string) : v);

export class JSONParser implements Parser {
  decorator?: Base64Parser
  constructor(decorator?: Base64Parser) {
    this.decorator = decorator;
  }

  /**
   * Parses the payload with an optional decorator
   * @param {object|string} payload the JSON payload
   * @return {object} the parsed JSON payload.
   */
  parse(payload: object|string): string {
    if (this.decorator) {
      payload = this.decorator.parse(payload);
    }

    isDefinedOrThrow(payload, nullOrUndefinedPayload);
    isStringOrObjectOrThrow(payload, invalidPayloadTypeError);
    return parseJSON(payload);
  }
}
