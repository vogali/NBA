'use strict';

import "../../server/public/js/libs/head-1.0.3.js";

import zepto from "../../node_modules/zepto/dist/zepto.min.js";
import pixi from  '../../node_modules/phaser-ce/build/custom/pixi.min.js';
import p2 from  '../../node_modules/phaser-ce/build/custom/p2.min.js';
import phaser from  '../../node_modules/phaser-ce/build/custom/phaser-split.min.js';
import short from '../../node_modules/short-uuid/dist/short-uuid.min.js';

let QRCode = require('../../node_modules/qrcode-generator/qrcode.js');

// Global variables
var realWidth, realHeight;
var modelPos;
//window.myUtil = new Utils();
var headPoint;
var requestId = 0;
var agreeNoPrize = false;

// Load up some JS
head.load([zepto, pixi, p2, phaser, short], function() {
  require("./Tracker.js");
  require("./Base.js");
  require('./Boot.js');
  require('./Common.js');
  require('./Preloader.js');
  require('./ControlPage.js');

  require('../../server/public/css/device.css');

  // Prepare DOM
  $("body").append('<video preload id="video"></video>');
  $("body").append('<div id="devicePage"></div>');

  //var vConsole = new VConsole();
  realWidth = window.innerWidth;
  realHeight = window.innerHeight;

  var designRatio = 1920 / 1080;
  var screenRatio = realWidth / realHeight;
  if (screenRatio > designRatio) {
    realWidth = realHeight * designRatio;
  }
  var game = new Phaser.Game(realWidth, realHeight, Phaser.CANVAS, 'devicePage', {}, true);

  // Add stages
  game.state.add('Boot', BasicGame.Boot);
  game.state.add('Preloader', BasicGame.Preloader);
  game.state.add('ControlPage', BasicGame.ControlPage);
  /*game.state.add('RulePage', BasicGame.RulePage);
  game.state.add('PlayPage', BasicGame.PlayPage);
  game.state.add('ResultPage', BasicGame.ResultPage);
  game.state.add('GetPrizePage', BasicGame.GetPrizePage);
  game.state.add('OutStockPage', BasicGame.OutStockPage);
  game.state.add('ExitPage', BasicGame.ExitPage);*/

  game.state.add('Game', BasicGame.Game);

  // Now start the Boot state.
  game.state.start('Boot');
});
