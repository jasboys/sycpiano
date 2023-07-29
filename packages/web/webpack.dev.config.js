/* eslint-disable no-var, strict, prefer-arrow-callback */
'use strict';

const { merge } = require('webpack-merge');
const common = require('./webpack.common.config.js');
const webpack = require('webpack');
const BundleAnalyzerPlugin =
    require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = (reporter) => {
    const tsxUse = common.tsxUse;
    // const tsxSwcUse = common.tsxSwcUse;

    const plugins = reporter
        ? [
              // new BundleAnalyzerPlugin({
              //     analyzerMode: 'static',
              //     openAnalyzer: false,
              //     logLevel: 'silent',
              // }),
              new webpack.ProgressPlugin({
                  handler: (percentage, message, ...args) => {
                      if (message === '') {
                          reporter.updateTask('Webpack', { percentage });
                      } else {
                          const msg =
                              message + (args.length ? `: ${args[0]}` : '');
                          reporter.updateTask('Webpack', {
                              percentage,
                              message: msg,
                          });
                      }
                  },
              }),
          ]
        : [];

    return merge(common.config, {
        mode: 'development',
        devtool: 'eval-cheap-source-map',
        output: {
            filename: '[name].bundle.js',
            chunkFilename: '[name].chunk.js',
        },
        module: {
            rules: [
                {
                    test: /\.(t|j)sx?$/,
                    include: common.sourcePaths,
                    use: tsxUse,
                },
            ],
        },
        cache: {
            type: 'filesystem',
        },
        plugins,
    });
};

module.exports = config;
