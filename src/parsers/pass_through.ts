import { Parser } from "./parser";

export class PassThroughParser extends Parser {
  parse(payload: any): any { return payload; }
}