import { Adapter, AcchioRequestConfig, AcchioResponse } from "../core/types";

export class BrowserAdapter implements Adapter {
  async request(config: AcchioRequestConfig): Promise<AcchioResponse> {
    const fullUrl = this.buildFullURL(config);

    const init: RequestInit = {
      method: config.method?.toUpperCase() || "GET",
      headers: config.headers as Record<string, string>,
    };

    if (config.withCredentials) {
      init.credentials = "include";
    }

    if (config.data && !["GET", "HEAD"].includes(config.method || "GET")) {
      init.body =
        typeof config.data === "string"
          ? config.data
          : JSON.stringify(config.data);
    }

    if (config.timeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), config.timeout);
      init.signal = controller.signal;
    }

    try {
      const response = await fetch(fullUrl, init);

      let data: any;
      const contentType = response.headers.get("content-type");

      if (config.responseType === "text") {
        data = await response.text();
      } else if (config.responseType === "blob") {
        data = await response.blob();
      } else if (config.responseType === "arraybuffer") {
        data = await response.arrayBuffer();
      } else if (config.responseType === "xml") {
        const text = await response.text();
        data = this.parseXML(text);
      } else {
        const text = await response.text();
        if (contentType?.includes("application/json")) {
          try {
            data = text ? JSON.parse(text) : null;
          } catch {
            data = text;
          }
        } else if (
          contentType?.includes("application/xml") ||
          contentType?.includes("text/xml")
        ) {
          data = this.parseXML(text);
        } else {
          data = text;
        }
      }

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const acchioResponse: AcchioResponse = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers,
        config,
        request: response,
      };

      if (!response.ok) {
        // Para status 4xx/5xx, criar um erro
        throw this.createError(
          `Request failed with status code ${response.status}`,
          config,
          `HTTP_${response.status}`,
          null,
          acchioResponse
        );
      }

      return acchioResponse;
    } catch (error) {
      if (error && typeof error === "object" && "isAcchioError" in error) {
        throw error;
      }

      throw this.createError(
        error instanceof Error ? error.message : "Network Error",
        config,
        "NETWORK_ERROR",
        error
      );
    }
  }

  private buildFullURL(config: AcchioRequestConfig): string {
    let url = config.url || "";

    if (config.baseURL) {
      url = `${config.baseURL}${url}`;
    }

    if (config.params) {
      const searchParams = new URLSearchParams();
      Object.keys(config.params).forEach((key) => {
        const value = config.params![key];
        if (value !== null && value !== undefined) {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }

    return url;
  }

  private parseXML(xmlString: string): Document | string {
    if (typeof window !== "undefined" && window.DOMParser) {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        const parseError = xmlDoc.getElementsByTagName("parsererror")[0];
        if (parseError) {
          console.warn("XML parse error:", parseError.textContent);
          return xmlString;
        }

        return xmlDoc;
      } catch (error) {
        console.warn("Failed to parse XML:", error);
        return xmlString;
      }
    } else {
      return xmlString;
    }
  }

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
