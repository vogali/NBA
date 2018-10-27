import ManifestLoader from 'phaser-manifest-loader'
import manifest from './AssetManifestMain.js'
const context = require.context('../../server/public', true, /.*\.png|json|ttf|woff|woff2|xml|mp3|jpg$/);

BasicGame.LoadingPage = function(game) {

};

BasicGame.LoadingPage.prototype = {
  init: function() {},

  preload: function() {
  },

  create: function() {
    var scaler = this.scale.userScaler;
    var CenterX = scaler.designRefWidth / 2;
    var CenterY = scaler.designRefHeight / 2;
    var designX, designY, sprite;
    var self = this;

    designX = CenterX;
    designY = CenterY;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'bg2');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);

    designX = CenterX;
    designY = 430;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'bg');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);

    designX = CenterX;
    designY = CenterY;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'maskBg');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.alpha = 0.8;

    designX = 160;
    designY = 120;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'logo');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.scale.x *= 0.8;
    sprite.scale.y *= 0.8;

    designX = CenterX;
    designY = CenterY - 100;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'circleAnimation');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.scale.x *= 0.7;
    sprite.scale.y *= 0.7;

    designX = CenterX - 10;
    designY = CenterY - 90;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'circleWhite');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.scale.x *= 0.7;
    sprite.scale.y *= 0.7;

    designX = CenterX - 10;
    designY = CenterY - 90;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'circleBlue');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.alpha = 0.6;
    sprite.scale.x *= 0.72;
    sprite.scale.y *= 0.72;

    designX = CenterX;
    designY = CenterY + 100;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'loading');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.scale.x *= 0.7;
    sprite.scale.y *= 0.7;

    designX = CenterX - 10;
    designY = CenterY - 86;
    var style = {
      font: 36 + "px 阿里智能黑",
      fill: "#ffffff",
      align: "center"
    };
    var str = 39;
    this.loadingNumber = this.add.text(scaler.scaleX(designX), scaler.scaleY(designY), str, style);
    scaler.scaleSprite(this.loadingNumber);
    this.loadingNumber.anchor.set(0.5);

    // load manifest for loading stage
    this.game.load.onFileComplete.removeAll();
    this.game.plugins.add(ManifestLoader, context).loadManifest(manifest);
    this.game.load.onFileComplete.add( (progress, key, success, loaded, total) => {
      var self = this;
      if (loaded == total) {
        setTimeout( function(){
          self.state.start('MainPage', true);
        }, 1)
      }
    }, this);

  }

};
