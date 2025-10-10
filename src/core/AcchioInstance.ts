import { BrowserAdapter } from "../adapters/BrowserAdapter";
import { createNodeAdapter } from "../adapters/NodeAdapter";
import { mergeConfig } from "../utils/helpers";
import { InterceptorManager } from "../utils/interceptors";
import {
  AcchioInstance,
  AcchioRequestConfig,
  AcchioResponse,
  DEFAULT_CONFIG,
} from "./types";

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
  if (config.adapter === "browser") {
    return new BrowserAdapter();
  }

  if (config.adapter === "node") {
    if (!isNodeEnvironment()) {
      throw new Error("NodeAdapter requested but not in Node.js environment");
    }
    return createNodeAdapter();
  }

  if (isBrowserEnvironment()) {
    return new BrowserAdapter();
  }

  if (isNodeEnvironment()) {
    return createNodeAdapter();
  }

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
    const mergedConfig = mergeConfig(this.defaults, config);

    // Check for cancellation before starting
    if (mergedConfig.cancelToken) {
      mergedConfig.cancelToken.throwIfRequested();
    }

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

    promise = promise.then((config) => {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
      return config;
    });

    try {
      requestConfig = await promise;

      let response: AcchioResponse;

      if (requestConfig.cancelToken) {
        const adapterRequest = this.adapter.request(requestConfig);
        const cancelPromise = new Promise<never>((_, reject) => {
          requestConfig.cancelToken!.promise.then(reject);
        });

        response = await Promise.race([adapterRequest, cancelPromise]);
      } else {
        response = await this.adapter.request(requestConfig);
      }

      let finalResponse = response;

      const responseInterceptors: Array<{
        fulfilled?: (
          value: AcchioResponse
        ) => AcchioResponse | Promise<AcchioResponse>;
        rejected?: (error: any) => any;
      }> = [];
      this.interceptors.response.forEach((interceptor) => {
        responseInterceptors.push(interceptor);
      });

      for (const interceptor of responseInterceptors) {
        if (interceptor.fulfilled) {
          finalResponse = await interceptor.fulfilled(finalResponse);
        }
      }

      return finalResponse as R;
    } catch (error) {
      let finalError = error;
      let errorHandled = false;

      const responseInterceptors: Array<{
        fulfilled?: (
          value: AcchioResponse
        ) => AcchioResponse | Promise<AcchioResponse>;
        rejected?: (error: any) => any;
      }> = [];
      this.interceptors.response.forEach((interceptor) => {
        responseInterceptors.push(interceptor);
      });

      for (const interceptor of responseInterceptors) {
        if (!errorHandled && interceptor.rejected) {
          try {
            finalError = await interceptor.rejected(finalError);
            errorHandled = true;
          } catch (newError) {
            finalError = newError;
          }
        }
      }

      throw finalError;
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
