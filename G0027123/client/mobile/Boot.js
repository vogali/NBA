BasicGame.Boot = function(game) {};

BasicGame.Boot.prototype = {

  preload: function() {
  },

  create: function() {
    this.input.maxPointers = 1;
    this.input.touch.preventDefault = true;
    this.stage.disableVisibilityChange = true;

    BasicGame.orientated = true;
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    
    this.game.stage.backgroundColor = "#dc0026";
    // set the customize scaler
    this.scale.userScaler = new BasicGame.Scaler(this);
    this.scale.userScaler.setScreenSize(window.realWidth, window.realHeight);

    if (this.game.device.desktop) {} else {
      this.scale.forceOrientation(false, true);
      this.scale.setResizeCallback(this.gameResized, this);
      this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
      this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
    }
    this.state.start('CheckOrientation');
  },
  gameResized: function(width, height) {
    //  This could be handy if you need to do any extra processing if the game resizes.
    //  A resize could happen if for example swapping orientation on a device.
    //console.log(height);
  },
  enterIncorrectOrientation: function() {
    BasicGame.orientated = false;
    document.getElementById('orientation').style.display = 'block';
  },
  leaveIncorrectOrientation: function() {
    BasicGame.orientated = true;
    document.getElementById('orientation').style.display = 'none';
    //this.scale.setScreenSize(true);
    this.state.start(this.state.current);
  }
};
