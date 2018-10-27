var _czc = _czc || [];
_czc.push(["_setAccount", "1273207290"]);

Tracker = function() {};

Tracker.prototype = {

  qrCodeLogin: function(gameId, machineId) {
    // user is logged in

    // event
    _czc.push(["_trackEvent", "用户", "扫码登录", gameId + '/' + machineId, 1]);

    // virtual pv
    _czc.push([ "_trackPageview", "/tracking/pages/qrcodelogin"]);
  },

  interactTime: function(gameId, machineId, timeInSeconds, isCompleted) {

    // event
    if(isCompleted){
      _czc.push(["_trackEvent", "用户", "游戏时长", gameId + '/' + machineId, timeInSeconds]);
    } else {
      _czc.push(["_trackEvent", "用户", "退出时长", gameId + '/' + machineId, timeInSeconds]);
    }

    // virtual pv
    //_czc.push([ "_trackPageview", "/tracking/pages/qrcodelogin"]);
  },

  lottery: function(gameId, machineId, won) {
    var value = 0;
    if(won)
      value = 1;
    // event
    _czc.push(["_trackEvent", "用户", "抽奖", gameId + '/' + machineId, value]);

    // virtual pv
    //_czc.push([ "_trackPageview", "/tracking/pages/qrcodelogin"]);
  },

  order: function(gameId, machineId, value) {

    // event
    _czc.push(["_trackEvent", "用户", "创建订单", gameId + '/' + machineId, value]);

    // virtual pv
    //_czc.push([ "_trackPageview", "/tracking/pages/qrcodelogin"]);
  },

  reqShip: function(gameId, machineId, channelId) {

    // event
    _czc.push(["_trackEvent", "用户", "出货请求", gameId + '/' + machineId, channelId]);

    // virtual pv
    //_czc.push([ "_trackPageview", "/tracking/pages/qrcodelogin"]);
  },

  reqShipFailed: function(gameId, machineId, channelId) {

    // event
    _czc.push(["_trackEvent", "用户", "出货失败", gameId + '/' + machineId, channelId]);

    // virtual pv
    //_czc.push([ "_trackPageview", "/tracking/pages/qrcodelogin"]);
  },

  vendShip: function(gameId, machineId) {

    // event
    _czc.push(["_trackEvent", "用户", "出货结果", gameId + '/' + machineId, 1]);

    // virtual pv
    //_czc.push([ "_trackPageview", "/tracking/pages/qrcodelogin"]);
  },

  delivered: function(gameId, machineId, value) {

    // event
    _czc.push(["_trackEvent", "用户", "保存出货结果", gameId + '/' + machineId, value]);

    // virtual pv
    //_czc.push([ "_trackPageview", "/tracking/pages/qrcodelogin"]);
  },

  payFailed: function(gameId, machineId) {

    // event
    _czc.push(["_trackEvent", "用户", "订单支付失败", gameId + '/' + machineId]);

    // virtual pv
    //_czc.push([ "_trackPageview", "/tracking/pages/qrcodelogin"]);
  },

  challengeSuccess: function(gameId, machineId, value) {
    // event
    _czc.push(["_trackEvent", "用户", "答题挑战成功", gameId + '/' + machineId, value]);
  },

  answers: function(gameId, machineId, questionId, value) {
    // event
    _czc.push(["_trackEvent", "用户", "答题选项", gameId + '/' + machineId + '/' + questionId, value]);
  },
  
  blessingBag: function(gameId, machineId, blessing) {
    // event
    _czc.push(["_trackEvent", "用户", blessing, gameId + '/' + machineId, 1]);
  },
};

module.exports = Tracker;