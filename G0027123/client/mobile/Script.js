'use strict';

require('./Tracker.js');
require('./Base.js');
require('./Boot.js');

/*
require('./Preloader.js');
require('./CheckOrientation.js');
require('./StartPage.js');
*/

require('../../server/public/css/mobile.css');


var realWidth, realHeight;
var gameTop = 0;
Zepto(function($) {
  realWidth = window.innerWidth;
  realHeight = window.innerHeight;

  var width = window.innerWidth * window.devicePixelRatio;
  var height = window.innerHeight * window.devicePixelRatio;

  window.realWidth = width;
  window.realHeight = height;

  /*
  var designRatio = 750 / 1185;
  var screenRatio = width / height;
  if (screenRatio < designRatio * 0.9) {
    width = width;
    height = width / designRatio;
    var top = (realHeight - realWidth/designRatio) / 2;
    gameTop = top;
    $("#mobilePage").css('top', top + 'px');
    //console.log(width + "x" + width + " offset " + top);
    realHeight = realWidth / designRatio;
  }
  */

  var game = new Phaser.Game(width, height, Phaser.CANVAS, 'mobilePage', {}, true);

  var showWidth;
  var showHeight;
  var showTop;
  var showLeft;

  // Add stages
  game.state.add('Boot', BasicGame.Boot);
  game.state.add('CheckOrientation', BasicGame.CheckOrientation);
  game.state.add('Preloader', BasicGame.Preloader);
  game.state.add('StartPage', BasicGame.StartPage);

  game.state.add('Game', BasicGame.Game);

  // Now start the Boot state.
  game.state.start('Boot');

});
