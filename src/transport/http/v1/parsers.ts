import { BINARY_HEADERS } from "./headers";
import { PassThroughParser, DateParser, MappedParser } from "../../../parsers";

const passThrough = new PassThroughParser();

function parser(name: string, parser = passThrough): MappedParser {
  return { name: name, parser: parser};
}

const binaryParsers: Map<string, MappedParser> = new Map();
binaryParsers.set(BINARY_HEADERS.TYPE, parser("type"));
binaryParsers.set(BINARY_HEADERS.SPEC_VERSION, parser("specversion"));
binaryParsers.set(BINARY_HEADERS.SOURCE, parser("source"));
binaryParsers.set(BINARY_HEADERS.ID, parser("id"));
binaryParsers.set(BINARY_HEADERS.TIME, parser("time", new DateParser()));
binaryParsers.set(BINARY_HEADERS.DATA_SCHEMA, parser("dataschema"));
binaryParsers.set(BINARY_HEADERS.SUBJECT, parser("subject"));
binaryParsers.set("datacontenttype", parser("datacontenttype"));
binaryParsers.set("content-type", parser("datacontenttype"));

const structuredParsers: Map<string, MappedParser> = new Map();
structuredParsers.set("type", parser("type"));
structuredParsers.set("specversion", parser("specversion"));
structuredParsers.set("source", parser("source"));
structuredParsers.set("id", parser("id"));
structuredParsers.set("time", parser("time", new DateParser()));
structuredParsers.set("dataschema", parser("dataschema"));
structuredParsers.set("datacontenttype", parser("datacontenttype"));
structuredParsers.set("subject", parser("subject"));
structuredParsers.set("data", parser("data"));
structuredParsers.set("data_base64", parser("data_base64"));

export {
  structuredParsers,
  binaryParsers
};
