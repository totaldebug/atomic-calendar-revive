const path = require('path');

module.exports = {
  mode: 'production',
  optimization: {
    minimize: true,
  },
  watch: false,
  node: {
    fs: 'empty',
  },
  entry: ['./app.js'],
  output: {
    path: path.resolve(__dirname),
    filename: 'atomic-calendar.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      }
    ],
  },
  stats: {
    colors: true,
  }
};
