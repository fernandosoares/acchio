import { Adapter, AcchioRequestConfig, AcchioResponse } from "../core/types";

// Função factory que só carrega o NodeAdapter quando necessário
export function createNodeAdapter(): Adapter {
  // Verifica se estamos em ambiente Node.js
  if (typeof process === "undefined" || !process.versions?.node) {
    throw new Error("NodeAdapter can only be used in Node.js environment");
  }

  // Dynamic import das dependências Node.js
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
            }
            // ✅ ADICIONADO: XML retorna como string no Node.js (sem parse)
            else if (
              config.responseType === "xml" ||
              ((contentType?.includes("application/xml") ||
                contentType?.includes("text/xml")) &&
                !config.responseType)
            ) {
              // No Node.js, sem xmldom, retornamos como string
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

            resolve(response);
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
  }

  return new NodeAdapter();
}
