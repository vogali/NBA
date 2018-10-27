let QRCode = require('../../node_modules/qrcode-generator/qrcode.js');

BasicGame.ScanPage = function(game) {
  this.BallLeaveAngelStandard = 48;
  this.JumpHeightStandard = 226;
  this.KeyElbowAngelStandard = 75;

  this.jumpHeightParam = 0.26;
};

BasicGame.ScanPage.prototype = {
  init: function(params) {
    var self = this;
    //this.videoName = params.data;
    // this.data = {
    //               "BallLeaveAngel": 48.6734844128487, //球离手的角度
    //               "BallLeaveHandFrame": 166, //球离手的帧
    //               "BallPath": "http://47.104.170.134:8000/static/video/BallTraking/", //球路径记录路径
    //               "KeyHighestHandFrame": 176, //最高出手帧
    //               "Video": "http://47.104.170.134:8000/static/video/GH010139.mp4", //上传的文件
    //               "JumpHeight": 868.1160000000001, //出手的像素数
    //               "KeyElbowAngel": 44.998609548482506, //肘部角度
    //               "KeyElbowAngelFrame": 176, //肘部角度最大帧
    //               "PersonJsonOutputPath": "http://47.104.170.134:8000/static/video/PersonJsonresult/" //人的位置信息路径
    //             };

    this.frame1Status = -1;
    this.frame2Status = -1;
    this.frame3Status = -1;
    this.qrcodeUrl = this.generateQRcode();
  },

  preload: function(){
    this.load.json('shootInfo', 'data/' + window.videoName + '.json');
    this.load.image('qrcode', this.qrcodeUrl);
  },

  create: function() {
    var self = this;
    this.data = this.cache.getJSON('shootInfo');
    var video = document.getElementById('video');
    //video.src = this.data.Video;
    video.src = 'data/' + window.videoName + '.mp4';
    video.play();
    video.playbackRate = 0.5;
    video.onended = function(){
      self.time.events.add(Phaser.Timer.SECOND * 3, function() {
        if(BasicGame.firstTime == true){
          window.websocket.send('BROADCAST RECORD_STOP ' +  BasicGame.sessionUuid);
        }
        BasicGame.firstTime = false;
      }, this);

      self.qrcodeAnimation();

      video.currentTime = self.data.BallLeaveHandFrame/120;

      //
      self.time.events.add(Phaser.Timer.SECOND * 10, function() {
        window.game.state.start('ScanPage', true, false, {data: window.videoName});
        //window.game.state.start('ScanPage', true, false, {data: '20180828_144650'});
      }, this);
    }

    //BasicGame.sessionUuid = ShortUUID.uuid();
    if(BasicGame.firstTime == true){
      window.websocket.send('BROADCAST RECORD_START ' +  BasicGame.sessionUuid);
    }
    console.log(BasicGame.sessionUuid);
    this.input.onDown.add(function() {
    }, this);

    var scaler = this.scale.userScaler;
    var CenterX = scaler.designRefWidth / 2;
    var CenterY = scaler.designRefHeight / 2;
    var designX, designY, sprite;
    var self = this;

    //this.game.stage.backgroundColor = "#FFFFFF";

    designX = CenterX;
    designY = CenterY;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'mask');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);

    designX = 1758;
    designY = 128;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'logo');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);

    designX = 1417;
    designY = 842;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'wrap_gray');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.wrapState = sprite;

    designX = 1706.5;
    designY = 828.5;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'shot_gray');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.shotState = sprite;

    designX = 193;
    designY = 173;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'height_gray');
    sprite.anchor.setTo(0.5, 0);
    scaler.scaleSprite(sprite);
    this.heightState = sprite;

    designX = 162;
    designY = 1011;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'slogan');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.slogan = sprite;

    this.elbowAngleGroup = this.createElbowAngleUI();
    this.elbowAngleGroup.visible = false;

    this.elbowAngleSimilarityGroup = this.createElbowAngleSimilarityUI();
    this.elbowAngleSimilarityGroup.visible = false;

    this.shotSimilarityGroup = this.createShotSimilarityUI();
    this.shotSimilarityGroup.visible = false;

    this.heightSimilarityGroup = this.createHeightSimilarityUI();
    this.heightSimilarityGroup.visible = false;
    //this.heightSimilarityGroup.x = scaler.scaleX(1561);

    this.releaseHeightGroup = this.createReleaseHeightUI();
    this.releaseHeightGroup.visible = false;

    this.releaseAngleGroup = this.createReleaseAngleUI();
    this.releaseAngleGroup.visible = false;

    this.time.events.add(Phaser.Timer.SECOND * 2, function() {

    }, this);
    this.time.events.add(Phaser.Timer.SECOND * 4, function() {
      //this.frame2();
    }, this);
    this.time.events.add(Phaser.Timer.SECOND * 6, function() {
      //this.frame3();
    }, this);

  },

  update: function(){
    var video = document.getElementById('video');
    if(this.frame1Status == -1 && video.currentTime > this.data.KeyElbowAngelFrame/120){
      //video.pause();
      if(this.frame2Status == 0 || this.frame3Status == 0){
        video.pause();
      } else{
        this.frame1Status = 0;
        this.frame1();
        this.time.events.add(Phaser.Timer.SECOND * 2, function() {
          this.frame1Status = 1;
          video.playbackRate = 0.5;
        }, this);
        video.play();
        video.playbackRate = 0.1;
      }
    }

    if(this.frame2Status == -1 && video.currentTime > this.data.KeyHighestHandFrame/120){
      if(this.frame1Status == 0 || this.frame3Status == 0){
        video.pause();
      } else{
        this.frame2Status = 0;
        this.frame2();
        this.time.events.add(Phaser.Timer.SECOND * 2, function() {
          this.frame2Status = 1;
          video.playbackRate = 0.5;
        }, this);
        video.play();
        video.playbackRate = 0.1;
      }
    }

    if(this.frame3Status == -1 && video.currentTime > this.data.BallLeaveHandFrame/120){
      if(this.frame1Status == 0 || this.frame2Status == 0){
        video.pause();
      } else{
        this.frame3Status = 0;
        this.frame3();
        this.time.events.add(Phaser.Timer.SECOND * 2, function() {
          this.frame3Status = 1;
          video.playbackRate = 0.5;
        }, this);
        video.play();
        video.playbackRate = 0.1;
      }
    }
  },

  createElbowAngleUI: function(){
    //手臂弯曲角度
    var scaler = this.scale.userScaler;
    var designX, designY, sprite;
    var group = this.add.group();

    //graphics
    designX = 1073.5;
    designY = 305.5;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'angle');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.angle = sprite;
    group.add(sprite);

    var mask = this.add.graphics(0, 0);
    mask.beginFill(0xffffff);
    sprite.mask = mask;
    this.elbowAngle = mask;
    group.add(mask);

    designX = 1073;
    designY = 538;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'angle_bottom');
    sprite.anchor.setTo(0, 0);
    scaler.scaleSprite(sprite);
    group.add(sprite);

    //text
    designX = 1640.5;
    designY = 430;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'wrap_text');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.wrap_text = sprite;
    group.add(sprite);

    designX = 1650;
    designY = 425;
    var style = {
      font: 140 + "px 阿里智能黑",
      fill: "#000000",
      align: "center"
    };
    var str = 0;
    this.wrapAngleNumber = this.add.text(scaler.scaleX(designX), scaler.scaleY(designY), str, style);
    scaler.scaleSprite(this.wrapAngleNumber);
    this.wrapAngleNumber.anchor.set(0.5);
    group.add(this.wrapAngleNumber);

    return group;
  },

  createElbowAngleSimilarityUI: function(){
    //手臂弯曲相似度
    var scaler = this.scale.userScaler;
    var designX, designY, sprite;
    var group = this.add.group();

    this.ElbowAngleSimilarityTextGroup = this.add.group();
    group.add(this.ElbowAngleSimilarityTextGroup);

    designX = 1307.5;
    designY = 975;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'backImg');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.backImg = sprite;
    group.add(sprite);

    designX = 1415;
    designY = 873.5;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'wrap_bg');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    group.add(sprite);

    designX = 1512.5;
    designY = 857;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'wrap_obj');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    group.add(sprite);
    this.wrapObj = sprite;

    designX = 1310.5;
    designY = 683;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'wrap_text_bg');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.ElbowAngleSimilarityTextGroup.add(sprite);

    designX = 1409;
    designY = 651;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'triangle');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.triangle = sprite;
    this.ElbowAngleSimilarityTextGroup.add(sprite);

    designX = 1415;
    designY = 875.5;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'percent_circle');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    group.add(sprite);

    var mask = this.add.graphics(0, 0);
    mask.beginFill(0xffffff);
    //mask.lineStyle(scaler.scaleX(30), 0xffffff);
    sprite.mask = mask;
    this.arcMask = mask;
    group.add(mask);

    designX = 1415;
    designY = 875.5;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'mask_circle');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    group.add(sprite);

    var mask = this.add.graphics(0, 0);
    mask.beginFill(0xffffff);
    //mask.lineStyle(scaler.scaleX(30), 0xffffff);
    sprite.mask = mask;
    this.arcMaskSmall = mask;
    group.add(mask);

    designX = 1400;
    designY = 650;
    var style = {
      font: 35 + "px 阿里智能黑",
      fill: "#000000",
      align: "center"
    };
    var str = (this.data.KeyElbowAngel / 180 * 100).toFixed(0);
    this.wrapPercentNumber = this.add.text(scaler.scaleX(designX), scaler.scaleY(designY), str, style);
    scaler.scaleSprite(this.wrapPercentNumber);
    this.wrapPercentNumber.anchor.set(1, 0.5);
    this.ElbowAngleSimilarityTextGroup.add(this.wrapPercentNumber);

    designX = 1415;
    designY = 875.5;
    var style = {
      font: 50 + "px 阿里智能黑",
      fill: "#000000",
      align: "center"
    };
    var str = (this.data.KeyElbowAngel / 180 * 100).toFixed(0);
    this.wrapPercentNumber2 = this.add.text(scaler.scaleX(designX), scaler.scaleY(designY), str, style);
    scaler.scaleSprite(this.wrapPercentNumber2);
    this.wrapPercentNumber2.anchor.set(0.5);
    group.add(this.wrapPercentNumber2);

    designX = 1415;
    designY = 875.5 + 105;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'arrow_red');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.arrowRed = sprite;
    this.arrowRed.visible = false;
    group.add(sprite);

    designX = 1415;
    designY = 875.5;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'arrow_yellow');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.arrowYellow = sprite;
    this.arrowYellow.visible = false;
    group.add(sprite);

    designX = 1415;
    designY = 875.5;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'arrow_black');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.arrowBlack = sprite;
    this.arrowBlack.visible = false;
    group.add(sprite);

    return group;
  },

  createShotSimilarityUI: function(){
    //出手相似度
    var scaler = this.scale.userScaler;
    var designX, designY, sprite;
    var group = this.add.group();

    designX = 1691;
    designY = 795;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'shot_circle');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    group.add(sprite);

    var mask = this.add.graphics(0, 0);
    mask.beginFill(0xffffff);
    sprite.mask = mask;
    this.shotMask = mask;
    group.add(mask);

    designX = 1691;
    designY = 795;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'shot_0');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    group.add(sprite);

    this.shotTextGroup = this.add.group();

    designX = 1766.5;
    designY = 949;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'text_shot_sim');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.shotTextGroup.add(sprite);

    designX = 1693;
    designY = 917;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'triangle');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.angle = 90;
    this.triangleShot = sprite;
    this.shotTextGroup.add(sprite);

    designX = 1709;
    designY = 915;
    var style = {
      font: 35 + "px 阿里智能黑",
      fill: "#000000",
      align: "center"
    };
    var str = "";
    this.shotNumber = this.add.text(scaler.scaleX(designX), scaler.scaleY(designY), str, style);
    scaler.scaleSprite(this.shotNumber);
    this.shotNumber.anchor.set(0, 0.5);
    this.shotTextGroup.add(this.shotNumber);

    group.add(this.shotTextGroup);

    return group;
  },

  createHeightSimilarityUI: function(){
    //出手高度相似度
    var scaler = this.scale.userScaler;
    var designX, designY, sprite;
    var group = this.add.group();

    designX = 153.5;
    designY = 208;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'height_0');
    sprite.anchor.setTo(0.5, 0);
    scaler.scaleSprite(sprite);
    group.add(sprite);

    designX = 137.5;
    designY = 555;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'line_bar');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    group.add(sprite);

    var mask = this.add.graphics(0, 0);
    mask.beginFill(0xffffff);
    sprite.mask = mask;
    this.lineBarMask = mask;
    group.add(mask);

    designX = 162.5;
    designY = 862;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'height_pointer');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.heightPointerState = sprite;
    group.add(sprite);

    this.textHeightSimGroup = this.add.group();

    designX = 200.5;
    designY = 184;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'text_height_sim');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.textHeightSimGroup.add(sprite);

    designX = 100;
    designY = 184;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'triangle');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.scale.x *= 0.9;
    sprite.scale.y *= 0.9;
    this.textHeightSimGroup.add(sprite);

    group.add(this.textHeightSimGroup);

    designX = 254;
    designY = 890;
    var style = {
      font: 30 + "px 阿里智能黑",
      fill: "#000000",
      align: "center"
    };
    var str = "";
    this.heightNumber = this.add.text(scaler.scaleX(designX), scaler.scaleY(designY), str, style);
    scaler.scaleSprite(this.heightNumber);
    this.heightNumber.anchor.set(0, 0.5);
    group.add(this.heightNumber);

    return group;
  },

  createReleaseHeightUI: function(){
    //出手高度
    var scaler = this.scale.userScaler;
    var designX, designY, sprite;
    var group = this.add.group();

    designX = 1360.5;
    designY = 364;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'height');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    group.add(sprite);

    var mask = this.add.graphics(0, 0);
    mask.beginFill(0xffffff);
    sprite.mask = mask;
    this.releaseHeightMask = mask;
    group.add(mask);

    designX = 1586;
    designY = 479;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'height_text');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    // sprite.scale.x *= 1.28;
    // sprite.scale.y *= 1.28;
    group.add(sprite);

    designX = 1488;
    designY = 452;
    var style = {
      font: 140 + "px 阿里智能黑",
      fill: "#000000",
      align: "center"
    };
    var str = "";
    this.releaseHeightNumber = this.add.text(scaler.scaleX(designX), scaler.scaleY(designY), str, style);
    scaler.scaleSprite(this.releaseHeightNumber);
    this.releaseHeightNumber.anchor.set(0.5);
    group.add(this.releaseHeightNumber);

    return group;
  },

  createReleaseAngleUI: function(){
    //手臂弯曲角度
    var scaler = this.scale.userScaler;
    var designX, designY, sprite;
    var group = this.add.group();

    //graphics
    designX = 1073.5;
    designY = 305.5;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'angle');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    this.angle = sprite;
    group.add(sprite);

    var mask = this.add.graphics(0, 0);
    mask.beginFill(0xffffff);
    sprite.mask = mask;
    this.releaseAngleMask = mask;
    group.add(mask);

    designX = 1073;
    designY = 538;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'angle_bottom');
    sprite.anchor.setTo(0, 0);
    scaler.scaleSprite(sprite);
    group.add(sprite);

    //text
    designX = 1637.5;
    designY = 440.5;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'shot_text');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    group.add(sprite);

    designX = 1656;
    designY = 438;
    var style = {
      font: 140 + "px 阿里智能黑",
      fill: "#000000",
      align: "center"
    };
    var str = 0;
    this.releaseAngleNumber = this.add.text(scaler.scaleX(designX), scaler.scaleY(designY), str, style);
    scaler.scaleSprite(this.releaseAngleNumber);
    this.releaseAngleNumber.anchor.set(0.5);
    group.add(this.releaseAngleNumber);

    return group;
  },

  //手臂弯曲角度
  frame1: function() {
    this.releaseHeightGroup.visible = false;
    this.releaseAngleGroup.visible = false;

    this.elbowAngleGroup.visible = true;
    this.elbowAngleAnimation(this.data.KeyElbowAngel.toFixed(0));

    this.wrapState.visible = false;
    this.elbowAngleSimilarityGroup.visible = true;
    this.arcAnimation(this.data.KeyElbowAngel);
    this.arcAnimationSmall(this.data.KeyElbowAngel);
  },

  //出手高度
  frame2: function() {
    this.elbowAngleGroup.visible = false;
    this.releaseAngleGroup.visible = false;

    var scaler = this.scale.userScaler;

    this.releaseHeightGroup.visible = true;
    this.releaseHeightAnimation(this.data.JumpHeight*this.jumpHeightParam);

    this.heightState.visible = false;
    this.heightSimilarityGroup.visible = true;
    this.lineBarAnimation(this.data.JumpHeight*this.jumpHeightParam);
  },

  frame3: function(){
    this.elbowAngleGroup.visible = false;
    this.releaseHeightGroup.visible = false;

    this.releaseAngleGroup.visible = true;
    this.releaseAngleAnimation(parseInt(this.data.BallLeaveAngel));

    this.shotState.visible = false;
    this.shotSimilarityGroup.visible = true;
    var percent = 0.9 - Math.abs(this.data.BallLeaveAngel - this.BallLeaveAngelStandard)/100;
    this.shotAnimation(percent.toFixed(2));
  },

  arcAnimation: function(data){
    var scaler = this.scale.userScaler;
    var totalTime = 1*1000;

    var similarity = ((0.9 - Math.abs(data - this.KeyElbowAngelStandard)/100)*100).toFixed(0);
    var percent = similarity/100;
    var signalT = 20;
    var step = (percent*360)/(totalTime/signalT);

    var angle = 90;
    var timer = this.game.time.create(false);
    timer.loop(signalT, function() {
      angle -= step;
      if(angle < 90 - percent*360){
        timer.stop();
      } else {
        this.arcMask.arc(
          scaler.scaleX(1415),
          scaler.scaleY(875.5),
          scaler.scaleX(143),
          this.math.degToRad(90),
          this.math.degToRad(angle),
          true
        );

        var angleArrow = 360 - angle + 90;
        this.arrowYellowAnimation(angleArrow);
      }
    }, this);
    timer.start();

    //number Animation
    this.wrapPercentText = 0;
    var signalT = (totalTime)/similarity;
    var numberTimer = this.game.time.create(false);
    numberTimer.loop(signalT, function() {
      this.wrapPercentText += 1;
      if(this.wrapPercentText > similarity){
        this.wrapPercentText = similarity;
        numberTimer.stop();
      }
      this.wrapPercentNumber.setText(this.wrapPercentText + '%');
      this.wrapPercentNumber2.setText(this.wrapPercentText);
    }, this);
    numberTimer.start();
  },

  arcAnimationSmall: function(data){
    var scaler = this.scale.userScaler;
    var totalTime = 1*1000;

    var percent = 0.9 - Math.abs(data - this.KeyElbowAngelStandard)/100;
    var similarity = (data/180*100).toFixed(0);
    var signalT = 20;
    var step = (percent*360)/(totalTime/signalT);

    var angle = 90;
    var timer = this.game.time.create(false);
    var graphics = this.add.graphics(0, 0);
    this.elbowAngleSimilarityGroup.add(graphics);
    graphics.lineStyle(scaler.scaleX(2), 0xFC2D2D, 1);

    timer.loop(signalT, function() {
      angle -= step;
      if(angle < 90 - percent*360){
        angle = 90 - percent*360;
        var angleArrow = 360 - angle + 90 - step;
        timer.stop();
        //red line
        var r_inner = 45;
        var r_outer = 155;
        x_inner = scaler.scaleX(1415 - r_inner*Math.sin(2*Math.PI/360*angleArrow));
        y_inner = scaler.scaleY(875.5 + r_inner*Math.cos(2*Math.PI/360*angleArrow));

        x_outer = scaler.scaleX(1415 - r_outer*Math.sin(2*Math.PI/360*angleArrow));
        y_outer = scaler.scaleY(875.5 + r_outer*Math.cos(2*Math.PI/360*angleArrow));

        graphics.moveTo(scaler.scaleX(x_inner), scaler.scaleY(y_inner));
        graphics.lineTo(scaler.scaleX(x_outer), scaler.scaleY(y_outer));
      }

      this.arcMaskSmall.arc(
        scaler.scaleX(1415),
        scaler.scaleY(875.5),
        scaler.scaleX(143),
        this.math.degToRad(180 - angle),
        this.math.degToRad(180 - 90),
        true
      );

      var angleArrow = 360 - angle + 90 - step;
      this.arrowBlackAnimation(angleArrow);
    }, this);
    timer.start();
  },

  elbowAngleAnimation: function(data){
    var scaler = this.scale.userScaler;
    this.wrapAngleText = 0;
    var totalTime = 1*1000;

    var angle = 0;
    var graphics = this.add.graphics(0, 0);
    this.elbowAngleGroup.add(graphics);
    var percent = data / 180;
    var signalT = 20;
    var step = (percent*180)/(totalTime/signalT);

    var timer = this.game.time.create(false);
    timer.loop(signalT, function() {
      angle += step;
      if(angle > 0 + percent*180){
        angle = 0 + percent*180 + 1;
        timer.stop();
      }

      this.elbowAngle.arc(
        scaler.scaleX(1075),
        scaler.scaleY(539.5),
        scaler.scaleX(550),
        this.math.degToRad(0),
        this.math.degToRad(360 - angle + 1),
        true
      );

      var r = 535;
      x = scaler.scaleX(1075 + r*Math.cos(2*Math.PI/360*(angle - 1)));
      y = scaler.scaleY(539.5 - r*Math.sin(2*Math.PI/360*(angle - 1)));

      graphics.clear();
      graphics.lineStyle(scaler.scaleX(2), 0x000000, 0.3);
      graphics.moveTo(scaler.scaleX(1075), scaler.scaleY(539.5));
      graphics.lineTo(scaler.scaleX(x), scaler.scaleY(y));

      graphics.lineStyle(scaler.scaleX(0), 0x000000, 0.3);
      graphics.beginFill(0x000000, 0.47);
      graphics.drawCircle(scaler.scaleX(1075), scaler.scaleY(539.5), scaler.scaleX(10));

      var r = 191;
      x = scaler.scaleX(1075 + r*Math.cos(2*Math.PI/360*(angle - 1)));
      y = scaler.scaleY(539.5 - r*Math.sin(2*Math.PI/360*(angle - 1)));
      graphics.drawCircle(scaler.scaleX(x), scaler.scaleY(y), scaler.scaleX(10));

      graphics.endFill();

    }, this);
    timer.start();

    //number Animation
    var wrapAngleText = 0;
    var signalT = totalTime/data;
    var numberTimer = this.game.time.create(false);
    numberTimer.loop(signalT, function() {
      wrapAngleText += 1;
      if(wrapAngleText > data){
        wrapAngleText = data;
        numberTimer.stop();
      }
      this.wrapAngleNumber.setText(wrapAngleText);
    }, this);
    numberTimer.start();
  },

  lineBarAnimation: function(data){
    var scaler = this.scale.userScaler;
    var totalTime = 1*1000;
    var standard = this.JumpHeightStandard;

    var percent = 0.9 - Math.abs(data - standard)/standard;
    var signalT = totalTime/100;

    var rectH = 0;
    var step = 672/100;
    var timer = this.game.time.create(false);
    timer.loop(signalT, function() {
      rectH += step;
      if(rectH > percent * (620 + 1)){
        timer.stop();
      } else{
        var startX = 117;
        var startY = 865 - rectH;
        this.lineBarMask.drawRect(
          scaler.scaleX(startX),
          scaler.scaleY(startY),
          scaler.scaleX(44),
          scaler.scaleY(rectH),
        );
        this.heightPointerState.y = scaler.scaleY(862 - rectH);
        this.heightNumber.y = scaler.scaleY(862  - rectH);
      }
    }, this);
    timer.start();

    //number animation
    var heightText = 0;
    var signalT = totalTime/(percent*100);
    var numberTimer = this.game.time.create(false);
    numberTimer.loop(signalT, function() {
      heightText += 1;
      if(heightText > percent*100){
        heightText = percent*100;
        numberTimer.stop();
      }
      this.heightNumber.setText(parseInt(heightText) + '%');
    }, this);
    numberTimer.start();
  },

  releaseHeightAnimation: function(data){
    var scaler = this.scale.userScaler;
    var totalTime = 1*1000;

    var height = 0;
    var totalH = 395*data/300;
    var signalT = 20;
    var step = (totalH*signalT)/totalTime;

    var graphics = this.add.graphics(0, 0);
    this.releaseHeightGroup.add(graphics);

    var timer = this.game.time.create(false);
    timer.loop(signalT, function() {
      height += 20;
      if(height > totalH){
        height = totalH;
        timer.stop();
      }
      //console.log(height);
      var startX = 1117;
      var startY = 570 - (height + 10);
      this.releaseHeightMask.drawRect(
        scaler.scaleX(startX),
        scaler.scaleY(startY),
        scaler.scaleX(490),
        scaler.scaleY(height + 10),
      );

      graphics.clear();
      graphics.lineStyle(scaler.scaleX(2), 0x000000, 0.3);
      graphics.moveTo(scaler.scaleX(1364), scaler.scaleY(561));
      graphics.lineTo(scaler.scaleX(1250), scaler.scaleY(561 - height));
    }, this);
    timer.start();

    //number animation
    var heightText = 0;
    var signalT = 20;
    var step = data*signalT/totalTime;
    var numberTimer = this.game.time.create(false);
    numberTimer.loop(signalT, function() {
      heightText += step;
      if(heightText > data){
        heightText = data;
        numberTimer.stop();
      }
      this.releaseHeightNumber.setText(parseInt(heightText));
    }, this);
    numberTimer.start();
  },

  releaseAngleAnimation: function(data){
    var scaler = this.scale.userScaler;
    this.wrapAngleText = 0;
    var totalTime = 1*1000;

    var angle = 0;
    var graphics = this.add.graphics(0, 0);
    this.releaseAngleGroup.add(graphics);
    var percent = data / 180;
    var signalT = 20;
    var step = (percent*180)/(totalTime/signalT);

    var timer = this.game.time.create(false);
    timer.loop(signalT, function() {
      angle += step;
      if(angle > 0 + percent*180){
        angle = 0 + percent*180 + 1;
        timer.stop();
        var video = document.getElementById('video');
        video.playbackRate = 1;
      }

      this.releaseAngleMask.arc(
        scaler.scaleX(1075),
        scaler.scaleY(539.5),
        scaler.scaleX(550),
        this.math.degToRad(0),
        this.math.degToRad(360 - angle + 1),
        true
      );

      var r = 535;
      x = scaler.scaleX(1075 + r*Math.cos(2*Math.PI/360*(angle - 1)));
      y = scaler.scaleY(539.5 - r*Math.sin(2*Math.PI/360*(angle - 1)));

      graphics.clear();
      graphics.lineStyle(scaler.scaleX(2), 0x000000, 0.3);
      graphics.moveTo(scaler.scaleX(1075), scaler.scaleY(539.5));
      graphics.lineTo(scaler.scaleX(x), scaler.scaleY(y));

      graphics.lineStyle(scaler.scaleX(0), 0x000000, 0.3);
      graphics.beginFill(0x000000, 0.47);
      graphics.drawCircle(scaler.scaleX(1075), scaler.scaleY(539.5), scaler.scaleX(10));

      var r = 191;
      x = scaler.scaleX(1075 + r*Math.cos(2*Math.PI/360*(angle - 1)));
      y = scaler.scaleY(539.5 - r*Math.sin(2*Math.PI/360*(angle - 1)));
      graphics.drawCircle(scaler.scaleX(x), scaler.scaleY(y), scaler.scaleX(10));

      graphics.endFill();

    }, this);
    timer.start();

    //number Animation
    var wrapAngleText = 0;
    var signalT = (totalTime/data < 20)?20:(totalTime/data);
    var step = Math.ceil(data*signalT/totalTime);
    var numberTimer = this.game.time.create(false);
    numberTimer.loop(signalT, function() {
      wrapAngleText += step;
      if(wrapAngleText > data){
        wrapAngleText = data;
        numberTimer.stop();
      }
      this.releaseAngleNumber.setText(wrapAngleText);
    }, this);
    numberTimer.start();
  },

  shotAnimation: function(percent){
    var scaler = this.scale.userScaler;
    var totalTime = 1*1000;

    var signalT = 20;
    var angle = 270;
    var step = (percent*360)/(totalTime/signalT);

    var timer = this.time.create(false);
    timer.loop(signalT, function() {
      angle += step;
      //var d = new Date();
      //console.log(d.getMinutes() + ':' + d.getSeconds() + ':' + d.getMilliseconds());
      //console.log(angle);
      if(angle > percent * 360 + 270){
        angle = percent * 360 + 270;
        timer.stop();
      }
      this.shotMask.arc(
        scaler.scaleX(1691),
        scaler.scaleY(795),
        scaler.scaleX(78),
        this.math.degToRad(angle + step),
        this.math.degToRad(270),
        true
      );
    }, this);
    timer.start();

    //number animation
    var shotText = 0;
    var signalT = totalTime/(percent*100);
    var numberTimer = this.game.time.create(false);
    numberTimer.loop(signalT, function() {
      shotText += 1;
      if(shotText > percent*100){
        shotText = percent*100;
        numberTimer.stop();
      }
      this.shotNumber.setText(shotText.toFixed(0) + '%');
    }, this);
    numberTimer.start();
  },

  qrcodeAnimation: function(){
    var scaler = this.scale.userScaler;
    this.slogan.visible = false;
    this.elbowAngleGroup.visible = false;
    this.releaseHeightGroup.visible = false;
    this.releaseAngleGroup.visible = false;
    //this.heightSimilarityGroup.visible = false;

    designX = 1422;
    designY = 437;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'star');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.scale.x = 1.17;
    sprite.scale.y = 1.17;
    sprite.alpha = 0.6;
    this.add.tween(sprite).from({
      alpha: 0
    }, 1000 /* duration */,  Phaser.Easing.Linear.None, true,
    0   /* delay */, 0, false);

    //手臂弯曲相似度
    this.backImg.visible = false;
    this.add.tween(this.elbowAngleSimilarityGroup).to({
      x: scaler.scaleX(-1100), y: scaler.scaleY(-495)
    }, 500 /* duration */,  Phaser.Easing.Linear.None, true,
    0   /* delay */, 0, false);

    // this.add.tween(this.ElbowAngleSimilarityTextGroup).to({
    //   x: scaler.scaleX(320), y: scaler.scaleY(60)
    // }, 500 /* duration */,  Phaser.Easing.Linear.None, true,
    // 0   /* delay */, 0, false);

    this.add.tween(this.wrapObj).to({
      angle: 138,
      x: scaler.scaleX(1353),
      y: scaler.scaleY(957)
    }, 500 /* duration */,  Phaser.Easing.Linear.None, true,
    0   /* delay */, 0, false);

    // this.triangle.x -= scaler.scaleX(190);
    // this.wrapPercentNumber.x -= scaler.scaleX(70);

    //出手相似度
    this.add.tween(this.shotSimilarityGroup).to({
      x: scaler.scaleX(-1520), y: scaler.scaleY(-180)
    }, 500 /* duration */,  Phaser.Easing.Linear.None, true,
    0   /* delay */, 0, false);

    this.shotTextGroup.x += scaler.scaleX(110);
    this.shotTextGroup.y -= scaler.scaleY(70);
    // this.triangleShot.x += scaler.scaleX(150);
    // this.triangleShot.angle = -90;
    // this.shotNumber.x += scaler.scaleX(30);

    //出手高度相似度
    this.add.tween(this.heightSimilarityGroup).to({
      angle: 90,
      x: scaler.scaleX(960),
      y: scaler.scaleY(780)
    }, 500 /* duration */,  Phaser.Easing.Linear.None, true,
    0   /* delay */, 0, false);

    this.heightNumber.angle = -90;
    this.heightNumber.x -= scaler.scaleY(190);
    this.heightNumber.y += scaler.scaleX(50);

    this.textHeightSimGroup.angle = -90;
    this.textHeightSimGroup.x += scaler.scaleY(135);
    this.textHeightSimGroup.y += scaler.scaleX(450);

    //text
    var leftObjGroup = this.add.group();
    designX = 1478.5;
    designY = 893;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'text_1');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    leftObjGroup.add(sprite);

    var number = 700 - ((0.9 - Math.abs(this.data.BallLeaveAngel - this.BallLeaveAngelStandard)/100) +
                 (0.9 - Math.abs(this.data.KeyElbowAngel - this.KeyElbowAngelStandard)/100) +
                 (0.9 - Math.abs(this.data.JumpHeight*this.jumpHeightParam - this.JumpHeightStandard)/this.JumpHeightStandard))/3 * 500;
    number = parseInt(number);
    designX = 1237.5;
    designY = 764;
    var style = {
      font: 178 + "px",
      fill: "#000000",
      align: "center"
    };
    var str = number;
    var text = this.add.text(scaler.scaleX(designX), scaler.scaleY(designY), str, style);
    scaler.scaleSprite(text);
    text.anchor.set(0.5);
    leftObjGroup.add(text);

    designX = 1307;
    designY = 917;
    var style = {
      font: 44 + "px",
      fill: "#fc2d2d",
      align: "center"
    };
    var str = number;
    var trainNumber = this.add.text(scaler.scaleX(designX), scaler.scaleY(designY), str, style);
    scaler.scaleSprite(trainNumber);
    trainNumber.anchor.set(0, 0.5);
    leftObjGroup.add(trainNumber);

    designX = trainNumber.width + 1413;
    designY = 915;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'text_2');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    leftObjGroup.add(sprite);

    designX = 1776;
    designY = 908;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'qrcode');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.width = scaler.scaleX(140);
    sprite.height = scaler.scaleY(140);
    leftObjGroup.add(sprite);

    this.add.tween(leftObjGroup).from({
      alpha: 0
    }, 1000 /* duration */,  Phaser.Easing.Linear.None, true,
    0   /* delay */, 0, false);
  },

  arrowYellowAnimation: function(angle){
    var scaler = this.scale.userScaler;
    r = 85;
    this.arrowYellow.visible = true;
    this.arrowYellow.angle = 360 - angle;
    this.arrowYellow.x = scaler.scaleX(1415 + r*Math.sin(2*Math.PI/360*angle));
    this.arrowYellow.y = scaler.scaleY(875.5 + r*Math.cos(2*Math.PI/360*angle));
  },

  arrowBlackAnimation: function(angle){
    var scaler = this.scale.userScaler;
    r = 165;
    this.arrowBlack.visible = true;
    this.arrowBlack.angle = angle;
    this.arrowBlack.x = scaler.scaleX(1415 - r*Math.sin(2*Math.PI/360*angle));
    this.arrowBlack.y = scaler.scaleY(875.5 + r*Math.cos(2*Math.PI/360*angle));
  },

  generateQRcode: function() {
    var redirectUrl = 'http://localhost/development/games/G0027/qrcode?uuid=' + BasicGame.sessionUuid;
    console.log(redirectUrl);

    var typeNumber = 0;
    var errorCorrectionLevel = 'L';
    var qr = QRCode(typeNumber, errorCorrectionLevel);
    qr.addData(redirectUrl);
    qr.make();
    var qrcode_url = qr.createDataURL();
    return qrcode_url;
  },
};
