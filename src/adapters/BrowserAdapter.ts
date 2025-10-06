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

      // Handle different response types
      if (config.responseType === "text") {
        data = await response.text();
      } else if (config.responseType === "blob") {
        data = await response.blob();
      } else if (config.responseType === "arraybuffer") {
        data = await response.arrayBuffer();
      } else if (config.responseType === "xml") {
        // ✅ NOVO: Suporte a XML
        const text = await response.text();
        data = this.parseXML(text);
      } else {
        // Default: try to parse as JSON or fallback to text
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
          // ✅ NOVO: Detecta XML automaticamente
          data = this.parseXML(text);
        } else {
          data = text;
        }
      }

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers,
        config,
        request: response,
      };
    } catch (error) {
      throw error;
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

  // ✅ NOVO: Método para parsear XML
  private parseXML(xmlString: string): Document | string {
    // Tenta usar o DOMParser do browser
    if (typeof window !== "undefined" && window.DOMParser) {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        // Verifica se há erros de parse
        const parseError = xmlDoc.getElementsByTagName("parsererror")[0];
        if (parseError) {
          console.warn("XML parse error:", parseError.textContent);
          return xmlString; // Retorna como string se houver erro
        }

        return xmlDoc;
      } catch (error) {
        console.warn("Failed to parse XML:", error);
        return xmlString; // Fallback para string
      }
    } else {
      // Em ambiente Node.js ou sem DOMParser, retorna como string
      return xmlString;
    }
  }
}
