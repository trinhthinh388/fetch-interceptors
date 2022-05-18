import '../index';

// const fakeAPI = async (): Promise<string> =>
//   new Promise((resolve) => {
//     setTimeout(() => resolve('Done'), 2000);
//   });

describe('Interceptors', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });
  it(`Should change request's config on each interceptor before sending request.`, () => {
    const interceptor1 = (config: RequestInfo) => {
      expect(config).toBe('https://google.com');
      return 'https://facebook.com';
    };

    const interceptor2 = (config: RequestInfo) => {
      expect(config).toBe('https://facebook.com');
      return 'https://twitter.com';
    };

    window.fetch.interceptors.request.use(interceptor1);
    window.fetch.interceptors.request.use(interceptor2);

    window.fetch('https://google.com');
  });

  test('should intercept response', async () => {
    const resInterceptor = (resp: Response) => {
      expect(resp.ok).toBe(true);
      return resp;
    };

    window.fetch.interceptors.response.use(resInterceptor);
    return await window.fetch('https://google.com');
  });
});
