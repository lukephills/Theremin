var path = require('path');
//var FileSystem = require("fs");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');

var APP_DIR = path.join(__dirname, '..', 'app');

module.exports = {
  devtool: 'source-map',
  entry: './app/index.tsx',
  module: {
    //preLoaders: [{
    //  test: /\.tsx?$/,
    //  loader: 'tslint',
    //  include: APP_DIR
    //}],
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel']
      },
      {
        test: /\.tsx?$/,
        loaders: ['babel', 'ts'],
        include: APP_DIR
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
    ]
  },
  output: {
    path: path.join(__dirname, '..', 'build/static'),
    filename: 'app.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    new CopyWebpackPlugin([
      { from: 'index.html', to: '../' },
    ])
  ],
  resolve: {
    alias: {
      Tone: "tone/Tone"
    },
    root: [path.resolve('../app')],
    extensions: ['', '.jsx', '.js', '.tsx', '.ts']
  },
  tslint: {
    emitErrors: true,
    failOnHint: true
  }
}
