const express = require('express'),
  WeChatConfig = require('./WeChatConfig');

var router = express.Router();
var config = new WeChatConfig();

router.get('/status.check', function(req, res, next) {
  res.write("ok");
  res.end();
});

router.get('/qrcode', function(req, res, next) {
  let sessionUuid = req.query.uuid;
  console.log("sessionUuid=" + sessionUuid);
  return res.render('qrcode', {
    'sessionUuid': sessionUuid
  });
});

router.get('/wxconfig', function(req, res, next) {

  //console.log(req.originalUrl);


  //console.log(req.originalUrl);
  var url = req.originalUrl.split("url=")[1].split("?callback=")[0];
  console.log("Get token for url: " + url);

  config.getSignature(url)
    .then(result => {
      let wxconfig = {
        debug: false,
        appId: result.appId,
        timestamp: result.timestamp,
        nonceStr: result.nonceStr,
        signature: result.signature,
        jsApiList: null
      };
      var json = JSON.stringify(wxconfig);
      res.end(json);
    });
});
module.exports = router;
