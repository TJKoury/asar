// webpack.config.js

var webpack = require('webpack');
var path = require('path');
var libraryName = 'asar.lib';
var outputFile = libraryName + '.js';

var config = {
  entry: __dirname + '/lib/asar.js',
  devtool: 'source-map',
  target: 'node',
  externals:require('webpack-node-externals')(),
  context: __dirname,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'commonjs2',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015'],
            plugins: [require('babel-plugin-transform-object-rest-spread')]
          }
        }
      }
    ]
  },
  plugins:[
    new (require('uglifyjs-webpack-plugin'))({
      
    })
  ]
};

module.exports = config;