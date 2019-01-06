/* eslint-disable no-var, strict, prefer-arrow-callback */
'use strict';

const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.config.js');
const Minimizer = require('terser-webpack-plugin');
const webpack = require('webpack');
const os = require('os');

const config = merge(common.config, {
    mode: 'production',
    output: {
        filename: '[name].[chunkhash:8].bundle.js',
        chunkFilename: '[name].[chunkhash:8].chunk.js',
    },
    optimization: {
        minimizer: [
            new Minimizer({
                cache: true,
                parallel: true,
            }),
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            MUSIC_PATH: JSON.stringify(common.staticPrefix + '/music'),
        }),
        new webpack.NormalModuleReplacementPlugin(
            /moment-timezone\/data\/packed\/latest\.json/,
            path.resolve(__dirname, 'web/assets/data/tz-2000-2050.json'),
        ),
    ],
});

module.exports = config;
