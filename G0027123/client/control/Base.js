window.lotteryNum = 0;
BasicGame = {
  'checkTime': 15,
  'sessionUuid': '',
  'userNick': '',
  'userId': '',
  'activityId': '',
  'orderId': '',
  'machineId': '',
  'itemId': '',
  'channelId': '',
  'gameId': '',
  'interactId': '',
  'cards': [],
  'cameraId': '',
  'tracker': new Tracker()
};

BasicGame.Scaler = function(game) {
  this.game = game;
};

BasicGame.Scaler.prototype = {

  designRefWidth: 1920,
  designRefHeight: 1080,

  scaleSprite: function(sprite) {
    sprite.scale.set(this.hScale(), this.vScale());
  },

  scaleX: function(designX) {
    return designX * this.hScale();
  },

  scaleY: function(designY) {
    return designY * this.vScale();
  },

  hScale: function() {
    return (this.game.world.width / this.designRefWidth);
  },

  vScale: function() {
    return (this.game.world.height / this.designRefHeight);
  }

};

BasicGame.Utils = function() {
  this.qrExpireSeconds = 5 * 60; // 二维码失效时间
  this.delaySeconds = 3; // 每隔 delaySeconds 秒轮询一次
  this.maxPollTimes = this.qrExpireSeconds / this.delaySeconds; // 最大重试次数
  this.isDone = false;
  this.pollTimes = 0;
  this.isPaid = false;

  this.visitUrl = window.location.origin;
  this.apiBaseUrl = this.visitUrl + '/api/qroauth';
  //this.apiBaseUrl = 'http://localhost:3020/api/simulate';

  this.pollingUrl = this.apiBaseUrl + '/polling';
  this.lotteryUrl = this.apiBaseUrl + '/lottery';
  this.orderUrl = this.apiBaseUrl + '/order';
  this.orderPollingUrl = this.apiBaseUrl + '/order-polling';
  this.cntIncrementUrl = this.apiBaseUrl + '/cnt-increment';
};

BasicGame.Utils.prototype = {

  startQRCode: function(cbQRCodeLoaded, cbLoggedIn) {
    this.cbQRCodeLoaded = cbQRCodeLoaded;
    this.cbLoggedIn = cbLoggedIn;
    this.isPolling = true;
    this.qrcode = this.getTidaQRCode();
    this.polling();
  },

  getTidaQRCode: function() {
    this.pollTimes = 0;
    //var self = this;
    var qrcode = Tida.qroauth({
      client_id: "24791535", //frontend
      //client_id: "24790382", //backend
      redirect_uri: this.visitUrl + "/api/qroauth/redirect/" + BasicGame.machineId,
      view: "tmall",
      bizid: ""
    });
    if (this.cbQRCodeLoaded) {
      this.cbQRCodeLoaded(qrcode);
    }
    console.log(qrcode);
    return qrcode;
  },

  refreshQRCode: function() {
    console.log('refresh')
    this.qrcode = this.getTidaQRCode();
  },

  stopQRCode: function() {
    this.isPolling = false;
  },

  polling: function() {
    var self = this;
    if (this.isDone || !this.isPolling) {
      return;
    }


    if (this.pollTimes > this.maxPollTimes) {
      //overtime
      console.log('overtime');
      this.qrcode = this.getTidaQRCode();
    }

    ++this.pollTimes;

    let params = {
      'sessionUuid': this.qrcode.sessionUuid
    };

    $.post(this.pollingUrl, params, function(data, status, xhr){
      //console.log(data);
      if (data.isLogin) {
        BasicGame.sessionUuid = self.qrcode.sessionUuid;
        BasicGame.userNick = data.userNick;
        BasicGame.userId = data.userId;
        self.cbLoggedIn(data);
        clearTimeout(self.pollingTimer);
        // track the login event
        BasicGame.tracker.qrCodeLogin(GAME_ID, BasicGame.machineId);
        //save log
        var utils = new Utils();
        var logParams = {
          'sessionUuid': BasicGame.sessionUuid,
          'machineId': BasicGame.machineId,
          'gameId': GAME_ID,
          'type': "login"
        }
        utils.addLog(logParams);
      }
    }, 'json');

    this.pollingTimer = setTimeout(function(){
      self.polling();
    }, this.delaySeconds * 1000);
  },

  startOrderQRCode: function(session_uuid, activity_id, machine_id, item_id, cbOrderSuccess, cbOrderFailed, cbPaid){
    this.sessionUuid = session_uuid;
    this.activityId = activity_id;
    this.machineId = machine_id;
    this.item_id = item_id;
    this.cbOrderSuccess = cbOrderSuccess;
    this.cbOrderFailed = cbOrderFailed;
    this.cbPaid = cbPaid;
    this.isOrderPolling = true;
    this.orderQRCode = this.getQrderQRCode();
    this.orderPolling();
  },

  getQrderQRCode: function(){
    let params = {
      'sessionUuid': this.sessionUuid,
      'activityId': this.activityId,
      'machineId': this.machineId,
      'itemId': this.item_id,
      'user_id': BasicGame.userId,
      'gameId': GAME_ID
    };
    //console.log("Create order");
    //console.log(params);
    var self = this;
    $.post(this.orderUrl, params, function(data, status, xhr){
      console.log(data);
      if(data.pay_qrcode_image && data.pay_qrcode_image != '') {
        BasicGame.orderId = data.order_id ? data.order_id : "";
        self.pollTimes = 0;
        self.isPaid = false;
        self.cbOrderSuccess(data);
        BasicGame.tracker.order(GAME_ID, BasicGame.machineId, 1);
      } else {
        self.cbOrderFailed(data);
        BasicGame.tracker.order(GAME_ID, BasicGame.machineId, 0);
      }
      //error: function(err) {
      //  console.log(err);
      //  func3_(err);
      //}
    }, 'json');
  },

  refreshOrderQRCode: function() {
    console.log('refresh')
    this.orderQRCode = this.getQrderQRCode();
  },

  orderPolling: function() {
    var self = this;

    if (this.isPaid) {
      return;
    }

    if (this.pollTimes > this.maxPollTimes) {
      //overtime
      console.log('overtime');
      return;
    }

    ++this.pollTimes;

    let params = {
      'sessionUuid': BasicGame.sessionUuid,
      'orderId': BasicGame.orderId
    };

    $.post(this.orderPollingUrl, params, function(data, status, xhr){
      console.log(data);
      if(data.paid){
        self.isPaid = true;
        clearTimeout(self.orderPollingTimer);
        self.cbPaid();
      }
      //func_(data);
    }, 'json');

    this.orderPollingTimer = setTimeout(function(){
      self.orderPolling();
    }, this.delaySeconds * 1000);
  },

};

module.exports = BasicGame;
