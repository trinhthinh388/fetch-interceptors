# fetch-interceptors

[![npm version](https://img.shields.io/npm/v/axios-fetch-interceptors?label=axios-fetch-interceptors)](https://www.npmjs.org/package/axios-fetch-interceptors)

Interceptor plugin for window fetch API, inspired by Axios interceptors.

## Table of Contents

- [Features](#features)
- [Installing](#installing)
- [Example](#example)
- [Typescript](#typescript)
- [License](#license)

## Features

- Intercept request and response

## Installing

Using npm:

```bash
$ npm install axios-fetch-interceptors
```

Using bower:

```bash
$ bower install axios-fetch-interceptors
```

Using yarn:

```bash
$ yarn add axios-fetch-interceptors
```

Using pnpm:

```bash
$ pnpm add axios-fetch-interceptors
```

Once the package is already installed and imported in the `index` file, you can see a new property called `interceptors` is added into the fetch.


## Example

Just like the way you are using it in Axios.

```typescript
// Add an request interceptor
fetch.interceptors.request.use(
  function (config : RequestConfig) {
    console.log(config)
    return config
  },
  function (error : Error, config: RequestConfig) {
    console.log(error)
  }
)

// Add an response interceptor
fetch.interceptors.response.use(
  function (response : RequestConfig) {
    console.log(response)
    return response
  },
  function (error : Error, config: RequestConfig) {
    console.log(error)
    return Promise.reject(error)
  }
)
```

If you want to remove all `request/response` interceptors

```javascript
fetch.interceptors.request.clear()
```

## Typescript

`axios-fetch-interceptors` supports [Typescript](https://www.typescriptlang.org/) out of the box.

## License

MIT