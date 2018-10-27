"use strict";

let path = require("path");
let webpack = require("webpack");

let merge = require("webpack-merge");
let baseWpConfig = require("./webpack.base.config");

let UglifyJsPlugin = require('uglifyjs-webpack-plugin');

//baseWpConfig.entry.app.unshift("webpack-hot-middleware/client");
//baseWpConfig.entry.frontend.unshift("webpack-hot-middleware/client");

let configs = [];
baseWpConfig.map(c => {
  configs.push(merge(c, {
    mode: "production",

  	module: {
  	},

  	performance: {
  		hints: false
  	},

  	plugins: [
  	],

    optimization: {
      minimizer: [
        new UglifyJsPlugin()
      ]
    }
  }));
})

module.exports = configs;
