import { MappedParser, DateParser, PassThroughParser } from "../../../parsers";
import { BINARY_HEADERS } from "./headers";

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
binaryParsers.set(BINARY_HEADERS.SCHEMA_URL, parser("schemaURL"));
binaryParsers.set(BINARY_HEADERS.SUBJECT, parser("subject"));
binaryParsers.set(BINARY_HEADERS.CONTENT_ENCODING, parser("dataContentEncoding"));
binaryParsers.set("content-type", parser("dataContentType"));

const structuredParsers: Map<string, MappedParser> = new Map();
structuredParsers.set("type", parser("type"));
structuredParsers.set("specversion", parser("specversion"));
structuredParsers.set("source", parser("source"));
structuredParsers.set("id", parser("id"));
structuredParsers.set("time", parser("time", new DateParser()));
structuredParsers.set("schemaurl", parser("schemaURL"));
structuredParsers.set("datacontentencoding", parser("dataContentEncoding"));
structuredParsers.set("subject", parser("subject"));
structuredParsers.set("data", parser("data"));

export {
  binaryParsers,
  structuredParsers
};
