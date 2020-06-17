import axios, { AxiosRequestConfig } from "axios";

import { CloudEvent, Version } from "../../event";
import { Options } from "../emitter";
import { Headers, headersFor } from "./headers";
import { asData } from "../../event/validation";

export async function emitBinary(event: CloudEvent, options: Options): Promise<object> {
  if (event.specversion !== Version.V1 && event.specversion !== Version.V03) {
    return Promise.reject(`Unknown spec version ${event.specversion}`)
  } else {
    return emit(event, options, headersFor(event));
  }
}

async function emit(event: CloudEvent, options: Options, headers: Headers): Promise<object> {
  const contentType: Headers = { "content-type": "application/json; charset=utf-8" };
  const config = {
    ...options,
    method: "POST",
    headers: { ...contentType, ...headers, ...options.headers as Headers},
    data: asData(event.data, event.datacontenttype as string)
  };
  return axios.request(config as AxiosRequestConfig);
}
