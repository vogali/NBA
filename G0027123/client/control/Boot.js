import ManifestLoader from 'phaser-manifest-loader'
import manifest from './AssetManifest'
const req = require.context('../../server/public', true, /.*\.png|json|ttf|woff|woff2|xml|mp3|jpg$/);

BasicGame.Boot = function(game) {};

BasicGame.Boot.prototype = {

  preload: function() {
    this.game.plugins.add(ManifestLoader, req).loadManifest(manifest);

    //var utils = new Utils();
    //utils.loadImage(this, 'device/bg');
  },

  create: function() {
    this.input.maxPointers = 1;
    this.input.touch.preventDefault = true;
    this.stage.disableVisibilityChange = true;

    BasicGame.orientated = true;
    //this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.game.physics.p2.setImpactEvents(true);

    // set the customize scaler
    this.scale.userScaler = new BasicGame.Scaler(this);

    if (this.game.device.desktop) {
      this.scale.setResizeCallback(this.gameResized, this);
    } else {}
    this.state.start('Preloader');

    /*setInterval(function() {
      Tida.ih.call("AstraManager", "getPeopleCntIncrement", {},
        function(data) {
          console.log('Get people cnt increment success!');
          console.log(data);
          if (data && data.peopleCntIncrement > 0) {
            var utils = new Utils();
            utils.peopleCountIncrement(BasicGame.machineId, data.peopleCntIncrement);
          }
        },
        function(err) {
          console.log('Get people cnt increment failure!');
          console.log(err);
        });
    }, 1000 * 60 * 10);*/


  },
  gameResized: function(width, height) {
    //  This could be handy if you need to do any extra processing if the game resizes.
    //  A resize could happen if for example swapping orientation on a device.
    //console.log(height);
  },
};
