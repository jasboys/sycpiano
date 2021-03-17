/* eslint-disable no-var, strict, prefer-arrow-callback */
'use strict';

const { merge } = require('webpack-merge');
const common = require('./webpack.common.config.js');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = (shouldCheck, reporter) => {
    const tsxUse = common.tsxUse;
    if (shouldCheck) {
        tsxUse.push({ loader: require.resolve('stylelint-custom-processor-loader') });
    }

    const plugins = [
        // new BundleAnalyzerPlugin({
        //     analyzerMode: 'static',
        //     openAnalyzer: false,
        //     logLevel: 'silent',
        // }),
        new webpack.ProgressPlugin({
            handler: (percentage, message, ...args) => {
                const msg = message
                    ? message +
                        ((args.length) ? ': ' + args[0] : '')
                    : '';
                reporter.updateTask('Webpack', { percentage, message: msg });
            },
        }),
    ];

    if (shouldCheck) {
        plugins.push(
            new ForkTsCheckerWebpackPlugin({
                eslint: {
                    files: './web/src/**/*.{ts,tsx,js,jsx}',
                },
            })
        );
    }

    return merge(common.config, {
        mode: 'development',
        devtool: 'eval-cheap-source-map',
        output: {
            filename: '[name].bundle.js',
            chunkFilename: '[name].chunk.js',
        },
        module: {
            rules: [{
                test: /\.(t|j)sx?$/,
                include: common.sourcePaths,
                use: tsxUse,
            }],
        },
        plugins,
    });
}

module.exports = config;
