"use strict";

let path = require("path");
let webpack = require("webpack");

const apiMocker = require('webpack-api-mocker');

let merge = require("webpack-merge");
let baseWpConfig = require("./webpack.base.config");
let buildEnv = require('./BuildEnv.config');

//baseWpConfig.entry.app.unshift("webpack-hot-middleware/client");
//baseWpConfig.entry.frontend.unshift("webpack-hot-middleware/client");

let configs = [];
baseWpConfig.map(c => {
  configs.push(merge(c, {
    mode: "development",

    devtool: "#inline-source-map",

    devServer: {
      host: '::',
      contentBase: path.join(__dirname, '../dist'),
      proxy: {
        '/development/games/G0027/data': {
          target: 'http://localhost:60027',
          pathRewrite: {'^/development/games/G0027/data' : 'data'}
        },
        '/development/games/G0027/qrcode': {
          target: 'http://localhost:60027',
          pathRewrite: {'^/development/games/G0027/qrcode' : 'qrcode'}
        },
        '/development/games/G0027/services': {
          target: 'http://localhost:60027',
          pathRewrite: {'^/development/games/G0027/services' : 'services'}
        }

      },
      before(app) {
        apiMocker(app, path.resolve('mock/index.js')
          /*, {
                 proxy: {
                   '/repos/*': 'https://api.github.com/',
                 },
                 changeHost: true,
               }*/
        );
      }
    },

    module: {},

    performance: {
      hints: false
    },

    plugins: []
  }));
})

module.exports = configs;
