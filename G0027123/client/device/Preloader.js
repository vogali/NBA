//import mov from '../../server/public/media/GH010139-out.mp4';
//console.log(mov);

BasicGame.Preloader = function(game) {
  this.ready = false;
};

BasicGame.Preloader.prototype = {
  init: function() {

  },
  preload: function() {

  },
  create: function() {
    var scaler = this.scale.userScaler;
    var CenterX = scaler.designRefWidth / 2;
    var CenterY = scaler.designRefHeight / 2;
    var designX, designY, sprite;

    //init video
    var video = document.getElementById('video');
    //video.loop = true;
    video.style.position = "absolute";
    video.style.top = "0px";
    video.style.left = "0px";
    video.style.width = scaler.scaleX(1920) + "px";
    //video.src = '/media/GH010139-out.mp4';
    //video.src = 'http://36krvm.onekind.com.cn/staging/media/G0027/GH010139-out.mp4';
    //video.src = mov;
    video.play();
    video.style.display = 'block';

    this.ready = true;
	},
  update: function() {
    if (this.ready) {
        BasicGame.firstTime = true;
        BasicGame.sessionUuid = 'e1dd3bcb-6ede-4052-8391-279df2129cea';
        console.log("name:" + BasicGame.sessionUuid);
        window.videoName = 'e1dd3bcb-6ede-4052-8391-279df2129cea_raw';
        window.game.state.start('ScanPage', true, false, {data: window.videoName});

      //this.state.start('ScanPage');
      //this.state.start('ChoosePage', true, false, {'gender': 0});
      //this.state.start('ResultPage', true, false, {'challengeSuccess': true, 'eligible': true, 'won': false});
      //this.state.start('GetPrizePage', true, false, {'type': 'dropDirectly', 'won': false});
    }
  }
};
