import { Interceptors } from './index';

declare global {
  interface Window {
    fetch: {
      interceptors: Interceptors;
    };
  }

  interface Response {
    reqInfo: RequestInfo;
  }
}
