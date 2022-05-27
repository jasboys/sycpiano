/* eslint-disable no-var, strict, prefer-arrow-callback */
'use strict';

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
require('dotenv').config();

const staticPrefix = '/static';

const sourcePaths = [
    path.resolve(__dirname, 'web/src'),
];

const tsxUse = [
    {
        loader: 'babel-loader',
        options: {
            presets: [
                [
                    '@babel/preset-react',
                    { runtime: 'automatic', importSource: '@emotion/react' }
                ],
                [
                    '@babel/preset-env',
                    {
                        targets: "> 0.25%, not dead",
                        useBuiltIns: 'usage',
                        shippedProposals: true,
                        corejs: '3',
                    }
                ],
                '@babel/preset-typescript',
            ],
            plugins: [
                '@emotion/babel-plugin',
                '@babel/syntax-dynamic-import',
                ['@babel/transform-runtime', { 'corejs': 3 }]
            ],
        },
    },
];

const config = () => {
    return {
        cache: true,
        entry: {
            sycpiano: path.resolve(__dirname, 'web/src/main.tsx'),
        },
        output: {
            path: path.resolve(__dirname, 'web/build'),
            publicPath: '/static/',
        },
        module: {
            rules: [
                {
                    test: /\.(t|j)sx?$/,
                    include: sourcePaths,
                    use: tsxUse,
                },
                // {
                //     test: /node_modules\/vfile\/core\.js/,
                //     use: [{
                //         loader: 'imports-loader',
                //         options: {
                //             type: 'commonjs',
                //             imports: ['single process/browser process'],
                //         },
                //     }],
                // },
            ],
        },
        optimization: {
            runtimeChunk: true,
        },
        plugins: [
            // new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /^en$/),
            new webpack.DefinePlugin({
                BINARY_PATH: JSON.stringify(staticPrefix + '/binary'),
                IMAGES_PATH: JSON.stringify(staticPrefix + '/images'),
                MUSIC_PATH: JSON.stringify(staticPrefix + '/music'),
                VIDEOS_PATH: JSON.stringify(staticPrefix + '/videos'),
                GAPI_KEY: JSON.stringify(process.env.GAPI_KEY_APP),
                STRIPE_PUBLIC_KEY: JSON.stringify(process.env.STRIPE_PUBLIC_KEY),
            }),
            // new webpack.ProvidePlugin({
            //     path: require.resolve('path-browserify'),
            //     process: require.resolve('process/browser'),
            // }),
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, 'web/partials/index.html'),
                scriptLoading: 'defer',
                hash: true,
            }),
        ],
        resolve: {
            extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
            alias: {
                'src': path.resolve(__dirname, 'web/src'),
            },
            fallback: {
                path: require.resolve('path-browserify'),
                process: require.resolve('process/browser'),
            },
            symlinks: false,
        }
    }
};

module.exports = {
    config: config(),
    staticPrefix,
    sourcePaths,
    tsxUse,
};
