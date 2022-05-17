import {
  RequestSuccessInterceptor,
  ResponseSuccessInterceptor,
  ResponseFailInterceptor,
} from '@types';

const originFetch = window.fetch;

const interceptors: {
  request: Array<{
    onSuccess: RequestSuccessInterceptor;
  }>;
  response: Array<{
    onSuccess: ResponseSuccessInterceptor;
    onError: ResponseFailInterceptor;
  }>;
} = {
  response: [],
  request: [],
};

function addToReqPipeline(onSuccess: RequestSuccessInterceptor) {
  interceptors.request.push({
    onSuccess,
  });
}

function addToResPipeline(
  onSuccess: ResponseSuccessInterceptor,
  onError: ResponseFailInterceptor
) {
  interceptors.response.push({
    onSuccess,
    onError,
  });
}

async function fetch(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  let finalInput = input;
  // Run pipeline before send request
  interceptors.request.forEach((interceptor) => {
    finalInput = interceptor.onSuccess(input);
  });
  const res = await originFetch(finalInput, init);

  let finalRes = res.clone();
  if (res.ok) {
    // Run pipeline for success request.
    interceptors.response.forEach((interceptor) => {
      finalRes = interceptor.onSuccess(finalRes);
    });
  } else {
    // Run pipeline for failed request.
    for (let i = 0; i < interceptors.response.length; i++) {
      finalRes = await interceptors.response[i].onError(finalRes);
    }
  }
  return Promise.resolve(finalRes);
}

export function withInterceptors() {
  Object.defineProperties(fetch, {
    interceptors: {
      value: {
        response: {
          use: addToReqPipeline,
        },
        request: {
          use: addToResPipeline,
        },
      },
    },
  });

  Object.defineProperty(window, 'fetch', {
    value: fetch,
  });
}
