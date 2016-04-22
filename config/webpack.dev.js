var webpack = require('webpack');
var path = require('path');

var APP_DIR = path.join(__dirname, '..', 'app');
var IMG_DIR = path.join(__dirname, '..', 'app/Assets/images');

module.exports = {
    debug: true,
    devtool: 'source-map',
    entry: ['webpack-hot-middleware/client', './app/index.tsx'],
    module: {
        preLoaders: [{
            test: /\.tsx?$/,
            loader: 'tslint',
            include: APP_DIR
        }],
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
            { test: /\.woff$/, loader: 'file?name=public/fonts/[name].[ext]' },
            { test: /\.worker.js$/, loader: "worker-loader" },
            {
                test: /\.(jpg|png)$/,
                loader: 'url?limit=25000',
                include: IMG_DIR
            },
        ]
    },
    output: {
        filename: 'app.js',
        path: path.join(__dirname, '..', 'build'),
        publicPath: '/static/'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    resolve: {
        alias: {
            Tone: "tone/Tone"
        },
        root: [path.resolve('../app')],
        extensions: ['', '.jsx', '.js', '.tsx', '.ts']
    }
};
