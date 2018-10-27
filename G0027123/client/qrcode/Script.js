'use strict';

import "../../server/public/js/libs/head-1.0.3.js";

import zepto from "../../node_modules/zepto/dist/zepto.min.js";
import pixi from  '../../node_modules/phaser-ce/build/custom/pixi.min.js';
import p2 from  '../../node_modules/phaser-ce/build/custom/p2.min.js';
import phaser from  '../../node_modules/phaser-ce/build/custom/phaser-split.min.js';

require('../../server/public/css/qrcode.css');

// Global variables
var realWidth, realHeight;
var gameTop = 0;

// Load up some JS
head.load([
  zepto, pixi, p2, phaser,
  "//res.wx.qq.com/open/js/jweixin-1.0.0.js"
], function() {

  require("./Tracker.js");
  require("./Base.js");
  require('./Boot.js');
  //require('./Utils.js');
  require('./Preloader.js');
  require('./LoadingPage.js');
  require('./MainPage.js');

  let wechat = require('./WeChat.js');

  Zepto(function($) {

    // initialize wechat
    wechat.init();

    realWidth = window.innerWidth;
    realHeight = window.innerHeight;

    var width = window.innerWidth * window.devicePixelRatio;
    var height = window.innerHeight * window.devicePixelRatio;

    window.realWidth = width;
    window.realHeight = height;

    var game = new Phaser.Game(width, height, Phaser.CANVAS, 'mobilePage', {}, true);

    var showWidth;
    var showHeight;
    var showTop;
    var showLeft;

    // Add stages
    game.state.add('Boot', BasicGame.Boot);
    game.state.add('Preloader', BasicGame.Preloader);
    game.state.add('LoadingPage', BasicGame.LoadingPage);
    game.state.add('MainPage', BasicGame.MainPage);

    game.state.add('Game', BasicGame.Game);

    // Now start the Boot state.
    game.state.start('Boot');


  });

});
