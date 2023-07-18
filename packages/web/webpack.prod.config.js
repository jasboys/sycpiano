/* eslint-disable no-var, strict, prefer-arrow-callback */
'use strict';

const { merge } = require('webpack-merge');
const common = require('./webpack.common.config.js');

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
});

module.exports = config;
