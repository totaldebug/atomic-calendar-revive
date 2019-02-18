const path = require('path');

module.exports = {
    entry: "./app.js",
	mode: "production",
	optimization: {
        minimize: true,
    },
	watch: false,
    node: {
    fs: 'empty',
    },
    output: {
		path: path.resolve(__dirname),
        filename: "atomic-calendar.js"
    },
  devtool: "cheap-module-source-map",
    module: {
    rules: [
      {
        test: /\.css$/, loader: "style!css",
        exclude: /node_modules/,
      },
      { 
        test   : /.js$/,
        loader : 'babel-loader' ,
        exclude: /node_modules/
      }
    ]
  }
};