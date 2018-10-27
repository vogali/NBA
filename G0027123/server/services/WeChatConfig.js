var request = require('request');
var crypto = require('crypto');
var low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('data/db.json')
var db = low(adapter);

function WeChatConfig() {
};

WeChatConfig.prototype.getSignature =  function(url) {
  return new Promise((resolve, reject) => {
    return this.getTokenAndTicket()
      .then(result => {
        let timestamp = this.getTimesTamp();
        let nonceStr = this.getNonceStr();
        var str = 'jsapi_ticket=' + config.jsApiTicket +
          '&noncestr=' + nonceStr +
          '&timestamp=' + timestamp +
          '&url=' + url;
        //console.log(str);
        var signature = crypto.createHash('sha1').update(str).digest('hex');
        var results = {
          appId: config.appId,
          timestamp: timestamp,
          nonceStr: nonceStr,
          signature: signature
        };
        resolve(results);
      })
  });
}

WeChatConfig.prototype.getTokenAndTicket = function() {
  return new Promise((resolve, reject) => {
    var d = new Date().getTime();
    if (d - Number(db.get("wx_generated_time").value()) > 6800000) { // 6800 seconds
      console.log('Renew the token');
      return this.getNewAccessToken()
        .then(token => {
          console.log("token=");
          console.log(token);
          config.accessToken = token;
          return this.getNewJsApiTicket();
        })
        .then(ticket => {
          console.log("ticket=");
          console.log(ticket);
          config.jsApiTicket = ticket;
          db.set("wx_generated_time", d).value();
          db.set("wx_access_token", config.accessToken).value();
          db.set("wx_js_api_ticket", config.jsApiTicket).value();
          resolve();
        });
    } else {
      console.log('Use the cached token');
      //console.log(reply);
      config.accessToken = db.get("wx_access_token").value();
      config.jsApiTicket = db.get("wx_js_api_ticket").value();
      resolve();
    };
  });
}

WeChatConfig.prototype.getNewAccessToken = function() {
  return new Promise((resolve, reject) => {
    var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appId=' + config.appId + '&secret=' + config.appSecret;

    request.get(tokenUrl, function(error, response, body) {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body).access_token);
      }
    });

  });
}

WeChatConfig.prototype.getNewJsApiTicket = function() {
  return new Promise((resolve, reject) => {
    request.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + config.accessToken + '&type=jsapi', function(error, res, body) {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body).ticket);
      }
    });
  })
}

WeChatConfig.prototype.getTimesTamp = function() {
  return parseInt(new Date().getTime() / 1000) + '';
}

WeChatConfig.prototype.getNonceStr = function() {
  return Math.random().toString(36).substr(2, 15);
}

var app = {
  id: 'wx31c7527912138ba3',
  secret: 'e4dce3c933bd1737da245925a45a2e9e',
  nonceStr: 'Studiocitymacau'
};

var config = {
  appId: app.id,
  appSecret: app.secret,
  appToken: app.nonceStr,
  accessToken: null,
  jsApiTicket: null,
};

db.defaults({
  wx_generated_time: 0,
  wx_access_token: null,
  wx_js_api_ticket: null
}).value();

module.exports = WeChatConfig;
