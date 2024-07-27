/* eslint-disable no-var, strict, prefer-arrow-callback */

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('node:path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
require('dotenv').config({ override: true, path: '../../.env' });

if (!process.env.STRIPE_PUBLIC_KEY) {
    throw Error('STRIPE_PUBLIC_KEY not defined');
}

if (!process.env.GAPI_KEY_APP) {
    throw Error('GAPI_KEY_APP not defined');
}

const staticPrefix = '/static';

const sourcePaths = [path.resolve(__dirname, 'src')];

const tsxUse = [
    {
        loader: require.resolve('babel-loader'),
        options: {
            presets: [
                [
                    '@babel/preset-react',
                    { runtime: 'automatic', importSource: '@emotion/react' },
                ],
                [
                    '@babel/preset-env',
                    {
                        targets: '> 0.25%, not dead',
                        useBuiltIns: 'usage',
                        corejs: {
                            version: '3.31',
                            proposals: true,
                        },
                    },
                ],
                '@babel/preset-typescript',
            ],
            plugins: ['@emotion/babel-plugin'],
        },
    },
];

// const tsxSwcUse = [
//     {
//         loader: require.resolve('babel-loader'),
//         options: {
//             plugins: [
//                 '@emotion'
//             ]
//         }
//     },
//     {
//         loader: require.resolve('swc-loader'),
//         options: {
//             sync: true,
//             parseMap: true,
//             jsc: {
//                 parser: {
//                     syntax: 'typescript',
//                     tsx: true,
//                     dynamicImport: true,
//                 },
//                 transform: {
//                     react: {
//                         runtime: 'automatic',
//                         importSource: '@emotion/react'
//                     }
//                 },
//                 paths: {
//                     "*": [
//                         "node_modules/*",
//                         "@types/*",
//                         "web/*"
//                     ]
//                 },
//                 baseUrl: '.',
//                 target: 'es2022',
//             },
//             sourceMaps: 'inline',
//             module: {
//                 type: 'es6',
//                 noInterop: false,
//             },
//             env: {
//                 targets: "> 0.25%, not dead",
//                 mode: 'usage',
//                 coreJs: '3.22',
//                 shippedProposals: true
//             }
//         }
//     }
// ];

const config = () => {
    return {
        cache: true,
        entry: {
            sycpiano: path.resolve(__dirname, 'src/main.tsx'),
        },
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: '/static/',
        },
        module: {
            rules: [
                {
                    test: /\.(t|j)sx?$/,
                    include: sourcePaths,
                    use: tsxUse,
                },
            ],
        },
        optimization: {
            runtimeChunk: true,
        },
        plugins: [
            new webpack.DefinePlugin({
                BINARY_PATH: JSON.stringify(process.env.DATA_ASSETS_DIR),
                IMAGES_PATH: JSON.stringify(process.env.IMAGE_ASSETS_DIR),
                MUSIC_PATH: JSON.stringify(process.env.MUSIC_ASSETS_DIR),
                GAPI_KEY: JSON.stringify(process.env.GAPI_KEY_APP),
                STRIPE_PUBLIC_KEY: JSON.stringify(
                    process.env.STRIPE_PUBLIC_KEY,
                ),
            }),
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, 'partials/index.html'),
                scriptLoading: 'defer',
                hash: true,
            }),
        ],
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '...'],
            alias: {
                src: path.resolve(__dirname, 'src'),
            },
            fallback: {
                process: require.resolve('process/browser'),
            },
            symlinks: false,
        },
    };
};

module.exports = {
    config: config(),
    staticPrefix,
    sourcePaths,
    tsxUse,
    // tsxSwcUse,
};
