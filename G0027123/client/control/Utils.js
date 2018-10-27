Utils = function() {
  this.loginTime;
  this.qrExpireSeconds = 5 * 60; // 二维码失效时间
  this.delaySeconds = 3; // 每隔 delaySeconds 秒轮询一次
  this.maxPollTimes = this.qrExpireSeconds / this.delaySeconds; // 最大重试次数
  this.isDone = false;
  this.pollTimes = 0;
  this.isPaid = false;

  this.visitUrl = window.location.origin;
  this.apiBaseUrl = this.visitUrl + '/api/qroauth';
  //this.apiBaseUrl = 'http://localhost:5000/api/simulate';

  //files and images load url
  this.stagingPrefixUrl = 'https://36krvm.onekind.com.cn/staging/';
  this.productionPrefixUrl = 'https://36krvm.onekind.com.cn/production/';

  this.pollingUrl = this.apiBaseUrl + '/polling';
  this.lotteryUrl = this.apiBaseUrl + '/lottery';
  this.orderUrl = this.apiBaseUrl + '/order';
  this.orderPollingUrl = this.apiBaseUrl + '/order-polling';
  this.cntIncrementUrl = this.apiBaseUrl + '/cnt-increment';
  this.deliveredUrl = this.apiBaseUrl + '/delivered';
  this.readMachineParamsUrl = this.visitUrl + '/api/machine/info';
  this.readCardsUrl = this.visitUrl + '/api/user/gameState/query';
  this.saveCardsUrl = this.visitUrl + '/api/user/gameState/save';
  this.getParticipanceCountUrl = this.visitUrl + '/api/game/participance/count';
  this.logUrl = this.visitUrl + '/api/log/add';
  this.lotteryUrlKFC = this.visitUrl + '/api/special/kfc-lottery-vm';
};

Utils.prototype = {
  startTime: function(){
    this.loginTime = new Date();
  },

  getInteractTime: function(){
    var exitTime = new Date();
    var interactTime = 0;
    if(this.loginTime){
      interactTime = (exitTime.getTime() - this.loginTime.getTime())/1000;
    }
    return interactTime;
  },

  readMachineParams: function(uuid, machine_id, func_callback){
    var data = {
      'sessionUuid': uuid,
      'machineId': machine_id
    };
    $.ajax({
      type: 'POST',
      url: this.readMachineParamsUrl,
      data: data,
      dataType: 'json',
      //timeout: 3000,
      success: function(data){
        console.log(data);
        func_callback(data.data.machine.params);
      },
      error: function(xhr, type){

      }
    });
  },

  readCards: function(user_id, game_id, func_callback){
    var data = {
      'userId': user_id,
      'gameId': game_id
    };
    $.ajax({
      type: 'POST',
      url: this.readCardsUrl,
      data: data,
      dataType: 'json',
      //timeout: 3000,
      success: function(data){
        console.log(data);
        func_callback(data.data.state);
      },
      error: function(xhr, type){

      }
    });
  },

  saveCards: function(user_id, game_id, cards, func_callback){
    var data = {
      'userId': user_id,
      'gameId': game_id,
      'data': {
          'cards' : cards
      }
    };
    $.ajax({
      type: 'POST',
      url: this.saveCardsUrl,
      data: JSON.stringify(data),
      dataType: 'json',
      contentType:"application/json; charset=utf-8",
      //timeout: 3000,
      success: function(data){
        console.log(data);
        func_callback();
      },
      error: function(xhr, type){

      }
    });
  },

  saveGameState: function(user_id, game_id, params, func_callback){
    var data = {
      'userId': user_id,
      'gameId': game_id,
      'data': params
    };
    $.ajax({
      type: 'POST',
      url: this.saveCardsUrl,
      data: JSON.stringify(data),
      dataType: 'json',
      contentType:"application/json; charset=utf-8",
      //timeout: 3000,
      success: function(data){
        console.log(data);
        func_callback();
      },
      error: function(xhr, type){

      }
    });
  },

  getParticipanceCount: function(machine_id, game_id, func_callback){
    var data = {
      'machineId': machine_id,
      'gameId': game_id
    };
    $.ajax({
      type: 'POST',
      url: this.getParticipanceCountUrl,
      data: JSON.stringify(data),
      dataType: 'json',
      contentType:"application/json; charset=utf-8",
      //timeout: 3000,
      success: function(data){
        console.log(data);
        func_callback(data.data.count);
      },
      error: function(xhr, type){

      }
    });
  },

  addLog: function(params){
    var data = {
      'sessionUuid': params.sessionUuid,
      'machineId': params.machineId || "",
      'gameId': params.gameId || "",
      'itemId': params.itemId || "",
      'sellerId': params.sellerId || "",
      'type': params.type || "",//lottery 抽奖 play_time 单用户互动时长 follow 关注 login 用户登录
      'strValue': params.strValue || "",
      'longValue': params.longValue != undefined ? params.longValue : "",
      'intValue': params.intValue != undefined ? params.intValue : "",
    };
    $.ajax({
      type: 'POST',
      url: this.logUrl,
      data: JSON.stringify(data),
      dataType: 'json',
      contentType:"application/json; charset=utf-8",
      //timeout: 3000,
      success: function(data){
        console.log(data);
      },
      error: function(xhr, type){

      }
    });
  },

  createQRCode: function(func1_, func2_){
    var self = this;
    var qrcode = Tida.qroauth({
      client_id: "24791535", //frontend
      //client_id: "24790382", //backend
      redirect_uri: this.visitUrl + "/api/qroauth/redirect/" + BasicGame.machineId,
      view: "tmall",
      bizid: ""
    });

    func1_(qrcode);

    this.pollTimes = 0;
    this.polling(qrcode, func1_, func2_);

    return qrcode;
  },

  polling: function(qrcode, func1_, func2_) {
    var self = this;
    if (this.isDone) {
      return;
    }

    if (this.pollTimes > this.maxPollTimes) {
      //overtime
      console.log('overtime');
      this.createQRCode(func1_, func2_);
      return;
    }

    ++this.pollTimes;

    let params = {
      'sessionUuid': qrcode.sessionUuid
    };

    $.post(this.pollingUrl, params, function(data, status, xhr){
      //console.log(data);
      if(data.isLogin){
        // track the login event
        BasicGame.tracker.qrCodeLogin(GAME_ID, BasicGame.machineId);
        clearTimeout(self.pollingTimer);
      }
      func2_(data);
    }, 'json');

    this.pollingTimer = setTimeout(function(){
      self.polling(qrcode, func1_, func2_);
    }, this.delaySeconds * 1000);
  },

  lottery: function(session_uuid, machine_id, func_, score){
    var self = this;
    if(window.lotteryNum >= 1){
      return;
    }
    window.lotteryNum ++;
    let params = {
      'sessionUuid': session_uuid,
      'ua': CTL.getUA(),
      'umid': CTL.getUmidToken(),
      'machineId': machine_id,
      'gameId': GAME_ID,
      'score': score
    };

    $.ajax({
      type: 'POST',
      url: this.lotteryUrl,
      data: params,
      dataType: 'json',
      //timeout: 3000,
      success: function(data){
        //console.log(data);
        if(data.won)
          BasicGame.tracker.lottery(GAME_ID, BasicGame.machineId, data.won);
        func_(data);

        //save log
        var lotteryRes = 0;
        if(data.won == true)
            lotteryRes = 1;
        var logParams = {
            'sessionUuid': BasicGame.sessionUuid,
            'machineId': BasicGame.machineId,
            'gameId': GAME_ID,
            'type': "lottery",
            'intValue': lotteryRes
        }
        self.addLog(logParams);
      },
      error: function(xhr, type){
        func_({
          'won': false,
          'award': null,
          'eligible': false
        })
      }
    });
    /*
    $.post(this.lotteryUrl, params, function(data, status, xhr){
      console.log(data);
      console.log(status);
      console.log(xhr);
      if (xhr && xhr.status != 200) {
        data = {
          'won': false,
          'award': null,
          'eligible': false
        }
      }
      func_(data);
    }, 'json');
    */
  },

  lotteryKFC: function(session_uuid, machine_id, interact_id, shop_id, func_, score){
    var self = this;
    let params = {
      'sessionUuid': session_uuid,
      'ua': CTL.getUA(),
      'umid': CTL.getUmidToken(),
      'machineId': machine_id,
      'gameId': GAME_ID,
      'score': score,
      'interactId': interact_id,
      'shopId': shop_id
    };

    $.ajax({
      type: 'POST',
      url: this.lotteryUrlKFC,
      data: params,
      dataType: 'json',
      //timeout: 3000,
      success: function(data){
        //console.log(data);
        if(data.won)
          BasicGame.tracker.lottery(GAME_ID, BasicGame.machineId, data.won);
        func_(data);

        //save log
        var lotteryRes = 0;
        if(data.won == true)
            lotteryRes = 1;
        var logParams = {
            'sessionUuid': BasicGame.sessionUuid,
            'machineId': BasicGame.machineId,
            'gameId': GAME_ID,
            'type': "lottery",
            'intValue': lotteryRes
        }
        self.addLog(logParams);
      },
      error: function(xhr, type){
        func_({
          'won': false,
          'award': null,
          'eligible': false
        })
      }
    });
  },

  order: function(session_uuid, activity_id, machine_id, item_id, func1_, func2_, func3_){
    let params = {
      'sessionUuid': session_uuid,
      'activityId': activity_id,
      'machineId': machine_id,
      'itemId': item_id,
      'user_id': BasicGame.userId,
      'gameId': GAME_ID
    };
    //console.log("Create order");
    //console.log(params);
    var self = this;
    $.post(this.orderUrl, params, function(data, status, xhr){
      console.log(data);
      func1_(data);
      if(data.pay_qrcode_image && data.pay_qrcode_image != '') {
        self.pollTimes = 0;
        self.isPaid = false;
        self.orderPolling(func2_);
        BasicGame.tracker.order(GAME_ID, BasicGame.machineId, 1);
      } else {
        BasicGame.tracker.order(GAME_ID, BasicGame.machineId, 0);
      }
      //error: function(err) {
      //  console.log(err);
      //  func3_(err);
      //}
    }, 'json');
  },

  orderPolling: function(func_) {
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
      }
      func_(data);
    }, 'json');

    this.orderPollingTimer = setTimeout(function(){
      self.orderPolling(func_);
    }, this.delaySeconds * 1000);
  },

  peopleCountIncrement: function(machineId, count){
    var params = {
      'gameId': GAME_ID,
      'machineId': machineId,
      'count': count
    };
    console.log("Save people increment count");
    console.log(params);
    var self = this;
    $.post(this.cntIncrementUrl, params, function(data, status, xhr){
      console.log(data);
    }, 'json');
  },

  setPositionAndSize3D: function() {
    Tida.ih.call("AstraManager","setPositionAndSize",{
      "marginLeft": 0,"marginTop":331,"width":1440/0.75,"height":1440, "contentScale": 0.9
      },
      function(data){
        console.log('set position and size success!');
        console.log(data);
      },function(err){
        console.log('set position and size failed!');
        console.log(err);
    });
  },

  setPositionAndSizeNormal: function() {
    Tida.ih.call("CameraManager","setPositionAndSize",{
      "marginLeft": 0,"marginTop":331,"width":1440/0.75,"height":1440, "contentScale": 0.9
      },function(data){
        console.log('set normal camera position and size success!');
        console.log(data);
      },function(err){
        console.log('set normal camera position and size failed!');
        console.log(err);
    });
  },

  setPositionAndSizeNormalCustome: function(left, top, width, height, scale) {
    Tida.ih.call("CameraManager","setPositionAndSize",{
      "marginLeft": left,"marginTop":top,"width":width,"height":height, "contentScale": scale
      },function(data){
        console.log('set normal camera position and size success!');
        console.log(data);
      },function(err){
        console.log('set normal camera position and size failed!');
        console.log(err);
    });
  },

  setInvisible: function(invisible){
    window.WindVane.call('AstraManager', 'setInvisible', {'invisible': invisible}, function(e){
      console.log('AstraManager success:');
      console.log(e);
    }, function(e){
      console.log('AstraManger failure:');
      console.log(e);
    });
  },

  skeletonDataUpdate: function(func_callback){
    document.addEventListener('sense.skeletonDataUpdate', function(e) {
      //console.log('人物的关节坐标...');
      //console.log(e);
      func_callback(e.param);
    });
  },

  takePicture: function(requestId){
    Tida.ih.call("CameraManager","takePicture",{
      "requestId": requestId
    },function(data){
      console.log('Take picture success!');
      console.log(data);
    }, function(err){
      console.log('Take picture failed');
      console.log(err);
    });
  },

  takePictureListener: function(func_callback){
    document.addEventListener('normalCamera.takePicture.result', function(e) {
      //console.log('normalCamera.takePicture.result:' + JSON.stringify(e.param));
      func_callback(e.param.dataBase64);
    });
  },

  uploadPhoto: function(data_base64){
    Tida.ih.call("OSSUploader","uploadAsync",{"base64": data_base64});
  },

  uploadFinish: function(func_callback){
    document.addEventListener('OSSUploader.uploadFinish', function(data) {
      console.log("Upload file finished!");
      console.log(data.param);
      func_callback(data.param);
    });
  },

  vendShip: function(func_callback){
    document.addEventListener('vend.ship', function(e) {
      console.log('出货结果：');
      console.log(e);
      if(e.param.status == 'success'){
        BasicGame.tracker.vendShip(GAME_ID, BasicGame.machineId, 1);
      }
      if(e.param.status == 'failed'){
        BasicGame.tracker.vendShip(GAME_ID, BasicGame.machineId, 0);
      }

      func_callback(e.param.status);
      // if(e.param.status == 'success'){
      //   //保存出货记录
      //   var utils = new BasicGame.Utils(this);
      //   var orderId = BasicGame.orderId;
      //   var machineId = BasicGame.machineId;
      //   var channelId = BasicGame.channelId;
      //   utils.delivered(BasicGame.sessionUuid, orderId, machineId, channelId,
      //     function(data) {
      //       console.log("Save delivery result:" + JSON.stringify(data));
      //     },
      //     function(error) {
      //     });
      // }
    });
  },

  delivered: function(session_uuid, order_id, machine_id, channel_id, success_cb, error_cb) {
    let params = {
      'sessionUuid': session_uuid,
      'orderId': order_id,
      'machineId': machine_id,
      'channelId': channel_id
    };
    console.log("Save delivery");
    console.log(params);
    var self = this;
    $.post(this.deliveredUrl, params, function(data, status, xhr){
      console.log(data);
      if(data.model == null){
        BasicGame.tracker.delivered(GAME_ID, BasicGame.machineId, 0);
      } else {
        BasicGame.tracker.delivered(GAME_ID, BasicGame.machineId, 1);
      }
      success_cb(data);
    }, 'json');
  },

  readMachineInfo: function(func_callback){
    var self = this;
    Tida.ih.call("MachineInfo","getMachineInfo",{},
      function(data){
        console.log('get machine info success!');
        console.log(data);
        if(!data.machineId || data.machineId == ''){
          self.readMachineInfo(func_callback);
        } else {
          func_callback(data);
          // for (var i = 0; i < data.coils.length; i ++) {
          //   if (data.coils[i].work_status != 0) {
          //     var slot = data.coils[i].coil_id;
          //     self.clearSLotFault(slot);
          //   }
          // }
        }
      },function(err){
        console.log('get machine info failure!');
        console.log(err);
    });
  },

  clearSLotFault: function(slot){
    console.log("Clear coil " + slot);
    Tida.ih.call("ClearSLotFault","clearSLotFault",{"startSlotNum":slot, "endSlotNum": slot},
      function(data){
        console.log('Clear slot fault success!');
        console.log(data);
      }, function(err){
        console.log('Clear slot fault failure!');
        console.log(err);
      });
  },

  readCoilInfo: function(){
    //获取货道信息
    Tida.ih.call("CoilInfo","getCoilInfo",{"slotNum":1},function(data){
      console.log('get Coil Info success!');
      console.log(data);
    }, function(err){
      console.log('get Coil Info failure!');
      console.log(err);
    });
  },

  getItemAndChannelId: function(index, data, goodsCode){
    //console.log(data[index].par_name + '==' + par_name + " result " + (data[index].work_status == 0 && data[index].extant_quantity > 0 && data[index].par_name == par_name));
    if(!goodsCode){
      if(index < data.length && data[index].work_status == 0 && data[index].extant_quantity > 0){
        console.log("Find channel for " + goodsCode + "on " + data[index].coil_id);
        return {itemId: data[index].goodsCode, channelId: data[index].coil_id};
      }else{
        if(index < data.length - 1){
          return this.getItemAndChannelId(index + 1, data);
        }else{
          console.log('Out of stock!');
          return {itemId: '', channelId: -1};
        }
      }
    }else{
      if(index < data.length && data[index].work_status == 0 && data[index].extant_quantity > 0 && data[index].goodsCode == goodsCode){
        console.log("Find channel for " + goodsCode + "on " + data[index].coil_id);
        return {itemId: data[index].goodsCode, channelId: data[index].coil_id};
      }else{
        if(index < data.length - 1){
          return this.getItemAndChannelId(index + 1, data, goodsCode);
        }else{
          console.log('Out of stock!');
          return {itemId: '', channelId: -1};
        }
      }
    }
  },

  reqShip: function(func_success, func_error){
    //出货
    var timestamp = Date.parse(new Date());
    console.log("出货");
    console.log({"slotNum": BasicGame.channelId,"tradeId": timestamp});
    BasicGame.tracker.reqShip(GAME_ID, BasicGame.machineId, BasicGame.channelId);
    Tida.ih.call("ReqShip","reqShip",{"slotNum": BasicGame.channelId,"tradeId": timestamp},function(data){
      console.log('ReqShip success!');
      console.log(data);
      if(func_success)
        func_success();
    }, function(err){
      console.log('ReqShip failure!');
      console.log(err);
      BasicGame.tracker.reqShipFailed(GAME_ID, BasicGame.machineId, BasicGame.channelId);
      if(func_error)
        func_error();
    });
  },

  mergeCoils: function(id, func_success){
    Tida.ih.call("SlotManager","reqDoubleSlot",{"slotNum": id},
      function(data){
        console.log('Merge coils success!');
        console.log(data);
        func_success();
      },function(err){
        console.log('Merge coils failure!');
        console.log(err);
    });
  },

  splitCoil: function(id, func_success){
    Tida.ih.call("SlotManager","reqSingleSlot",{"slotNum": id},
      function(data){
        console.log('split coils success!');
        console.log(data);
        func_success();
      },function(err){
        console.log('split coils failure!');
        console.log(err);
    });
  },

  open3DCamera: function(func_success, func_failed){
    Tida.ih.call("AstraManager", "startSenseCamera", {}, function(data){
      console.log('open 3d camera success!');
      console.log(data);
      if(func_success)
        func_success();
    }, function(err){
      console.log('open 3d camera failed!');
      console.log(err);
      if(func_failed)
        func_failed();
    });
  },

  close3DCamera: function(func_success, func_failed){
    Tida.ih.call("AstraManager", "stopSenseCamera", {}, function(data){
      console.log('close 3d camera success!');
      console.log(data);
      if(func_success)
        func_success();
    }, function(err){
      console.log('close 3d camera failed!');
      console.log(err);
      if(func_failed)
        func_failed();
    });
  },

  openNormalCamera: function(id, func_success, func_failed, rotate){
    var params = {"cameraId":id, "portrait": false};
    if(rotate){
      params = {"cameraId":id, "portrait": false, "rotate": rotate};
    }
    Tida.ih.call("CameraManager","startNormalCamera", params,
    function(data){
      console.log('open normal camera success!');
      console.log(data);
      if(func_success)
        func_success();
    },
    function(err){
      console.log('open normal camera failed!');
      console.log(err);
      if(func_failed)
        func_failed();
    });
  },

  closeNormalCamera: function(id, func_success, func_failed){
    var params = {};
    if(id){
      params = {"cameraId": id};
    }
    Tida.ih.call("CameraManager","stopNormalCamera", params,function(data){
      console.log('close normal camera success!');
      console.log(data);
      if(func_success)
        func_success();
    }, function(err){
      console.log('close normal camera failed!');
      console.log(err);
      if(func_failed)
        func_failed();
    });
  },

  audioStart: function(){
    Tida.ih.call("AudioRecorder","start",{},
    function(data){
      console.log('Audio Recorder start success!');
      console.log(data);
    }, function(err){
      console.log('Audio Recorder start failed');
      console.log(err);
    });
  },

  audioStop: function(){
    Tida.ih.call("AudioRecorder","stop",{},
    function(data){
      console.log('Audio Recorder stop success!');
      console.log(data);
    }, function(err){
      console.log('Audio Recorder stop failed');
      console.log(err);
    });
  },

  audioListener: function(func_callback){
    document.addEventListener('audiorecorder.volumn', function(e) {
      //console.log('audiorecorder.volumn..');
      //console.log(e);
      func_callback(e.param.volumn);
    });
  },

  voiceStart: function(similarities){
    if(!similarities)
        similarities = [];
    Tida.ih.call("VoiceRecognizer","start",{
      'volumnCallback': 0,
      'autoStop': 0,
      'similarities': similarities
    },
    function(data){
      console.log('Voice Recognizer start success!');
      console.log(data);
    }, function(err){
      console.log('Voice Recognizer start failed');
      console.log(err);
    });
  },

  voiceStop: function(){
    Tida.ih.call("VoiceRecognizer","stop",{},
    function(data){
      console.log('Voice Recognizer stop success!');
      console.log(data);
    }, function(err){
      console.log('Voice Recognizer stop failed');
      console.log(err);
    });
  },

  voiceListener: function(func_callback){
    document.addEventListener('voicerec.result', function(e) {
      console.log('voicerec.result..');
      func_callback(e.param);
      console.log(e);
    });
  },

  screenShot: function(){
    Tida.ih.call("ScreenShot","screenShot",{},
    function(data){
      console.log('Screen shot success');
      console.log(data);
    }, function(err){
      console.log('Screen shot failed');
      console.log(err);
    });
  },

  getMaxVolume: function(){
    Tida.ih.call("AudioManager","getMaxVolume",{},
    function(data){
      console.log('Get max volume success');
      console.log(data);
    }, function(err){
      console.log('Get max volume failed');
      console.log(err);
    });
  },

  getVolume: function(){
    Tida.ih.call("AudioManager","getVolume",{},
    function(data){
      console.log('Get volume success');
      console.log(data);
    }, function(err){
      console.log('Get volume failed');
      console.log(err);
    });
  },

  setVolume: function(volume){
    Tida.ih.call("AudioManager","setVolume",{'volume': volume},
    function(data){
      console.log('Set volume success');
      console.log(data);
    }, function(err){
      console.log('Set volume failed');
      console.log(err);
    });
  },

  getAllUartPorts: function(func_callback) {
    Tida.ih.call("Uart","getAllUartPorts",{},
    function(data){
      console.log('Get uart port success');
      console.log(data);
      func_callback(data);
    }, function(err){
      console.log('Get uart port failed');
      console.log(err);
    });
  },

  openPort: function(port, baudrate) {
    Tida.ih.call("Uart","open",{"port": port, "baudrate": baudrate},
    function(data){
      console.log('Open this port success');
      console.log(data);
    }, function(err){
      console.log('Open this port failed');
      console.log(err);
    });
  },

  closePort: function(port) {
    Tida.ih.call("Uart","close",{"port": port},
    function(data){
      console.log('Close this port success');
      console.log(data);
      //func_callback(data.paths);
    }, function(err){
      console.log('Close this port failed');
      console.log(err);
    });
  },

  sendPortData: function(port, data) {
    Tida.ih.call("Uart","send",{"port": port, "data": data},
    function(data){
      console.log('Send data success');
      console.log(data);
      //func_callback(data.paths);
    }, function(err){
      console.log('Send data failed');
      console.log(err);
    });
  },

  portDataListener: function(func_callback) {
    document.addEventListener('uart.datarecv', function(e) {
      console.log('uart.datarecv..');
      console.log(e);
      func_callback(e.param);
    });
  },

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
  },

  //开始人脸检测
  startFaceDetect: function(camera_id, pw, ph){
    var params = {cameraId: camera_id, pw: pw, ph: ph, showLandmark:true, minInterval:100, color:'#ff00ff',pointSize: 1};
    Tida.ih.call("CameraManager","startFaceDetect", params,
    function(data){
      console.log('Start face detect success');
      console.log(data);
    }, function(err){
      console.log('Start face detect failed');
      console.log(err);
    });
  },

  //停止人脸检测
  stopFaceDetect: function(){
    Tida.ih.call("CameraManager","stopFaceDetect", {},
    function(data){
      console.log('Stop face detect success');
      console.log(data);
    }, function(err){
      console.log('Stop face detect failed');
      console.log(err);
    });
  },

  //设置人脸检测预览界面大小坐标
  setFaceCameraView: function(margin_left, margin_top , width, height){
    var params = {marginLeft: margin_left, marginTop: margin_left, width: width, height: height};
    Tida.ih.call("CameraManager","layoutFaceCameraView", {},
    function(data){
      console.log('Set face camera view success');
      console.log(data);
    }, function(err){
      console.log('Set face camera view failed');
      console.log(err);
    });
  },

  //监听人脸检测结果
  captureDetectListener: function(callback){
    document.addEventListener('FacePlugin.captureDetectResult', function (e) {
      //console.log("captureDetectResult:", e);
      callback(e);
    }, false);
  },

  //
  startInfraredSensor: function(){
    Tida.ih.call("InfraredSensor","start", {},
    function(data){
      console.log('InfraredSensor start success');
      console.log(data);
    }, function(err){
      console.log('InfraredSensor start failed');
      console.log(err);
    });
  },

  stopInfraredSensor: function(){
    Tida.ih.call("InfraredSensor","stop", {},
    function(data){
      console.log('InfraredSensor stop success');
      console.log(data);
    }, function(err){
      console.log('InfraredSensor stop failed');
      console.log(err);
    });
  },

  personDetectListener: function(callback){
    document.addEventListener('infraredsensor.persondetected', function (e) {
      console.log("infraredsensor persondetected:", e);
      callback(e);
    }, false);
  },

  personLeaveListener: function(callback){
    document.addEventListener('infraredsensor.personleave', function (e) {
      console.log("infraredsensor personleave:", e);
      callback(e);
    }, false);
  },

  infraredSensorListener: function(callback){
    document.addEventListener('infraredsensor.readfailed', function (e) {
      console.log("infraredsensor readfailed:", e);
      //callback(e);
    }, false);
  },

};
