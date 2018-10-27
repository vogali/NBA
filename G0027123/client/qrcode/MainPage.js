//import mov from '../../server/public/media/GH010139-out.mp4';
BasicGame.MainPage = function(game) {

};

BasicGame.MainPage.prototype = {
  init: function() {},

  create: function() {
    var scaler = this.scale.userScaler;
    var CenterX = scaler.designRefWidth / 2;
    var CenterY = scaler.designRefHeight / 2;
    var designX, designY, sprite, button;
    var self = this;

    designX = CenterX;
    designY = CenterY;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'bg2');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);

    designX = 140;
    designY = 100;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'logo');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.scale.x *= 0.76;
    sprite.scale.y *= 0.76;

    this.video = document.getElementById('video');
    this.video.style.position = "absolute";
    this.video.style.display = "block";
    this.video.style.width = scaler.scaleX(644)/window.devicePixelRatio + "px";
    this.video.style.left = scaler.scaleX(60)/window.devicePixelRatio + "px";
    this.video.style.top = scaler.scaleY(401.5)/window.devicePixelRatio -
      scaler.scaleX(644)/window.devicePixelRatio*1080/1920/2 + "px";
    //this.video.src = mov;
    //this.video.src = window.VIDEO_SRC;

    designX = CenterX;
    designY = CenterY - 187;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'maskVideo');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.scale.x *= 0.73;
    sprite.scale.y *= 0.73;
    sprite.alpha = 0.6;
    this.maskVideo = sprite;

    designX = CenterX;
    designY = CenterY - 187;
    sprite = this.add.button(
      scaler.scaleX(designX),
      scaler.scaleY(designY),
      'btnPlay',
      this.onPlay, this,
      0, 0, 1, 0);
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.scale.x *= 0.7;
    sprite.scale.y *= 0.7;
    this.btnPlay = sprite;

    designX = CenterX;
    designY = CenterY + 220;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'slogan');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.scale.x *= 0.7;
    sprite.scale.y *= 0.7;

    designX = CenterX;
    designY = CenterY + 420;
    sprite = this.add.button(
      scaler.scaleX(designX),
      scaler.scaleY(designY),
      'btnShare',
      this.onShare, this,
      0, 0, 1, 0);
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.scale.x *= 0.7;
    sprite.scale.y *= 0.7;

    designX = CenterX;
    designY = CenterY;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'maskShare');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.visible = false;
    sprite.inputEnabled = true;
    sprite.events.onInputDown.add(this.onCloseShare, this);
    this.maskShare = sprite;

    designX = CenterX + 280;
    designY = CenterY - 500;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'arrowShare');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.scale.x *= 0.7;
    sprite.scale.y *= 0.7;
    sprite.visible = false;
    this.arrowShare = sprite;
  },
  update: function(){
    if(this.video.paused){
      this.btnPlay.visible = true;
    }
  },
  onShare: function() {
    this.maskShare.visible = true;
    this.arrowShare.visible = true;
  },
  onPlay: function() {
    this.btnPlay.visible = false;
    this.maskVideo.visible = false;
    this.video.play();
    if(this.video.ended) {
      this.btnPlay.visible = true;
      this.maskVideo.visible = true;
    }
  },
  onCloseShare: function() {
    this.maskShare.visible = false;
    this.arrowShare.visible = false;
  }
};
