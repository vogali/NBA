const
  child_process = require('child_process'),
  moment = require('moment'),
  WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:40027');

function takeVideo() {
  let video = "data/" + moment().utcOffset(8).format("YYYYMMDD_HHmmss") + '.mp4';
  let cmd = child_process.spawn('python', ['gopro.py', video]);

  cmd.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  cmd.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  cmd.on('close', (code) => {
    console.log(`Exit code of sub process ${code}`);
  });

}

ws.on('open', function open() {
  console.log("opened!");
  ws.send('CAPTURE_REQ');
  ws.close();
});
