
BasicGame.Preloader = function(game) {
  this.ready = false;
};

BasicGame.Preloader.prototype = {
  init: function() {

  },
  preload: function() {

  },
  create: function() {
    var scaler = this.scale.userScaler;
    var CenterX = scaler.designRefWidth / 2;
    var CenterY = scaler.designRefHeight / 2;
    var designX, designY, sprite;

    this.ready = true;
	},
  update: function() {
    if (this.ready) {
      this.state.start('ControlPage');
      //this.state.start('ChoosePage', true, false, {'gender': 0});
      //this.state.start('ResultPage', true, false, {'challengeSuccess': true, 'eligible': true, 'won': false});
      //this.state.start('GetPrizePage', true, false, {'type': 'dropDirectly', 'won': false});
    }
  }
};
