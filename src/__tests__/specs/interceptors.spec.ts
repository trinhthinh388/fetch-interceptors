import { RequestConfig } from '@types';
import '../../index';
import { getRequestConfigHandler, mockErrorSpy } from './__helpers.spec';

describe('interceptors', () => {
  afterEach(() => {
    window.fetch.interceptors.request.handlers = [];
    window.fetch.interceptors.response.handlers = [];
  });

  it('should add a request interceptor (asynchronous by default)', function (done) {
    window.fetch.interceptors.request.handlers = [
      getRequestConfigHandler(false, ({ init }) => {
        expect(init).toBeDefined();
        // @ts-expect-error
        expect(init?.headers?.test).toBe('hello world!');
        done();
      }),
    ];

    let asyncFlag = false;
    window.fetch.interceptors.request.use(function ({ input }) {
      expect(asyncFlag).toBe(true);
      return {
        input,
        init: {
          headers: {
            test: 'hello world!',
          },
        },
      };
    });

    fetch('/foo');
    asyncFlag = true;
  });

  it('should add a request interceptor (explicitly flagged as asynchronous)', function (done) {
    window.fetch.interceptors.request.handlers = [
      getRequestConfigHandler(false, ({ init }) => {
        expect(init).toBeDefined();
        // @ts-expect-error
        expect(init?.headers?.test).toBe('hello world!');
        done();
      }),
    ];
    let asyncFlag = false;
    window.fetch.interceptors.request.use(
      function ({ input, init }) {
        expect(asyncFlag).toBe(true);
        return {
          input,
          init: {
            headers: {
              test: 'hello world!',
            },
          },
        };
      },
      undefined,
      { synchronous: false }
    );

    fetch('/foo');
    asyncFlag = true;
  });

  it('should add a request interceptor that is executed synchronously when flag is provided', function (done) {
    window.fetch.interceptors.request.handlers = [
      getRequestConfigHandler(true, ({ init }) => {
        expect(init).toBeDefined();
        // @ts-expect-error
        expect(init?.headers?.test).toBe('hello world!');
        done();
      }),
    ];
    let asyncFlag = false;
    window.fetch.interceptors.request.use(
      function ({ input, init }) {
        expect(asyncFlag).toBe(false);
        return {
          input,
          init: {
            headers: {
              test: 'hello world!',
            },
          },
        };
      },
      undefined,
      { synchronous: true }
    );

    fetch('/foo');
    asyncFlag = true;
  });

  it('should execute asynchronously when not all interceptors are explicitly flagged as synchronous', function (done) {
    window.fetch.interceptors.request.handlers = [
      getRequestConfigHandler(false, ({ init }) => {
        expect(init).toBeDefined();
        // @ts-expect-error
        expect(init?.headers?.test).toBe('hello sync');
        // @ts-expect-error
        expect(init?.headers?.foo).toBe('hello foo async');
        done();
      }),
    ];
    let asyncFlag = false;
    window.fetch.interceptors.request.use(async function ({ input, init }) {
      expect(asyncFlag).toBe(true);
      const newInit = init || {};
      newInit.extraData = {
        fromInterceptor: true,
      };
      if (!init?.extraData?.fromInterceptor) {
        await fetch('https://jsonplaceholder.typicode.com/todos/1', newInit);
      }
      return {
        input,
        init: {
          headers: {
            ...(init ? init.headers : {}),
            foo: 'hello foo async',
          },
        },
      };
    });

    window.fetch.interceptors.request.use(
      function ({ input }) {
        expect(asyncFlag).toBe(true);
        return {
          input,
          init: {
            headers: {
              test: 'hello sync',
            },
          },
        };
      },
      undefined,
      { synchronous: true }
    );
    window.fetch.interceptors.request.use(function ({ input }) {
      expect(asyncFlag).toBe(true);
      return {
        input,
        init: {
          headers: {
            test: 'hello async',
          },
        },
      };
    });

    fetch('https://jsonplaceholder.typicode.com/todos/1');
    asyncFlag = true;
  });

  it('should add a request interceptor with an onRejected block that is called if interceptor code fails', function (done) {
    const deadlyError = new Error('deadly error');
    const handler = (error: Error, config: RequestConfig) => {
      expect(error.message).toBe('deadly error');
      done();
    };
    window.fetch.interceptors.request.use(
      function () {
        throw deadlyError;
      },
      mockErrorSpy(handler),
      { synchronous: true }
    );

    fetch('/foo');
  });

  it('should add a request interceptor that returns a new config object', function (done) {
    window.fetch.interceptors.request.handlers = [
      getRequestConfigHandler(false, ({ init, input }) => {
        expect(init).toBeDefined();
        expect(input).toBe('/bar');
        expect(init?.method).toBe('POST');
        done();
      }),
    ];
    window.fetch.interceptors.request.use(function () {
      return {
        input: '/bar',
        init: {
          method: 'POST',
        },
      };
    });

    fetch('/foo');
  });

  it('should add a request interceptor that returns a promise', function (done) {
    window.fetch.interceptors.request.handlers = [
      getRequestConfigHandler(false, ({ init }) => {
        expect(init).toBeDefined();
        // @ts-expect-error
        expect(init?.headers?.async).toBe('promise');
        done();
      }),
    ];
    window.fetch.interceptors.request.use(function ({ input }) {
      return new Promise(function (resolve) {
        // do something async
        setTimeout(function () {
          resolve({
            input,
            init: {
              headers: {
                async: 'promise',
              },
            },
          });
        }, 100);
      });
    });

    fetch('/foo');
  });

  it('should add multiple request interceptors', function (done) {
    window.fetch.interceptors.request.handlers = [
      getRequestConfigHandler(false, ({ init }) => {
        //@ts-expect-error
        expect(init?.headers?.test1).toBe('1');
        //@ts-expect-error
        expect(init?.headers?.test2).toBe('2');
        //@ts-expect-error
        expect(init?.headers?.test3).toBe('3');
        done();
      }),
    ];
    window.fetch.interceptors.request.use(function (config) {
      if (config.init?.headers) {
        config.init.headers = {
          ...config.init.headers,
          test1: '1',
        };
      }
      return config;
    });
    window.fetch.interceptors.request.use(function (config) {
      if (config.init?.headers) {
        config.init.headers = {
          ...config.init.headers,
          test2: '2',
        };
      }
      return config;
    });
    window.fetch.interceptors.request.use(function (config) {
      return {
        ...config,
        init: {
          headers: {
            test3: '3',
          },
        },
      };
    });

    fetch('/foo');
  });

  it('should add a response interceptor', function (done) {
    let response: string;

    window.fetch.interceptors.response.use(async function (resp) {
      response = resp.statusText + ' - modified with interceptor';
      return resp;
    });

    fetch('https://jsonplaceholder.typicode.com/todos/1').then(() => {
      setTimeout(() => {
        expect(response).toBe('OK - modified with interceptor');
        done();
      }, 1000);
    });
  });

  it('should add a response interceptor when request interceptor is defined', function (done) {
    let response: string;

    fetch.interceptors.request.use(function (config) {
      return config;
    });

    fetch.interceptors.response.use(function (resp) {
      response = resp.statusText + ' - modified by interceptor';
      return resp;
    });

    fetch('/foo').then(function () {
      setTimeout(function () {
        expect(response).toBe('Not Found - modified by interceptor');
        done();
      }, 1000);
    });
  });

  it('should add a response interceptor that returns a new status text', function (done) {
    fetch.interceptors.response.use(function (resp) {
      const newResp: Response = {
        ...resp.clone(),
        statusText: 'Hello - Modified by interceptor.',
      };
      return newResp;
    });

    fetch('/foo').then(function (resp) {
      setTimeout(function () {
        expect(resp.statusText).toBe('Hello - Modified by interceptor.');
        done();
      }, 100);
    });
  });

  it('should add a response interceptor that returns a promise', function (done) {
    var response;

    fetch.interceptors.response.use(function (resp) {
      return new Promise(function (resolve) {
        // do something async
        setTimeout(function () {
          const newResp: Response = {
            ...resp.clone(),
            statusText: 'you have been promised!',
          };
          resolve(newResp);
        }, 10);
      });
    });

    fetch('/foo').then(function (resp) {
      setTimeout(function () {
        expect(resp.statusText).toBe('you have been promised!');
        done();
      }, 100);
    });
  });

  describe('given you add multiple response interceptors', function () {
    describe('and when the response was fulfilled', function () {
      async function fireRequestAndExpect(
        expectation: (response: Response) => void
      ) {
        const resp = await fetch('/foo');
        expectation(resp);
      }

      it('then each interceptor is executed', function (done) {
        const interceptor1 = jasmine.createSpy('interceptor1');
        const interceptor2 = jasmine.createSpy('interceptor2');
        fetch.interceptors.response.use(interceptor1);
        fetch.interceptors.response.use(interceptor2);

        fireRequestAndExpect(function () {
          expect(interceptor1).toHaveBeenCalled();
          expect(interceptor2).toHaveBeenCalled();
          done();
        });
      });

      it('then they are executed in the order they were added', function (done) {
        const interceptor1 = jasmine.createSpy('interceptor1');
        const interceptor2 = jasmine.createSpy('interceptor2');
        fetch.interceptors.response.use(interceptor1);
        fetch.interceptors.response.use(interceptor2);

        fireRequestAndExpect(function () {
          // @ts-expect-error
          expect(interceptor1).toHaveBeenCalledBefore(interceptor2);
          done();
        });
      });

      it("then only the last interceptor's result is returned", function (done) {
        fetch.interceptors.response.use(function () {
          const res = new Response('/foo', {
            statusText: 'response 1',
          });
          return res;
        });
        fetch.interceptors.response.use(function () {
          const res = new Response('/foo', {
            statusText: 'response 2',
          });
          return res;
        });

        fireRequestAndExpect(function (response) {
          expect(response.statusText).toBe('response 2');
          done();
        });
      });

      it("then every interceptor receives the result of it's predecessor", function (done) {
        fetch.interceptors.response.use(function () {
          const res = new Response('/foo', {
            statusText: 'response 1',
          });
          return res;
        });
        fetch.interceptors.response.use(function (resp) {
          const res = new Response('/foo', {
            statusText: resp.statusText + ' response 2',
          });
          return res;
        });

        fireRequestAndExpect(function (response) {
          expect(response.statusText).toBe('response 1 response 2');
          done();
        });
      });

      describe('and when the fulfillment-interceptor throws', function () {
        async function fireRequestCatchAndExpect(expectation: any) {
          await fetch('/foo');
          setTimeout(function () {
            expectation();
          }, 500);
        }

        it('then the following fulfillment-interceptor is not called', function (done) {
          fetch.interceptors.response.use(function () {
            throw Error('throwing interceptor');
          });
          const interceptor2 = jasmine.createSpy('interceptor2');
          fetch.interceptors.response.use(interceptor2);

          fireRequestCatchAndExpect(function () {
            expect(interceptor2).not.toHaveBeenCalled();
            done();
          });
        });

        it('then the following rejection-interceptor is not called', function (done) {
          fetch.interceptors.response.use(function () {
            throw Error('throwing interceptor');
          });
          const unusedFulfillInterceptor = (resp: Response) => resp;
          const rejectIntercept = jasmine.createSpy('rejectIntercept');
          fetch.interceptors.response.use(
            unusedFulfillInterceptor,
            rejectIntercept
          );

          fireRequestCatchAndExpect(function () {
            expect(rejectIntercept).not.toHaveBeenCalled();
            done();
          });
        });

        it('once caught, another following fulfill-interceptor is called again (just like in a promise chain)', function (done) {
          const unusedFulfillInterceptor = (resp: Response) => resp;
          const catchingThrowingInterceptor = async (error: Error) => error;
          fetch.interceptors.response.use(
            unusedFulfillInterceptor,
            catchingThrowingInterceptor
          );

          const interceptor2 = jasmine.createSpy('interceptor2');
          fetch.interceptors.response.use(interceptor2);

          fireRequestCatchAndExpect(function () {
            expect(interceptor2).toHaveBeenCalled();
            done();
          });
        });
      });
    });
  });

  it('should clear all request interceptors', function () {
    fetch.interceptors.request.use(function (config) {
      return config;
    });

    fetch.interceptors.request.clear();

    expect(fetch.interceptors.request.handlers.length).toBe(0);
  });

  it('should clear all response interceptors', function () {
    fetch.interceptors.response.use(function (resp) {
      return resp;
    });

    fetch.interceptors.response.clear();

    expect(fetch.interceptors.response.handlers.length).toBe(0);
  });
});
