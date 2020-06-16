import axios, { AxiosRequestConfig } from "axios";
import { CloudEvent } from "../../event";
import { Options } from "../emitter";
import { asBase64, isBinary } from "../../event/validation";

const defaults = {
  headers: {
    "content-type": "application/cloudevents+json; charset=utf-8"
  }
}

export function emitStructured(event: CloudEvent, options: Options): Promise<object> {
  const config = {
    ...defaults,
    ...options,
    method: "POST",
    data: format(event)
  };
  return axios.request(config as AxiosRequestConfig);
}

function format(event: CloudEvent): string {
  const formatted = JSON.parse(JSON.stringify(event));
  return JSON.stringify(formatted, (key: string, value: any) => {
    if (key === "data" && isBinary(value)) {
      return asBase64(value);
    }
    return value;
  });
}