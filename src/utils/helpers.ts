import { AcchioError, AcchioRequestConfig } from "../core/types";

export function createError(
  message: string,
  config: AcchioRequestConfig,
  code?: string,
  request?: any,
  response?: any
): AcchioError {
  const error = new Error(message) as AcchioError;
  error.config = config;
  error.code = code;
  error.request = request;
  error.response = response;
  error.isAcchioError = true;
  return error;
}

export function buildURL(url: string, params?: Record<string, any>): string {
  if (!params) return url;

  const serializedParams = Object.keys(params)
    .map((key) => {
      const value = params[key];
      if (value === null || value === undefined) return "";
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .filter(Boolean)
    .join("&");

  if (!serializedParams) return url;

  const separator = url.includes("?") ? "&" : "?";
  return url + separator + serializedParams;
}

export function mergeConfig(
  defaults: AcchioRequestConfig,
  config: AcchioRequestConfig
): AcchioRequestConfig {
  return {
    ...defaults,
    ...config,
    headers: { ...defaults.headers, ...config.headers },
  };
}

export function isPlainObject(value: any): boolean {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
