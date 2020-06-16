import { PassThroughParser, MappedParser } from "../../../parsers";

const TYPE = "ce-type";
const SPEC_VERSION = "ce-specversion";
const SOURCE = "ce-source";
const ID = "ce-id";
const TIME = "ce-time";
const SUBJECT = "ce-subject";
const HEADER_CONTENT_TYPE = "content-type";
const CONTENT_ENCODING = "ce-datacontentencoding";
const SCHEMA_URL = "ce-schemaurl";

export const BINARY_HEADERS = Object.freeze({
  TYPE, SPEC_VERSION, SOURCE, ID, TIME, CONTENT_ENCODING, SUBJECT, SCHEMA_URL
});

const passThrough = new PassThroughParser();
function parser(header: string, parser = passThrough): MappedParser {
  return { name: header, parser };
}

/**
 * A utility Map used to retrieve the header names for a CloudEvent
 * using the CloudEvent getter function.
 */
export const headerMap: Map<string, MappedParser> = new Map();
headerMap.set("datacontenttype", parser(HEADER_CONTENT_TYPE));
headerMap.set("datacontentencoding", parser(CONTENT_ENCODING));
headerMap.set("subject", parser(SUBJECT));
headerMap.set("type", parser(TYPE));
headerMap.set("specversion", parser(SPEC_VERSION));
headerMap.set("source", parser(SOURCE));
headerMap.set("id", parser(ID));
headerMap.set("time", parser(TIME));
headerMap.set("schemaurl", parser(SCHEMA_URL));
