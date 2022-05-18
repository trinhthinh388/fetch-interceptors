import './global';

export type RequestSuccessInterceptor = (config: RequestInfo) => RequestInfo;

export type ResponseSuccessInterceptor = (resp: Response) => Response;
export type ResponseFailInterceptor = (error: Response) => Promise<Response>;

export type Interceptors = {
  request: {
    use: (onSuccess: RequestSuccessInterceptor) => void;
  };
  response: {
    use: (
      onSuccess: ResponseSuccessInterceptor,
      onError?: ResponseFailInterceptor
    ) => void;
  };
};
