import { RequestConfig, Handlers } from '@types';
import '../../index';

export const getRequestConfigHandler = function (
  synchronous: boolean,
  handler: (conf: RequestConfig) => void
): Handlers {
  const onFulfilled = (config: RequestConfig) => {
    handler(config);
    return config;
  };
  const onRejected = (error: Error, config: RequestConfig) => {
    handler(config);
    return Promise.reject(error);
  };
  return {
    handler: {
      onFulfilled,
      onRejected,
    },
    options: {
      synchronous,
    },
  };
};

export const mockErrorSpy =
  (handler: (error: Error, config: RequestConfig) => void) =>
  (error: Error, config: RequestConfig) => {
    handler(error, config);
    // This is a hacky way to bypass test failed on error throw.
    return Promise.resolve(error);
  };
