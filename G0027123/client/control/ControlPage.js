BasicGame.ControlPage = function(game) {
};

BasicGame.ControlPage.prototype = {
  init: function() {
    BasicGame.sessionUuid = '0aa4b1e6-b6c0-4699-b24b-b40611036e7b';
    this.wsUri = "ws://localhost:40027";
    this.websocket;

    this.initWebSocket();

    var self = this;
    setInterval(function(){
      if (!self.websocket || self.websocket.readyState != 1) {
        self.initWebSocket();
      }
    },  5000);
  },

  create: function() {
    this.input.onDown.add(function() {
    }, this);

    var scaler = this.scale.userScaler;
    var CenterX = scaler.designRefWidth / 2;
    var CenterY = scaler.designRefHeight / 2;
    var designX, designY, sprite;
    var self = this;

    //init video
    this.video = document.getElementById('video');
    video.loop = true;
    video.style.position = "absolute";
    video.style.top = "0px";
    video.style.left = "0px";
    video.style.width = scaler.scaleX(1920) + "px";

    //this.game.stage.backgroundColor = "#FFFFFF";

    designX = CenterX;
    designY = CenterY - 200;
    sprite = this.add.sprite(
        scaler.scaleX(designX),
        scaler.scaleY(designY),
        'btnStart');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.initialScale = sprite.scale.x;
    sprite.inputEnabled = true;
    sprite.events.onInputDown.add(this.onBtnDown, this);
    sprite.events.onInputUp.add(this.onStart, this);

    designX = CenterX - 300;
    designY = CenterY;
    sprite = this.add.sprite(
        scaler.scaleX(designX),
        scaler.scaleY(designY),
        'btnPrev');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.initialScale = sprite.scale.x;
    sprite.inputEnabled = true;
    sprite.events.onInputDown.add(this.onBtnDown, this);
    sprite.events.onInputUp.add(this.onPrev, this);

    designX = CenterX - 300;
    designY = CenterY + 200;
    sprite = this.add.sprite(
        scaler.scaleX(designX),
        scaler.scaleY(designY),
        'btnNext');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.initialScale = sprite.scale.x;
    sprite.inputEnabled = true;
    sprite.events.onInputDown.add(this.onBtnDown, this);
    sprite.events.onInputUp.add(this.onNext, this);

    designX = CenterX;
    designY = CenterY - 200;
    sprite = this.add.sprite(scaler.scaleX(designX), scaler.scaleY(designY), 'textCapture');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.visible = false;
    this.textCapture = sprite;

    designX = CenterX + 300;
    designY = CenterY + 200;
    sprite = this.add.sprite(
        scaler.scaleX(designX),
        scaler.scaleY(designY),
        'btnRetake');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.visible = false;
    this.btnRetake = sprite;
    sprite.initialScale = sprite.scale.x;
    sprite.inputEnabled = true;
    sprite.events.onInputDown.add(this.onBtnDown, this);
    sprite.events.onInputUp.add(this.onRetake, this);

    designX = CenterX + 300;
    designY = CenterY;
    sprite = this.add.sprite(
        scaler.scaleX(designX),
        scaler.scaleY(designY),
        'btnUpload');
    sprite.anchor.setTo(0.5);
    scaler.scaleSprite(sprite);
    sprite.visible = false;
    this.btnUpload = sprite;
    sprite.initialScale = sprite.scale.x;
    sprite.inputEnabled = true;
    sprite.events.onInputDown.add(this.onBtnDown, this);
    sprite.events.onInputUp.add(this.onUpload, this);

    designX = CenterX;
    designY = 900;
    var style = {
      font: 60 + "px 阿里智能黑",
      fill: "#ff0000",
      align: "center"
    };
    var str = '';
    this.statusText = this.add.text(
	scaler.scaleX(designX), 
	scaler.scaleY(designY),
	str,
       style);
    this.statusText.anchor.setTo(0.5);
    scaler.scaleSprite(this.statusText);

  },

  update: function(){
  },

  sendCaptureReq: function(){
    var uuid = ShortUUID.uuid();
    this.websocket.send('CAPTURE_REQ ' + uuid); 
  },

  onRetake: function(e){
    e.scale.x = e.initialScale * 1;
    e.scale.y = e.initialScale * 1;
    this.video.style.display = 'none';
    this.btnRetake.visible = false;
    this.btnUpload.visible = false;
    this.textCapture.visible = true;
    this.sendCaptureReq();
  },

  onUpload: function(e){
    e.scale.x = e.initialScale * 1;
    e.scale.y = e.initialScale * 1;
    var self = this;
    self.statusText.setText('Uploading...!');
    $.ajax({
        type :"GET",
        dataType: 'json',
        url: 'services/video/process?video=' + this.videoUrl,
        async:true,
        success: function(data) {
          console.log(data);
	  self.statusText.setText('Upload successed!');
        }, error : function(response) {
            console.log("failed");
            console.log(JSON.stringify(response));
	    self.statusText.setText('Upload failed!');
        },complete: function(){
        }
    });
  },

  initWebSocket: function(){
    var self = this;
  	if(!this.websocket){
  		this.websocket = new WebSocket(this.wsUri);
  		this.websocket.onopen = function(evt) {
  			console.log("opend");
  		};
  		this.websocket.onclose = function(evt) {
  			console.log("close");
  			self.websocket = null;
  		};
  		this.websocket.onerror = function(evt) {
  			//console.log(evt);
  		};
  		this.websocket.onmessage = function(evt) {
        var receiveStr = evt.data;
        console.log(receiveStr);
        if(receiveStr.indexOf('CAPTURE_DONE') >= 0){         
          var videoUrl = /*'../../../code/games/G0027/docker/' + */receiveStr.split(' ')[1];
	  BasicGame.sessionUuid = receiveStr.split(' ')[1].split('/')[1].replace('_raw.mp4', '');
          self.videoUrl = videoUrl;
          self.video.src = videoUrl;
          self.video.play();
          self.video.style.display = 'block';

          self.textCapture.visible = false;
          self.btnRetake.visible = true;
          self.btnUpload.visible = true;
        }
  		}
  	}
  },

  changeVideo: function(url){
          self.videoUrl = url;
          self.video.src = videoUrl;
          self.video.play();
          self.video.style.display = 'block';
  },

  onBtnDown: function(e){
    e.scale.x = e.initialScale * 0.8;
    e.scale.y = e.initialScale * 0.8;
  },

  onStart: function(e){
    e.scale.x = e.initialScale * 1;
    e.scale.y = e.initialScale * 1;
    e.visible = false;
    this.textCapture.visible = true;
    this.sendCaptureReq();
  },

  onPrev: function(e){
    e.scale.x = e.initialScale * 1;
    e.scale.y = e.initialScale * 1;
    var self = this;
    $.ajax({
        type :"GET",
        dataType: 'json',
        url: 'services/video/prev?sessionUuid=' + BasicGame.sessionUuid,
        async:true,
        success: function(data) {
          console.log(data);
          if(data.uuid != ''){
            var videoUrl = 'data/' + data.uuid + '.mp4';
	    BasicGame.sessionUuid = data.uuid.replace('_raw', '');
            self.changeVideo(videoUrl);
            self.websocket.send('BROADCAST PROCESS_DONE ' + 'data/' + data.uuid + '.mp4');
 	  }
        }, error : function(response) {
            console.log("failed");
            console.log(JSON.stringify(response));
        },complete: function(){
        }
    });

  },

  onNext: function(e){
    e.scale.x = e.initialScale * 1;
    e.scale.y = e.initialScale * 1;
    var self = this;
    $.ajax({
        type :"GET",
        dataType: 'json',
        url: 'services/video/next?sessionUuid=' + BasicGame.sessionUuid,
        async:true,
        success: function(data) {
          console.log(data);
          if(data.uuid != ''){
            var videoUrl = 'data/' + data.uuid + '.mp4';
            BasicGame.sessionUuid = data.uuid.replace('_raw', '');
            self.changeVideo(videoUrl);
            self.websocket.send('BROADCAST PROCESS_DONE ' + 'data/' + data.uuid + '.mp4');
          }
        }, error : function(response) {
            console.log("failed");
            console.log(JSON.stringify(response));
        },complete: function(){
        }
    });


  },

};
