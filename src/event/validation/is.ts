const isString = (v: any) => (typeof v) === "string";
const isObject = (v: any) => (typeof v) === "object";
const isDefined = (v: any) => v && (typeof v) !== "undefined";

const isBoolean = (v: any) => (typeof v) === "boolean";
const isInteger = (v: any) => Number.isInteger(v);
const isDate = (v: any) => (v instanceof Date);
const isBinary = (v: any) => (v instanceof Uint32Array);

const isStringOrThrow = (v: any, t: Error) =>
  (isString(v)
    ? true
    : (() => { throw t; })());

const isDefinedOrThrow = (v: any, t: Error) =>
  (isDefined(v)
    ? () => true
    : (() => { throw t; })());

const isStringOrObjectOrThrow = (v: any, t: Error) =>
  (isString(v)
    ? true
    : isObject(v)
      ? true
      : (() => { throw t; })());

const equalsOrThrow = (v1: any, v2: any, t: Error) =>
  (v1 === v2
    ? true
    : (() => { throw t; })());

const isBase64 = (value: any) =>
  Buffer.from(value, "base64").toString("base64") === value;

const isBuffer = (value: any) =>
  value instanceof Buffer;

const asBuffer = (value: string|Buffer|Uint32Array) =>
  isBinary(value)
    ? Buffer.from(value)
    : isBuffer(value)
      ? value
      : (() => { throw new TypeError("is not buffer or a valid binary"); })();

const asBase64 = (value: string|Buffer|Uint32Array) =>
  asBuffer(value).toString("base64");

const clone = (o: object) =>
  JSON.parse(JSON.stringify(o));

const isJsonContentType = (contentType: string) =>
  contentType && contentType.match(/(json)/i);

const asData = (data: any, contentType: string) => {
  // pattern matching alike
  const maybeJson = isString(data) &&
    !isBase64(data) &&
    isJsonContentType(contentType)
    ? JSON.parse(data)
    : data;

  return isBinary(maybeJson)
    ? asBase64(maybeJson)
    : maybeJson;
};

const isValidType = (v: boolean | Number | string | Date | Uint32Array) =>
  (isBoolean(v) || isInteger(v) || isString(v) || isDate(v) || isBinary(v));

export {
  isString,
  isStringOrThrow,
  isObject,
  isDefined,

  isBoolean,
  isInteger,
  isDate,
  isBinary,

  isDefinedOrThrow,
  isStringOrObjectOrThrow,
  isValidType,

  equalsOrThrow,
  isBase64,
  clone,

  asData,
  asBase64
};
