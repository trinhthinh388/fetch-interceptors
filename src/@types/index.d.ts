import './global';

export type RequestConfig = {
  input: RequestInfo;
  init?: RequestInit;
};

export type ErrorHandler = (
  error: Error,
  config: RequestConfig
) => Promise<Error>;

export type RequestHandler = (config: RequestConfig) =>
  | {
      input: RequestInfo;
      init?: RequestInit;
    }
  | Promise<{
      input: RequestInfo;
      init?: RequestInit;
    }>;

export type ResponseHandler = (
  response: Response
) => Response | Promise<Response>;

export type HandlerOptions = {
  synchronous?: boolean;
};

type Handlers<T extends RequestHandler | ResponseHandler> = {
  handler: {
    onFulfilled: T;
    onRejected?: ErrorHandler;
  };
  options: T extends ResponseHandler
    ? HandlerOptions | undefined
    : HandlerOptions;
};

export type Interceptors = {
  request: {
    handlers: Array<Handlers<RequestHandler>>;
    use: (
      onFulfilled: RequestHandler,
      onRejected?: ErrorHandler,
      options?: HandlerOptions
    ) => void;
    clear(): void;
  };
  response: {
    handlers: Array<Handlers<ResponseHandler>>;
    use: (onFulfilled: ResponseHandler, onRejected?: ErrorHandler) => void;
    clear(): void;
  };
};
