Utils = function() {
  //files and images load url
  this.stagingPrefixUrl = 'https://36krvm.onekind.com.cn/staging/';
  this.productionPrefixUrl = 'https://36krvm.onekind.com.cn/production/';
};

Utils.prototype = {
  getPrefix: function() {
    var prefix;
    if(window.location.hostname.split('.')[0] == 'tivms') {
      prefix = this.stagingPrefixUrl;
    } else if(window.location.hostname.split('.')[0] == 'tivm') {
      prefix = this.productionPrefixUrl;
    } else {
      prefix = window.location.origin + '/';
    }
    return prefix;
  },

  loadImage: function(game, frame, path) {
    game.load.image(frame, this.getPrefix() + path + "?v=" +  BasicGame.version);
  },
  
  loadSpritesheet: function(game, frame, path, w, h) {
    game.load.spritesheet(frame, this.getPrefix() + path + "?v=" +  BasicGame.version, w, h);
  },

  loadJSON: function(game, frame, path) {
    game.load.json(frame, this.getPrefix() + path + "?v=" +  BasicGame.version);
  },

  loadAudio: function(game, frame, path) {
    game.load.audio(frame, this.getPrefix() + path + "?v=" +  BasicGame.version);
  }
};
