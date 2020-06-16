import { Parser } from "./parser";

export class Base64Parser implements Parser {
  decorator?: any;

  constructor(decorator?: any) {
    this.decorator = decorator;
  }

  parse(payload: any): string {
    let payloadToParse = payload;
    if (this.decorator) {
      payloadToParse = this.decorator.parse(payload);
    }

    return Buffer.from(payloadToParse, "base64").toString();
  }
}
