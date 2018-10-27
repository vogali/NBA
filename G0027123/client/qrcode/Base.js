BasicGame = {

};

BasicGame.Scaler = function(game) {
  this.game = game;
};

BasicGame.Scaler.prototype = {

  designRefWidth: 750,
  designRefHeight: 1185,
  screenWidth: 1,
  screenHeight: 1,

  setScreenSize: function(w, h) {
    this.screenWidth = w;
    this.screenHeight = h;
  },

  scaleSprite: function(sprite, ratio) {
    var r = ratio ? ratio : 1;
    sprite.scale.set(this.hScale() * r, this.vScale() * r);
  },

  scaleBgSprite: function(sprite, ratio) {
    var r = ratio ? ratio : 1;
    sprite.scale.set((this.screenWidth / this.designRefWidth) * r,
      (this.screenHeight / this.designRefHeight) * r);
  },

  scaleBgX: function(designX) {
    return designX * (this.screenWidth / this.designRefWidth);
  },

  scaleBgY: function(designY) {
    return designY * (this.screenHeight / this.designRefHeight);
  },

  scaleX: function(designX) {
    if(window.offsetX){
        return window.offsetX + designX * this.hScale();
    } else {
        return designX * this.hScale();
    }
  },

  scaleY: function(designY) {
    if(window.offsetY){
        return window.offsetY + designY * this.vScale();
    } else{
        return designY * this.vScale();
    }
  },

  hScale: function() {
    if(window.offsetX && window.offsetX != 0)
      return (this.screenHeight / this.designRefHeight);
    else
      return (this.screenWidth / this.designRefWidth);
  },

  vScale: function() {
    if(window.offsetY && window.offsetY != 0)
      return (this.screenWidth / this.designRefWidth);
    else
      return (this.screenHeight / this.designRefHeight);
  },

  scaleBgSprite: function(sprite, ratio) {
    var r = ratio ? ratio : 1;
    sprite.scale.set((this.screenWidth / this.designRefWidth) * r,
    (this.screenHeight / this.designRefHeight) * r);
  },

  scaleBgX: function(designX) {
    return designX * (this.screenWidth / this.designRefWidth);
  },

  scaleBgY: function(designY) {
    return designY * (this.screenHeight / this.designRefHeight);
  },

};
