var FormData = require('form-data');
var fs = require('fs');
let fetch = require('node-fetch');

var form = new FormData();

form.append('video', fs.createReadStream('/Users/wenpeng.xiao/Desktop/GH010140.jpg'));


fetch('http://47.104.170.134:8000/upload/video', { method: 'POST', body: form })
  .then(function(res) {
    //console.log(res);
    return res.json();
  }).then(function(json) {
      //console.log(json);
      console.log(json.data);
  });
