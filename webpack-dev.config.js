const path = require('path');

module.exports = {
  mode: 'development',
  optimization: {
    minimize: false,
  },
  watch: true,
  node: {
    fs: 'empty',
  },
  entry: ['./app.js'],
  output: {
    path: path.resolve(__dirname),
    filename: 'atomic-calendar.js',
  },
  stats: {
    colors: true,
  }
};
