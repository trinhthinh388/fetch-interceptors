module.exports = {
  mode: 'development',
  cache: true,
  devtool: 'inline-source-map',
  externals: [
    {
      './adapters/http': 'var undefined',
    },
  ],
  module: {
    rules: [
      {
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        test: /\.[t|j]s?$/,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
};
