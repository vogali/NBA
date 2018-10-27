function WeChat() {
};

WeChat.prototype.init = function() {

  var urlBase = window.location.href;
  urlBase = urlBase.replace(/\/[A-Za-z]*\/games(.)*/, '');
  var url = "wxconfig?url=" + document.location.href;

  $.getJSON(url, function(config) {
    // alert (data.result);
    //alert(JSON.stringify(config));

    config.debug = false;
    config.jsApiList = ['onMenuShareTimeline',
      'onMenuShareAppMessage'
    ]
    wx.config(config);

    wx.ready(function() {

      wx.onMenuShareTimeline({
        title: 'AI智慧篮球教练',
        link: window.location.href,
        imgUrl: require('../../server/public/images/qrcode/logo_wechat.png'),
        success: function() {
          console.log('share success');
        },
        cancel: function() {},
        complete: function(res) {}
      });

      wx.onMenuShareAppMessage({
        title: 'AI智慧篮球教练',
        link: window.location.href,
        imgUrl: require('../../server/public/images/qrcode/logo_wechat.png'),
        desc: '想修炼成雷阿伦，你只差一位智慧篮球教练Powered by SAP Leonardo.',
        type: '',
        dataUrl: '',
        success: function() {
          console.log('share success');
        },
        cancel: function() {},
        complete: function(res) {}
      });

      // play audio here

      //alert("ready");
      //console.log('successed')
    });

    wx.error(function(res) {
      //alert(res);
      console.log('error!!');
    });
  });
}
module.exports = new WeChat();
