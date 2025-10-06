import {
  AcchioInstance,
  AcchioRequestConfig,
  AcchioResponse,
  HttpMethod,
  DEFAULT_CONFIG,
} from "./types";
import { InterceptorManager } from "../utils/interceptors";
import { mergeConfig, createError } from "../utils/helpers";
import { BrowserAdapter } from "../adapters/BrowserAdapter";
import { createNodeAdapter } from "../adapters/NodeAdapter";

// Detecção de ambiente que não quebra o bundle
function isNodeEnvironment(): boolean {
  return (
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null
  );
}

function isBrowserEnvironment(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.document !== "undefined" &&
    typeof window.fetch === "function"
  );
}

function getAdapter(config: AcchioRequestConfig): any {
  // Se o adapter foi especificado explicitamente
  if (config.adapter === "browser") {
    return new BrowserAdapter();
  }

  if (config.adapter === "node") {
    if (!isNodeEnvironment()) {
      throw new Error("NodeAdapter requested but not in Node.js environment");
    }
    return createNodeAdapter();
  }

  // Detecção automática
  if (isBrowserEnvironment()) {
    return new BrowserAdapter();
  }

  if (isNodeEnvironment()) {
    return createNodeAdapter();
  }

  // Fallback para BrowserAdapter (mais comum)
  console.warn("Environment detection failed, falling back to BrowserAdapter");
  return new BrowserAdapter();
}

export class AcchioInstanceImpl implements AcchioInstance {
  public defaults: AcchioRequestConfig;
  public interceptors: {
    request: InterceptorManager<AcchioRequestConfig>;
    response: InterceptorManager<AcchioResponse>;
  };

  private adapter: any;

  constructor(config: AcchioRequestConfig = {}) {
    this.defaults = mergeConfig(DEFAULT_CONFIG, config);
    this.interceptors = {
      request: new InterceptorManager<AcchioRequestConfig>(),
      response: new InterceptorManager<AcchioResponse>(),
    };

    try {
      this.adapter = getAdapter(this.defaults);
    } catch (error) {
      console.warn(
        "Failed to create adapter, falling back to BrowserAdapter:",
        error
      );
      this.adapter = new BrowserAdapter();
    }
  }

  async request<T = any, R = AcchioResponse<T>>(
    config: AcchioRequestConfig
  ): Promise<R> {
    // Merge com defaults
    const mergedConfig = mergeConfig(this.defaults, config);

    // Check for cancellation before starting
    if (mergedConfig.cancelToken) {
      mergedConfig.cancelToken.throwIfRequested();
    }

    // Apply request interceptors
    let requestConfig = mergedConfig;

    const requestInterceptorChain: any[] = [];
    this.interceptors.request.forEach((interceptor) => {
      requestInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });

    let promise = Promise.resolve(requestConfig);

    while (requestInterceptorChain.length) {
      const fulfilled = requestInterceptorChain.shift();
      const rejected = requestInterceptorChain.shift();

      promise = promise.then(fulfilled, rejected);
    }

    // Add cancellation check after interceptors
    promise = promise.then((config) => {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
      return config;
    });

    try {
      requestConfig = await promise;

      // Make the request with cancellation support
      let response: AcchioResponse;

      if (requestConfig.cancelToken) {
        // Wrap the adapter request with cancellation
        const adapterRequest = this.adapter.request(requestConfig);
        const cancelPromise = new Promise<never>((_, reject) => {
          requestConfig.cancelToken!.promise.then(reject);
        });

        response = await Promise.race([adapterRequest, cancelPromise]);
      } else {
        response = await this.adapter.request(requestConfig);
      }

      // Apply response interceptors
      const responseInterceptorChain: any[] = [];
      this.interceptors.response.forEach((interceptor) => {
        responseInterceptorChain.push(
          interceptor.fulfilled,
          interceptor.rejected
        );
      });

      let responsePromise: Promise<AcchioResponse> = Promise.resolve(response);

      while (responseInterceptorChain.length) {
        const fulfilled = responseInterceptorChain.shift();
        const rejected = responseInterceptorChain.shift();

        responsePromise = responsePromise.then(fulfilled, rejected);
      }

      const finalResponse = await responsePromise;
      return finalResponse as R;
    } catch (error) {
      // Apply response error interceptors
      const responseInterceptorChain: any[] = [];
      this.interceptors.response.forEach((interceptor) => {
        if (interceptor.rejected) {
          responseInterceptorChain.push(undefined, interceptor.rejected);
        }
      });

      let errorPromise = Promise.reject(error);

      while (responseInterceptorChain.length) {
        const rejected = responseInterceptorChain.pop();
        const fulfilled = responseInterceptorChain.pop();

        errorPromise = errorPromise.then(fulfilled, rejected);
      }

      throw await errorPromise.catch((err) => err);
    }
  }

  get<T = any, R = AcchioResponse<T>>(
    url: string,
    config?: AcchioRequestConfig
  ): Promise<R> {
    return this.request({ ...config, method: "GET", url });
  }

  post<T = any, R = AcchioResponse<T>>(
    url: string,
    data?: any,
    config?: AcchioRequestConfig
  ): Promise<R> {
    return this.request({ ...config, method: "POST", url, data });
  }

  put<T = any, R = AcchioResponse<T>>(
    url: string,
    data?: any,
    config?: AcchioRequestConfig
  ): Promise<R> {
    return this.request({ ...config, method: "PUT", url, data });
  }

  patch<T = any, R = AcchioResponse<T>>(
    url: string,
    data?: any,
    config?: AcchioRequestConfig
  ): Promise<R> {
    return this.request({ ...config, method: "PATCH", url, data });
  }

  delete<T = any, R = AcchioResponse<T>>(
    url: string,
    config?: AcchioRequestConfig
  ): Promise<R> {
    return this.request({ ...config, method: "DELETE", url });
  }

  head<T = any, R = AcchioResponse<T>>(
    url: string,
    config?: AcchioRequestConfig
  ): Promise<R> {
    return this.request({ ...config, method: "HEAD", url });
  }

  options<T = any, R = AcchioResponse<T>>(
    url: string,
    config?: AcchioRequestConfig
  ): Promise<R> {
    return this.request({ ...config, method: "OPTIONS", url });
  }

  create(config?: AcchioRequestConfig): AcchioInstance {
    return new AcchioInstanceImpl(config);
  }
}
