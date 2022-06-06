import { Interceptors } from './index';

declare global {
  function fetch(
    input: RequestInfo,
    init?: RequestInit | undefined
  ): Promise<Response>;

  namespace fetch {
    export var interceptors: Interceptors;
  }

  interface RequestInit {
    extraData?: Record<string, any>;
  }
}
