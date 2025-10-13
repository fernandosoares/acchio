import { Adapter, AcchioRequestConfig, AcchioResponse } from "../core/types";

export function createNodeAdapter(): Adapter {
  if (typeof process === "undefined" || !process.versions?.node) {
    throw new Error("NodeAdapter can only be used in Node.js environment");
  }

  const { URL } = require("url");
  const https = require("https");
  const http = require("http");

  class NodeAdapter implements Adapter {
    async request(config: AcchioRequestConfig): Promise<AcchioResponse> {
      return new Promise((resolve, reject) => {
        const url = new URL(config.url!, config.baseURL);

        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === "https:" ? 443 : 80),
          path: url.pathname + url.search,
          method: config.method?.toUpperCase() || "GET",
          headers: config.headers || {},
          timeout: config.timeout,
        };

        const protocol = url.protocol === "https:" ? https : http;

        const req = protocol.request(options, (res: any) => {
          let data = "";

          res.on("data", (chunk: Buffer) => {
            data += chunk.toString();
          });

          res.on("end", () => {
            let responseData: any = data;
            const contentType = res.headers["content-type"];

            if (
              config.responseType === "json" ||
              (contentType?.includes("application/json") &&
                !config.responseType)
            ) {
              try {
                responseData = data ? JSON.parse(data) : null;
              } catch {
                // Mantém como string se falhar
              }
            } else if (
              config.responseType === "xml" ||
              ((contentType?.includes("application/xml") ||
                contentType?.includes("text/xml")) &&
                !config.responseType)
            ) {
              responseData = data;
            }

            const response: AcchioResponse = {
              data: responseData,
              status: res.statusCode!,
              statusText: res.statusMessage!,
              headers: res.headers as Record<string, string>,
              config: config,
              request: req,
            };

            // ✅ CORREÇÃO: Verificar se o status HTTP indica erro
            if (res.statusCode && res.statusCode >= 400) {
              // Para status 4xx/5xx, rejeitar a Promise
              const error = this.createError(
                `Request failed with status code ${res.statusCode}`,
                config,
                `HTTP_${res.statusCode}`,
                req,
                response
              );
              reject(error);
            } else {
              // Para status 2xx/3xx, resolver normalmente
              resolve(response);
            }
          });
        });

        req.on("error", (error: Error) => {
          reject(error);
        });

        req.on("timeout", () => {
          req.destroy();
          reject(new Error(`Timeout of ${config.timeout}ms exceeded`));
        });

        if (config.data) {
          const bodyData =
            typeof config.data === "string"
              ? config.data
              : JSON.stringify(config.data);
          req.write(bodyData);
        }

        req.end();
      });
    }

    // ✅ Adicionar método createError para consistência
    private createError(
      message: string,
      config: AcchioRequestConfig,
      code?: string,
      request?: any,
      response?: AcchioResponse
    ) {
      const error = new Error(message) as any;
      error.config = config;
      error.code = code;
      error.request = request;
      error.response = response;
      error.isAcchioError = true;
      return error;
    }
  }

  return new NodeAdapter();
}
