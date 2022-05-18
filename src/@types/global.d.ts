import { Interceptors } from './index';

declare global {
  interface Window {
    fetch: {
      interceptors: Interceptors;
    };
  }

  interface Response {
    request: {
      input: RequestInfo;
      options?: RequestInit;
    };
  }
}
