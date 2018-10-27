var FormData = require('form-data');
var fs = require('fs');
let fetch = require('node-fetch');

var form = new FormData();

form.append('sessionUuid', '3f2ac44d-10f0-4800-9a83-4fdab6f76e51');
form.append('data', fs.createReadStream('data/abcd.mp4'));


fetch('http://projects.36krvm.com/staging/games/G0027/upload', { method: 'POST', body: form })
  .then(function(res) {
    console.log(res);
    return res.json();
  }).then(function(json) {
      //console.log(json);
      console.log(json.data);
  });
