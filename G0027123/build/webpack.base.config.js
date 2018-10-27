"use strict";

const fs = require('fs'),
  path = require("path"),
  webpack = require("webpack"),
  BundleTracker  = require('webpack-bundle-tracker'),
  CleanWebpackPlugin = require('clean-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  HtmlWebpackEntryLoaderPlugin = require('./HtmlWebpackEntryLoaderPlugin'),
  HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');

let buildEnv = require('./BuildEnv.config');
let publicPath = buildEnv.PACKING_SITE + '/' + buildEnv.PACKING_ENV + '/games/' + buildEnv.PACKING_GAME + '/';
let outputPath = path.resolve(__dirname, '../dist/' + buildEnv.PACKING_ENV + '/games/'+ buildEnv.PACKING_GAME);

let configs = [];

fs.readdirSync(path.resolve(__dirname, '../client'));
['device', 'qrcode', 'control'].forEach(pageId => {
  let entries = {};
  if (fs.existsSync(path.resolve(path.resolve(__dirname, '../client', pageId, 'Script.js')))) {
    entries[pageId + '-body'] = './client/' + pageId + '/Script.js';
  } else {
    return;
  }

  configs.push({
    devtool: "#inline-source-map",

    entry: entries,

    output: {
      path: outputPath,
      publicPath: publicPath,
      filename: "js/[name].[hash:8].js"
      //filename: "js/[name].js"
      /*
      filename: m => {
        let chunkName = m.chunk.name;
        if (chunkName.lastIndexOf(".js") >= 0) {
          chunkName = chunkName.substring(0, chunkName.lastIndexOf(".js"));
        }
        return "js/" + chunkName + ".[chunkhash:8].js";
      }
      */
    },

    module: {
      rules: [{
          test: /\.css$/,
          use: [{
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              //publicPath: '../'
            }
          },
          "css-loader"
          ]
        },
        {
          test: /\.min\.js$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: "js/libs/[name].[hash:8].[ext]"
            }
          }]
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: [{
            loader: 'url-loader',
            options: {
              limit: 8192,
              fallback: 'file-loader',
              name: function(image) {
                //console.log('======== +' + path.resolve(image, ".").normalize());
                let paths = path.resolve(image, "..").normalize().split(path.sep);
                let folder = paths[paths.length - 1];
                return "images/" + folder + "/[name].[hash:8].[ext]";
              }
            }
          }]
        },
        {
          test: /\.(mp4|mov)$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: "media/[name].[hash:8].[ext]"
            }
          }]
        },
      ]
    },

    externals:{
    },

    resolve: {
      extensions: ['.js', '.jsx', '.css'],
      modules: [
        'node_modules'
      ]
    },

    performance: {
      hints: false
    },

    plugins: [
      new webpack.ProvidePlugin({
        _: "underscore"
      }),

      new CleanWebpackPlugin(['*'], {
        root: outputPath,
        //exclude: ['shared.js'],
        verbose: true,
        //dry: true
      }),


      new CopyWebpackPlugin([
        //{ from: 'server/public/js/libs/head-1.0.3.min.js', to: 'js/libs/'},
      ]),

      //new ExtractTextPlugin({
      //  filename: 'css/[name].[contenthash].css'
      //}),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: "css/[name].[contenthash:8].css"
        //chunkFilename: "[id].css"
      }),

      new HtmlWebpackPlugin({
        template: path.join(__dirname, "../server/views/" + pageId + ".ejs"),
        filename: pageId + '.html',
        inject: 'head',
        page: pageId,
        title: 'page title',
      }),

      new HtmlWebpackPlugin({
        template: path.join(__dirname, "../server/views/" + pageId + "-production.ejs"),
        filename: 'views/' + pageId + '.ejs',
        inject: false,
        page: pageId,
        title: 'AI智慧篮球教练'
      }),

      new HtmlWebpackIncludeAssetsPlugin({
        assets: [
          /*'js/libs/head-1.0.3.min.js',
          'js/libs/zepto.min.js',
          'js/libs/pixi.min.js',
          'js/libs/p2.min.js',
          'js/libs/phaser-split.min.js'*/
        ],
        append: false,
        hash: true
      }),


      new webpack.DefinePlugin({
      }),

      function() {
        this.plugin("emit", function(compilation, callback) {
          let pageJsChunk, pageJsHash;
          let pageBodyJsChunk, pageBodyJsHash;
          let pageBodyCssChunk, pageBodyCssHash;
          Object.keys(compilation.assets).map(name => {
            //console.log("#name="+name);
            if (new RegExp('js\/'+ pageId + '-body.*.js').exec(name)) {
              pageBodyJsChunk = compilation.assets[name];
              if (name.split('.').length > 2) {
                pageBodyJsHash = name.split('.')[1];
              }
            } else if (new RegExp('css\/'+ pageId + '-body.*.css').exec(name)) {
              pageBodyCssChunk = compilation.assets[name];
              if (name.split('.').length > 2) {
                pageBodyCssHash = name.split('.')[1];
              }
            } else if (new RegExp('js\/'+ pageId + '.*.js').exec(name)) {
              pageJsChunk = compilation.assets[name];
              if (name.split('.').length > 2) {
                pageJsHash = name.split('.')[1];
              }
            }
          });

          // append hash
          if (pageJsChunk && pageBodyJsHash && pageBodyCssHash) {
            var pageJSChunkText = pageJsChunk.source();
            //console.log(pageJSChunkText);
            pageJsChunk.source = function () {
              return pageJSChunkText
                .replace(
                  'js/' + pageId + "-body.js",
                  publicPath + 'js/' + pageId + "-body." + pageBodyJsHash + ".js")
                .replace(
                  'css/' + pageId + "-body.css",
                  publicPath + 'css/' + pageId + "-body." + pageBodyCssHash + ".css");
            };
          }

          callback();
        });
      },

      // output tracking json file
      new BundleTracker({
        path: outputPath,
        filename: pageId + '-stats.json'
      }),

      new HtmlWebpackEntryLoaderPlugin({
        outputFileName: 'js/' + pageId + '.js',
        entryFile: path.resolve(__dirname,'../client/' + pageId + '/Entry.js')
      }),
    ],

    optimization: {
      runtimeChunk: false,
      /*
      splitChunks: {
        minSize: 0,
        automaticNameDelimiter: '-',
        cacheGroups: {
          entry: {
            chunks: 'all',
            test: function(m) {
              if(m.resource && m.resource.indexOf('Entry.js') >= 0) {
                return false;
              } else if (m.resource && m.resource.indexOf('head-1.0.3.js') >= 0) {
                return false;
              }
              return true;
            },
            name: pageId + '-body'
          }
        }
      }
      */
    }

  }); // end of configs.push
});

module.exports = configs;
