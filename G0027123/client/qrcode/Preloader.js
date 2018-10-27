import ManifestLoader from 'phaser-manifest-loader'
import manifest from './AssetManifestLoading.js'
const context = require.context('../../server/public', true, /.*\.png|json|ttf|woff|woff2|xml|mp3|jpg$/);

BasicGame.Preloader = function(game) {
};

BasicGame.Preloader.prototype = {
  preload: function() {
  },

  create: function() {
    var scaler = this.scale.userScaler;
    var CenterX = scaler.designRefWidth / 2;
    var CenterY = scaler.designRefHeight / 2;
    var designX, designY, sprite;

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

    // load manifest for loading stage
    this.game.load.onFileComplete.removeAll();
    this.game.plugins.add(ManifestLoader, context).loadManifest(manifest);
    this.game.load.onFileComplete.add( (progress, key, success, loaded, total) => {
      //console.log("Lading complete: " + progress + "% - " + loaded + " out of " + total);
      if (loaded == total) {
        var self = this;
         setTimeout( function(){
          self.state.start('LoadingPage', false);
        }, 1)
      }
    }, this);

	},


  update: function() {
  }
};
