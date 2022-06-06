const webpackConfig = require('./webpack.config');

module.exports = function (config) {
  config.set({
    // base paththat will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'webpack'],
    plugins: [
      'karma-webpack',
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
    ],

    // list of files / patterns to load in the browser
    // Here I'm including all of the the Jest tests which are all under the __tests__ directory.
    // You may need to tweak this patter to find your test files/
    files: [
      {
        pattern: 'src/__tests__/**/*.ts',
        watched: false,
        type: 'ts',
      },
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // Use webpack to bundle our tests files
      'src/__tests__/**/*.ts': ['webpack'],
    },

    webpack: webpackConfig,

    reporters: ['progress'],

    browsers: ['ChromeHeadless'],

    singleRun: true,
  });
};
