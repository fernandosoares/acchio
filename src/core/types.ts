// Tipos específicos para valores com autocomplete FUNCIONAL
export type ContentType =
  | "application/json"
  | "application/xml"
  | "application/x-www-form-urlencoded"
  | "multipart/form-data"
  | "text/plain"
  | "text/html"
  | "text/css"
  | "text/javascript"
  | "application/javascript"
  | "application/octet-stream"
  | "image/png"
  | "image/jpeg"
  | "image/gif"
  | "image/svg+xml"
  | "audio/mpeg"
  | "video/mp4"
  | "application/pdf"
  | "application/zip"
  | (string & {});

export type Authorization =
  | "Bearer"
  | "Basic"
  | "Digest"
  | "HOBA"
  | "Mutual"
  | "AWS4-HMAC-SHA256"
  | (string & {});

export type Accept =
  | "application/json"
  | "application/xml"
  | "text/plain"
  | "text/html"
  | "text/css"
  | "text/javascript"
  | "application/javascript"
  | "image/png"
  | "image/jpeg"
  | "audio/mpeg"
  | "video/mp4"
  | "*/*"
  | (string & {});

export type CacheControl =
  | "no-cache"
  | "no-store"
  | "max-age=0"
  | "must-revalidate"
  | "public"
  | "private"
  | "no-transform"
  | "only-if-cached"
  | "max-age=3600"
  | "max-age=86400"
  | "s-maxage=3600"
  | "stale-while-revalidate=300"
  | (string & {});

export type ContentEncoding =
  | "gzip"
  | "deflate"
  | "br"
  | "identity"
  | "compress"
  | (string & {});

export type Connection = "keep-alive" | "close" | "upgrade" | (string & {});

export type XRequestedWith = "XMLHttpRequest" | (string & {});

export type XFrameOptions =
  | "DENY"
  | "SAMEORIGIN"
  | "ALLOW-FROM https://example.com"
  | (string & {});

export type XContentTypeOptions = "nosniff" | (string & {});

export interface AcchioHeaders {
  // Headers com autocomplete específico
  "A-IM"?: string;
  Accept?: Accept;
  "Accept-Charset"?: string;
  "Accept-Encoding"?: ContentEncoding;
  "Accept-Language"?: string;
  "Accept-Datetime"?: string;
  "Access-Control-Request-Method"?: string;
  "Access-Control-Request-Headers"?: string;
  Authorization?: Authorization;
  "Cache-Control"?: CacheControl;
  Connection?: Connection;
  "Content-Length"?: string;
  "Content-Type"?: ContentType;
  Cookie?: string;
  Date?: string;
  Expect?: string;
  Forwarded?: string;
  From?: string;
  Host?: string;
  "If-Match"?: string;
  "If-Modified-Since"?: string;
  "If-None-Match"?: string;
  "If-Range"?: string;
  "If-Unmodified-Since"?: string;
  "Max-Forwards"?: string;
  Origin?: string;
  Pragma?: string;
  "Proxy-Authorization"?: string;
  Range?: string;
  Referer?: string;
  TE?: string;
  "User-Agent"?: string;
  Upgrade?: string;
  Via?: string;
  Warning?: string;

  // Headers de Autenticação
  "WWW-Authenticate"?: string;
  "Proxy-Authenticate"?: string;

  // Headers de CORS
  "Access-Control-Allow-Origin"?: string;
  "Access-Control-Allow-Credentials"?: string;
  "Access-Control-Expose-Headers"?: string;
  "Access-Control-Max-Age"?: string;
  "Access-Control-Allow-Methods"?: string;
  "Access-Control-Allow-Headers"?: string;

  // Headers de Segurança
  "Strict-Transport-Security"?: string;
  "X-Content-Type-Options"?: XContentTypeOptions;
  "X-Frame-Options"?: XFrameOptions;
  "X-XSS-Protection"?: string;
  "Content-Security-Policy"?: string;
  "X-CSRF-Token"?: string;
  "X-Requested-With"?: XRequestedWith;

  // Headers Customizados (qualquer X-*)
  [key: `X-${string}`]: string | undefined;

  // Fallback para outros headers não listados
  [key: string]: string | undefined;
}

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

export type ResponseType = "json" | "text" | "blob" | "arraybuffer" | "xml";

export interface AcchioRequestConfig {
  url?: string;
  method?: HttpMethod;
  baseURL?: string;
  headers?: AcchioHeaders;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: ResponseType;
  validateStatus?: (status: number) => boolean;
  transformRequest?: Array<(data: any, headers?: AcchioHeaders) => any>;
  transformResponse?: Array<(data: any) => any>;
  adapter?: "node" | "browser" | "auto";
  maxRedirects?: number;
  decompress?: boolean;
  cancelToken?: AcchioCancelToken;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
  onDownloadProgress?: (progressEvent: ProgressEvent) => void;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  maxContentLength?: number;
  maxBodyLength?: number;
}

export interface AcchioResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AcchioRequestConfig;
  request?: any;
}

export interface AcchioError<T = any> extends Error {
  config: AcchioRequestConfig;
  code?: string;
  request?: any;
  response?: AcchioResponse<T>;
  isAcchioError: boolean;
  toJSON: () => object;
}

export interface AcchioInterceptorManager<V> {
  use(
    onFulfilled?: (value: V) => V | Promise<V>,
    onRejected?: (error: any) => any
  ): number;
  eject(id: number): void;
  clear(): void;
}

export interface AcchioInstance {
  defaults: AcchioRequestConfig;
  interceptors: {
    request: AcchioInterceptorManager<AcchioRequestConfig>;
    response: AcchioInterceptorManager<AcchioResponse>;
  };

  // Método principal
  request<T = any, R = AcchioResponse<T>>(
    config: AcchioRequestConfig
  ): Promise<R>;

  // Métodos HTTP simplificados
  get<T = any, R = AcchioResponse<T>>(
    url: string,
    config?: AcchioRequestConfig
  ): Promise<R>;
  post<T = any, R = AcchioResponse<T>>(
    url: string,
    data?: any,
    config?: AcchioRequestConfig
  ): Promise<R>;
  put<T = any, R = AcchioResponse<T>>(
    url: string,
    data?: any,
    config?: AcchioRequestConfig
  ): Promise<R>;
  patch<T = any, R = AcchioResponse<T>>(
    url: string,
    data?: any,
    config?: AcchioRequestConfig
  ): Promise<R>;
  delete<T = any, R = AcchioResponse<T>>(
    url: string,
    config?: AcchioRequestConfig
  ): Promise<R>;
  head<T = any, R = AcchioResponse<T>>(
    url: string,
    config?: AcchioRequestConfig
  ): Promise<R>;
  options<T = any, R = AcchioResponse<T>>(
    url: string,
    config?: AcchioRequestConfig
  ): Promise<R>;

  // Método para criar novas instâncias
  create(config?: AcchioRequestConfig): AcchioInstance;
}

export interface Adapter {
  request(config: AcchioRequestConfig): Promise<AcchioResponse>;
}

export interface Interceptor<T> {
  fulfilled?: (value: T) => T | Promise<T>;
  rejected?: (error: any) => any;
}

// Tipos para funções de transformação
export type RequestTransformer = (
  data: any,
  headers?: Record<string, string>
) => any;
export type ResponseTransformer = (data: any) => any;

// Tipos para eventos de progresso
export interface ProgressEvent {
  loaded: number;
  total?: number;
  percent?: number;
  bytesPerSecond?: number;
  lengthComputable: boolean;
}

export interface AcchioRequestConfigWithProgress extends AcchioRequestConfig {
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
  onDownloadProgress?: (progressEvent: ProgressEvent) => void;
}

// Tipos para cancelamento de requests
export interface AcchioCancel {
  message?: string;
  __CANCEL__?: boolean;
}

export interface AcchioCancelToken {
  promise: Promise<AcchioCancel>;
  reason?: AcchioCancel;
  throwIfRequested(): void;
}

export interface AcchioCancelTokenSource {
  token: AcchioCancelToken;
  cancel: (message?: string) => void;
}

export interface AcchioCancelStatic {
  new (message?: string): AcchioCancel;
}

export interface AcchioCancelTokenStatic {
  new (
    executor: (cancel: (message?: string) => void) => void
  ): AcchioCancelToken;
  source(): AcchioCancelTokenSource;
}

// Tipos para construtor
export interface AcchioConstructor {
  new (config?: AcchioRequestConfig): AcchioInstance;
  create(config?: AcchioRequestConfig): AcchioInstance;
  defaults: AcchioRequestConfig;
}

// Tipo para o export default
export interface AcchioStatic extends AcchioInstance {
  create(config?: AcchioRequestConfig): AcchioInstance;
  Cancel: AcchioCancelStatic;
  CancelToken: AcchioCancelTokenStatic;
  isCancel(value: any): boolean;
  all<T>(values: Array<T | Promise<T>>): Promise<T[]>;
  spread<T, R>(callback: (...args: T[]) => R): (array: T[]) => R;
}

// Tipos utilitários
export type AcchioPromise<T = any> = Promise<T> & {
  cancel?: () => void;
};

// Configuração global padrão
export const DEFAULT_CONFIG: AcchioRequestConfig = {
  timeout: 0,
  withCredentials: false,
  responseType: "json" as ResponseType,
  maxRedirects: 5,
  decompress: true,
  validateStatus: (status: number) => status >= 200 && status < 300,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
};

// Tipos para métodos auxiliares
export interface AcchioDefaults {
  headers: {
    common: Record<string, string>;
    get: Record<string, string>;
    post: Record<string, string>;
    put: Record<string, string>;
    patch: Record<string, string>;
    delete: Record<string, string>;
    head: Record<string, string>;
    options: Record<string, string>;
  };
}

// Tipos para interceptors
export interface AcchioInterceptor {
  request: AcchioInterceptorManager<AcchioRequestConfig>;
  response: AcchioInterceptorManager<AcchioResponse>;
}

// Tipos para adapters
export type AdapterType = "node" | "browser" | "auto" | Adapter;

// Tipos para transformação de dados
export interface Transformable {
  transformRequest?: RequestTransformer[];
  transformResponse?: ResponseTransformer[];
}

// Tipos para configuração de timeout
export interface TimeoutConfig {
  timeout: number;
  timeoutErrorMessage?: string;
}

// Tipos para retentativas
export interface RetryConfig {
  retries: number;
  retryDelay?: number | ((retryCount: number) => number);
  retryCondition?: (error: AcchioError) => boolean;
}

// Tipos para cache
export interface CacheConfig {
  cache?: boolean;
  cacheMaxAge?: number;
  etag?: boolean;
}

// Tipos para autenticação
export interface AuthConfig {
  username?: string;
  password?: string;
  bearerToken?: string;
  apiKey?: string;
  apiKeyHeader?: string;
}

// Union type para todas as configurações possíveis
export type FullAcchioConfig = AcchioRequestConfig &
  TimeoutConfig &
  RetryConfig &
  CacheConfig &
  AuthConfig;

// Tipos para eventos
export interface AcchioEventMap {
  request: { config: AcchioRequestConfig };
  response: { response: AcchioResponse };
  error: { error: AcchioError };
  cancel: { cancel: AcchioCancel };
}

export type AcchioEvent = keyof AcchioEventMap;

export interface AcchioEventListener<T extends AcchioEvent> {
  (event: AcchioEventMap[T]): void;
}

// Tipos para plugins/middleware
export interface AcchioPlugin {
  (instance: AcchioInstance, config?: AcchioRequestConfig): void;
}

export interface AcchioMiddleware {
  onRequest?: (
    config: AcchioRequestConfig
  ) => AcchioRequestConfig | Promise<AcchioRequestConfig>;
  onResponse?: (
    response: AcchioResponse
  ) => AcchioResponse | Promise<AcchioResponse>;
  onError?: (error: AcchioError) => AcchioError | Promise<AcchioError>;
}

// Tipos para utilitários de URL
export interface URLParamsConfig {
  paramsSerializer?: (params: Record<string, any>) => string;
  encodeParams?: boolean;
}

// Tipos para upload de arquivos
export interface FileUploadConfig {
  file: File | Blob | Buffer;
  fileName?: string;
  fileFieldName?: string;
  formData?: boolean;
}

// Tipos para download
export interface DownloadConfig {
  download?: boolean;
  fileName?: string;
  responseType: "blob" | "arraybuffer";
}

// Tipos para streaming
export interface StreamConfig {
  stream?: boolean;
  onData?: (chunk: any) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

// Tipos para WebSocket-like requests (SSE)
export interface EventSourceConfig {
  eventSource?: boolean;
  onMessage?: (data: any) => void;
  onOpen?: (event: Event) => void;
  onError?: (event: Event) => void;
}

// Tipos para métricas e telemetria
export interface MetricsConfig {
  enableMetrics?: boolean;
  onRequestStart?: (config: AcchioRequestConfig) => void;
  onRequestEnd?: (
    config: AcchioRequestConfig,
    response?: AcchioResponse,
    error?: AcchioError
  ) => void;
  onRequestDuration?: (duration: number, config: AcchioRequestConfig) => void;
}

// Tipo para todas as configurações estendidas
export type ExtendedAcchioConfig = FullAcchioConfig &
  URLParamsConfig &
  FileUploadConfig &
  DownloadConfig &
  StreamConfig &
  EventSourceConfig &
  MetricsConfig;

// Utilitários TypeScript avançados
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type PartialAcchioConfig = DeepPartial<AcchioRequestConfig>;

// Tipos para factory functions
export interface AcchioFactory {
  (config?: AcchioRequestConfig): AcchioInstance;
  create: (config?: AcchioRequestConfig) => AcchioInstance;
}

// Tipos para módulos externos
export interface AcchioModule {
  default: AcchioStatic;
  Acchio: AcchioStatic;
}

// Tipos para ambiente
export type RuntimeEnvironment = "node" | "browser" | "deno" | "unknown";

export interface EnvironmentInfo {
  runtime: RuntimeEnvironment;
  version?: string;
  features: {
    fetch: boolean;
    stream: boolean;
    blob: boolean;
    formData: boolean;
    buffer: boolean;
  };
}

// Tipos para validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Tipos para logging
export interface Logger {
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

export interface LoggingConfig {
  logger?: Logger;
  logLevel?: "debug" | "info" | "warn" | "error" | "silent";
  logRequests?: boolean;
  logResponses?: boolean;
  logErrors?: boolean;
}

// Finalmente, exportamos um tipo geral para configuração completa
export type CompleteAcchioConfig = AcchioRequestConfig &
  TimeoutConfig &
  RetryConfig &
  CacheConfig &
  AuthConfig &
  URLParamsConfig &
  LoggingConfig &
  MetricsConfig;

// Helper types para métodos específicos
export type MethodWithoutData = "get" | "delete" | "head" | "options";
export type MethodWithData = "post" | "put" | "patch";

export type AcchioMethodConfig<T extends HttpMethod> =
  T extends MethodWithoutData
    ? Omit<AcchioRequestConfig, "data">
    : T extends MethodWithData
    ? AcchioRequestConfig
    : never;

// Overloads para melhor tipagem
export interface AcchioRequestOverload {
  <T = any>(config: AcchioRequestConfig): Promise<AcchioResponse<T>>;
  <T = any>(url: string, config?: AcchioRequestConfig): Promise<
    AcchioResponse<T>
  >;
}

export interface AcchioGetOverload {
  <T = any>(url: string, config?: AcchioRequestConfig): Promise<
    AcchioResponse<T>
  >;
}

export interface AcchioPostOverload {
  <T = any>(url: string, data?: any, config?: AcchioRequestConfig): Promise<
    AcchioResponse<T>
  >;
}

// Generic constraints
export type Stringifiable = string | number | boolean | null | undefined;
export type ParamValue =
  | Stringifiable
  | Stringifiable[]
  | { [key: string]: ParamValue };

// Mapeamento de métodos HTTP para seus tipos de dados
export interface HttpMethodDataMap {
  GET: { hasData: false };
  DELETE: { hasData: false };
  HEAD: { hasData: false };
  OPTIONS: { hasData: false };
  POST: { hasData: true };
  PUT: { hasData: true };
  PATCH: { hasData: true };
}

// Conditional types baseados no método HTTP
export type ConfigForMethod<T extends HttpMethod> =
  HttpMethodDataMap[T] extends { hasData: true }
    ? AcchioRequestConfig
    : Omit<AcchioRequestConfig, "data">;

// Utility type para extrair tipo de dados da response
export type ResponseData<T> = T extends AcchioResponse<infer D> ? D : never;

// Utility type para criar requests tipados
export type TypedAcchioRequest<T = any> = (
  config: AcchioRequestConfig
) => Promise<AcchioResponse<T>>;
