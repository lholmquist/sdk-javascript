import { Parser } from "./parser";
import { JSONParser } from "./json";
import { PassThroughParser } from "./pass_through";
import { Base64Parser } from "./base64";

export * from "./parser";
export * from "./base64";
export * from "./json";
export * from "./date";
export * from "./mapped";
export * from "./pass_through";

export const parserByContentType: { [key: string]: Parser } = {
  "application/json": new JSONParser(),
  "application/cloudevents+json": new JSONParser(),
  "application/octet-stream": new PassThroughParser()
};

export const parserByEncoding: { [key: string]: { [key: string]: Parser } } = {
  base64: {
    "application/json": new JSONParser(new Base64Parser()),
    "application/octet-stream": new PassThroughParser()
  }
};

