Common = function(game) {
    this.game = game;
    this.utils = new Utils();

    this.scaler = this.game.scale.userScaler;
    this.CenterX = this.scaler.designRefWidth / 2;
    this.CenterY = this.scaler.designRefHeight / 2;
    this.infoShow = false;
};

Common.prototype = {
  countDown: function(countdown_num, auto_start, func_update, func_timeout){
    var timer = this.game.time.create(false);
    timer.loop(1000, function() {
      if(countdown_num > 0){
        func_update(countdown_num);
        countdown_num --;
      } else {
          console.log('timeout');
          timer.stop();
          func_timeout(countdown_num);
      }
    }, this);
    if(auto_start){
        timer.start();
    }
    return timer;
  },

  loadAndShowImage: function(qrcodeSprite, qrcode_width, image_url, func_success, func_failed){
    var self = this;
    var scaler = this.game.scale.userScaler;
    this.game.load.image('payQrcode', image_url);
    this.game.load.onFileComplete.removeAll();
    this.game.load.onFileComplete.add(function(progress, a, result) {
      console.log('load login qrcode result:' + result);
      if(!result){
        setTimeout(function(){
          self.changePayQRCode();
          func_failed();
        }, 1000)
        return;
      }
      if (progress >= 100) {
        func_success();
        if(qrcodeSprite){
          qrcodeSprite.loadTexture('payQrcode');
          qrcodeSprite.width = scaler.scaleX(qrcode_width);
          qrcodeSprite.height = scaler.scaleX(qrcode_width);
        }
      }
    });
    this.game.load.onFileError.add(function(e) {
      console.log("Error:" + e);
    });
    this.game.load.start();
  },

  addBtnToTest: function(){
    var designX = 1080;
    var designY = 0;
    var sprite = this.game.add.button(
        this.scaler.scaleX(designX),
        this.scaler.scaleY(designY),
        'null',
        this.toTest, this,
        0, 0, 1, 0);
    sprite.anchor.setTo(1, 0);
    this.scaler.scaleSprite(sprite);
    sprite.width = this.scaler.scaleX(100);
    sprite.height = this.scaler.scaleY(100);
  },

  toTest: function(){
      window.location.href = 'https://tivm.ews.m.jaeapp.com/';
  },

  addBtnToExit: function(){
    var designX = 0;
    var designY = 0;
    var sprite = this.game.add.button(
        this.scaler.scaleX(designX),
        this.scaler.scaleY(designY),
        'null',
        this.toExit, this,
        0, 0, 1, 0);
    sprite.anchor.setTo(0, 0);
    this.scaler.scaleSprite(sprite);
    sprite.width = this.scaler.scaleX(100);
    sprite.height = this.scaler.scaleY(100);
  },

  toExit: function(){
      this.game.state.start('ExitPage');
  },

  InfoBtnHidden: function(){
    var designX = 0;
    var designY = 1920;
    var sprite = this.game.add.button(
        this.scaler.scaleX(designX),
        this.scaler.scaleY(designY),
        'null',
        this.onInfo, this,
        0, 0, 1, 0);
    sprite.anchor.setTo(0, 1);
    this.scaler.scaleSprite(sprite);
    sprite.width = this.scaler.scaleX(100);
    sprite.height = this.scaler.scaleY(100);
  },

  onHideInfo: function(){
    this.infoShow = false;
    this.game.world.remove(this.infoGroup);
  },

  onInfo: function(){
    var self = this;
    var width = 600;
    var height = 300;
    if(this.infoShow == true){
      this.infoShow = false;
      this.game.world.remove(this.infoGroup);
      return;
    }
    var machineId = '';
    var coilsStatus = [];
    this.utils.readMachineInfo(function(data){
      machineId = data.machineId;
      for(var i = 0; i < data.coils.length; i ++){
        coilsStatus.push(data.coils[i].work_status);
      }
      self.infoShow = true;

      self.game.world.remove(self.infoGroup);
      self.infoGroup = self.game.add.group();

      var designX = width/2;
      var designY = height/2;
      var sprite = self.game.add.sprite(
          self.scaler.scaleX(designX),
          self.scaler.scaleY(designY),
          'white');
      sprite.anchor.setTo(0.5);
      sprite.alpha = 1;
      self.scaler.scaleSprite(sprite);
      sprite.width = self.scaler.scaleX(width);
      sprite.height = self.scaler.scaleY(height);
      self.infoGroup.add(sprite);

      var designX = width/2;
      var designY = height/2;
      var style = {
        font: 20 + "px",
        fill: "#000000",
        align: "center",
        //fontWeight: "bold"
      };
      var str = machineId + '\n';
      str += coilsStatus.toString();
      var text = self.game.add.text(
        self.scaler.scaleX(designX),
        self.scaler.scaleY(designY),
        str,
        style);
      self.scaler.scaleSprite(text);
      text.anchor.set(0.5);
      self.infoGroup.add(text);

      self.infoGroup.x = self.scaler.scaleX(240);
      self.infoGroup.y = self.scaler.scaleY(1600);

      self.infoShow = true;
      self.game.time.events.add(Phaser.Timer.SECOND * 5, function() {
         self.onHideInfo();
      }, this);
    });
  }
};
