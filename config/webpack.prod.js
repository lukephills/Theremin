var path = require('path');
var fs = require("fs");
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
    filename: 'app-[hash].js',
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
    ]),
    // plugin to replace /static/app.js to static/app-[hash].js in the build index file
    // check here for a nicer version in the future: https://github.com/webpack/webpack/issues/86
    function () {
      this.plugin("done", function (stats) {
        var replaceInFile = function (filePath, toReplace, replacement) {
          var replacer = function (match) {
            console.log('Replacing in %s: %s => %s', filePath, match, replacement);
            return replacement
          };
          var str = fs.readFileSync(filePath, 'utf8');
          var out = str.replace(new RegExp(toReplace, 'g'), replacer);
          fs.writeFileSync(filePath, out);
        };

        var hash = stats.hash; // Build's hash, found in `stats` since build lifecycle is done.

        replaceInFile('build/index.html', '/static/app.js', 'static/app-' + hash + '.js');
      });
    }
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
