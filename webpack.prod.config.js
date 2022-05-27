/* eslint-disable no-var, strict, prefer-arrow-callback */
'use strict';

const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.config.js');
const webpack = require('webpack');

const config = merge(common.config, {
    mode: 'production',
    output: {
        filename: '[name].[chunkhash:8].bundle.js',
        chunkFilename: '[name].[chunkhash:8].chunk.js',
    },
    module: {
        rules: [
            {
                test: /\.(t|j)sx?$/,
                include: common.sourcePaths,
                use: common.tsxUse,
            },
        ],
    },
    // plugins: [
    //     new webpack.NormalModuleReplacementPlugin(
    //         /data[\\\/]packed[\\\/]latest.json$/,
    //         path.resolve(__dirname, 'web/assets/data/tz-data.json'),
    //     ),
    // ],
});

module.exports = config;
