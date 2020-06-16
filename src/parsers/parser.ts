export abstract class Parser {
  abstract parse(payload: object|string): any;
}