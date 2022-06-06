import {
  RequestHandler,
  HandlerOptions,
  Handlers,
  RequestConfig,
  ErrorHandler,
  ResponseHandler,
} from '@types';

type RequestDispatcher = (config: RequestConfig) => Promise<Response>;

const handlers: {
  request: Array<Handlers<RequestHandler>>;
  response: Array<Handlers<ResponseHandler>>;
} = {
  request: [],
  response: [],
};

const originalFetch = window.fetch;

async function fetch(
  prevInput: RequestInfo,
  prevInit?: RequestInit
): Promise<Response> {
  let finalInput = prevInput;
  let finalInit = prevInit;

  /**
   * INTERCEPTORS
   */
  let hasSynchronousInterceptorOnly = true;
  const requestInterceptorChain: Array<
    RequestHandler | ErrorHandler | undefined
  > = [];
  const responseInterceptorChain: Array<
    ResponseHandler | ErrorHandler | undefined
  > = [];

  handlers.request.forEach(({ handler, options }) => {
    hasSynchronousInterceptorOnly =
      hasSynchronousInterceptorOnly && !!options.synchronous;

    const { onFulfilled, onRejected } = handler;
    requestInterceptorChain.unshift(onFulfilled, onRejected);
  });
  handlers.response.forEach(({ handler }) => {
    const { onFulfilled, onRejected } = handler;
    responseInterceptorChain.push(onFulfilled, onRejected);
  });

  if (!hasSynchronousInterceptorOnly) {
    const requestDispatcher: RequestDispatcher = ({ input, init }) =>
      originalFetch(input, init);
    let chain: Array<
      | RequestHandler
      | ResponseHandler
      | RequestDispatcher
      | ErrorHandler
      | undefined
    > = [requestDispatcher, undefined];

    chain.unshift(...requestInterceptorChain);

    chain = chain.concat(responseInterceptorChain);

    let promise = Promise.resolve<RequestConfig>({
      input: finalInput,
      init: finalInit,
    });
    while (chain.length) {
      const onFulfilled = chain.shift() as RequestHandler;
      const onRejected = chain.shift();
      // @ts-expect-error onRejected will not be called anyway.
      promise = promise.then(onFulfilled, onRejected);
    }
    return promise as unknown as ReturnType<RequestDispatcher>;
  }

  while (requestInterceptorChain.length) {
    const onFulfilled = requestInterceptorChain.shift() as RequestHandler;
    const onRejected = requestInterceptorChain.shift() as ErrorHandler;
    try {
      if (onFulfilled) {
        const { input, init } = await onFulfilled({
          input: finalInput,
          init: finalInit,
        });
        finalInput = input;
        finalInit = init;
      }
    } catch (error) {
      if (onRejected) {
        onRejected(error as Error, {
          input: finalInput,
          init: finalInit,
        });
        break;
      }
    }
  }
  /**
   * END INTERCEPTORS
   */

  const response = await originalFetch(finalInput, finalInit);
  let newResponse: Response = response;
  for (; responseInterceptorChain.length; ) {
    const onFulfilled = responseInterceptorChain.shift() as ResponseHandler;
    const onRejected = responseInterceptorChain.shift() as ErrorHandler;
    try {
      if (onFulfilled) {
        newResponse = await onFulfilled(newResponse);
      }
    } catch (error) {
      if (onRejected) {
        onRejected(error as Error, {
          input: finalInput,
          init: finalInit,
        });
        continue;
      }
      break;
    }
  }
  return newResponse;
}

function clear(clearRequest: boolean = true) {
  return () => {
    if (clearRequest) {
      handlers.request = [];
      return;
    }
    handlers.response = [];
  };
}

function addHandler(toRequest: boolean = true) {
  return function (
    onFulfilled: RequestHandler | ResponseHandler,
    onRejected: ErrorHandler,
    options: HandlerOptions = { synchronous: false }
  ) {
    if (toRequest) {
      handlers.request.push({
        handler: {
          onFulfilled: onFulfilled as RequestHandler,
          onRejected,
        },
        options,
      });
    } else {
      handlers.response.push({
        handler: {
          onFulfilled: onFulfilled as ResponseHandler,
          onRejected,
        },
        options: undefined,
      });
    }
  };
}

Object.defineProperty(window, 'fetch', {
  value: fetch,
});
Object.defineProperty(window.fetch, 'interceptors', {
  value: {
    request: {
      handlers: handlers.request,
      use: addHandler(true),
      clear: clear(true),
    },
    response: {
      handlers: handlers.response,
      use: addHandler(false),
      clear: clear(false),
    },
  },
});
Object.defineProperty(window.fetch.interceptors.request, 'handlers', {
  get() {
    return handlers.request;
  },
  set(newValue) {
    handlers.request = newValue;
  },
});
Object.defineProperty(window.fetch.interceptors.response, 'handlers', {
  get() {
    return handlers.response;
  },
  set(newValue) {
    handlers.response = newValue;
  },
});
