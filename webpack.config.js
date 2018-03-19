// webpack.config.js

var webpack = require('webpack');
var path = require('path');

var config = {
  entry: __dirname + '/lib/monkeypatch/index.js',
  mode: 'development',
  target: 'node',
  context: __dirname,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'asarpatch.js',
    libraryTarget: 'global',
    library: 'asarPatch'
  },
  module: {

  },
  plugins: [

  ]
};

module.exports = config;
