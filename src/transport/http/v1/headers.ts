import { MappedParser, PassThroughParser } from "../../../parsers";

const TYPE = "ce-type";
const SPEC_VERSION = "ce-specversion";
const SOURCE = "ce-source";
const ID = "ce-id";
const TIME = "ce-time";
const DATA_SCHEMA = "ce-dataschema";
const SUBJECT = "ce-subject";
const HEADER_CONTENT_TYPE = "content-type";

export const BINARY_HEADERS = Object.freeze({
  TYPE, SPEC_VERSION, SOURCE, ID, TIME, DATA_SCHEMA, SUBJECT
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
headerMap.set("dataContentType", parser(HEADER_CONTENT_TYPE));
headerMap.set("subject", parser(SUBJECT));
headerMap.set("type", parser(TYPE));
headerMap.set("specversion", parser(SPEC_VERSION));
headerMap.set("source", parser(SOURCE));
headerMap.set("id", parser(ID));
headerMap.set("time", parser(TIME));
headerMap.set("dataSchema", parser(DATA_SCHEMA));
