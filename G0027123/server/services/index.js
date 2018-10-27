const
  bodyParser = require("body-parser"),
  child_process = require('child_process'),
  cors = require('cors'),
  express = require('express'),
  fs = require('fs'),
  fetch = require('node-fetch'),
  http = require('http'),
  moment = require('moment'),
  multer  = require('multer'),
  path = require("path"),
  FormData = require('form-data'),
  WebSocket = require('ws'),
  nodeRouter = require('./NodeRouter');

let {
  ServiceBroker
} = require("moleculer");
let ApiService = require("moleculer-web");

let broker = new ServiceBroker({
  logger: console
});

// Create a service
broker.createService({
  name: "video",
  actions: {
    process(ctx) {
      return processAndUploadVideo(ctx.params.video)
        .then(result => {
          //console.log(JSON.stringify(result));
          return result;
        });
    },
    next(ctx) {
      //console.log(ctx.params.sessionUuid);
      let sessionUuid = ctx.params.sessionUuid
      let uuids = getSorteFiles('.json');
      let result = {
        uuid: ''
      }
      for (let i = 0; i < uuids.length; i ++) {
        if (uuids[i] === sessionUuid + '_raw') {
          if (i + 1 < uuids.length) {
            result.uuid = uuids[i + 1];
            //console.log(result);
            break;
          }
        }
      }
      return result;
    },
    prev(ctx) {
      //console.log(ctx.params.sessionUuid);
      let sessionUuid = ctx.params.sessionUuid
      let uuids = getSorteFiles('.json');
      let result = {
        uuid: ''
      }
      let i = 0;
      for (; i < uuids.length; i ++) {
        if (uuids[i] === sessionUuid + '_raw') {
          if (i > 0) {
            result.uuid = uuids[i - 1];
            //console.log(result);
            break;
          }
        }
      }
      if (i == uuids.length) {
        result.uuid = uuids[uuids.length - 1];
      }
      return result;
    }
  },
});

// Load API Gateway
const svc = broker.createService({
  mixins: [ApiService],
  settings: {
     middleware: true
  }
});

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '../../dist/views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(bodyParser.urlencoded({ limit:'50mb', extended: false }));
app.use(bodyParser.json({ limit:'50mb'}));

app.use(express.static(path.join(__dirname, '../../dist')));
app.use("/data", express.static(path.join(__dirname, '../../data')));

app.use("/services", svc.express());
app.use('/', nodeRouter);

const upload = multer({ dest: 'data' });

var cpUpload = upload.fields([
  { name: 'data', maxCount: 1 },
  { name: 'poster', maxCount: 1 }
]);
app.post('/upload', cpUpload, function (req, res, next) {
  let data = {
    result: 'succeed'
  };

  fs.renameSync(req.files['data'][0].path, 'data/'+ req.body.sessionUuid + '.mp4');
  fs.renameSync(req.files['poster'][0].path, 'data/'+ req.body.sessionUuid + '.jpg');
  res.json(data);
})

let port = 60027;
app.listen(port, () => {
  console.log(`Listening on ${port} port !`)
})


function processAndUploadVideo(video) {
  return new Promise((resolve, reject) => {
    var form = new FormData();
    form.append('video', fs.createReadStream(video));
    return fetch('http://192.168.6.101:8000/upload/video', { method: 'POST', body: form })
      .then(function(res) {
        return res.json();
      }).then(function(json) {
          console.log(json);
          console.log(json.data.msg);
          let msg = json.data.msg;
          // TODO: fix video name
          let jsonFile = video.replace('.mp4', '.json');
          //let jsonFile = video.replace('.jpg', '.json');
          fs.writeFile(jsonFile, JSON.stringify(msg), error => {
            if (!error) {
              broadcastWSMessage('PROCESS_DONE ' + jsonFile);
            }
          });
          resolve(msg);
      });
  });
}

function takeVideo(video) {
  return new Promise((resolve, reject) => {
    console.log("Start to capture video " + video);
    let cmd = child_process.spawn('python', ['server/scripts/gopro.py', video]);

    cmd.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    cmd.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    cmd.on('close', (code) => {
      console.log(`Exit code of sub process ${code}`);
      if (code == 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
}

function getSorteFiles(ext) {
  let dir = "data";
  return fs.readdirSync(dir)
    .map(function(v) {
      return {
        name:v,
        time:fs.statSync(dir + '/' + v).mtime.getTime()
      };
    })
    .filter(function(file) {
      return path.extname(file.name).toLowerCase() === ext;
    })
    .sort(function(a, b) {
      return a.time - b.time;
    })
    .map(function(v) {
      return path.basename(v.name, ext);
    });
}

var WebSocketServer = WebSocket.Server;
var wss = new WebSocketServer({
  port: 40027
});

function broadcastWSMessage(msg) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

wss.on('connection', function(ws) {
  // share status to all client
  wss.clients.forEach(function each(client) {
  });

  ws.on('message', function(message) {
    console.log(message);
    if (message.indexOf('CAPTURE_REQ') == 0) {
      let uuid = message.substring("CAPTURE_REQ ".length)
      // TODO: fix video name
      let video = "data/" + uuid + '_raw.mp4';
      //let video = "data/" + moment().utcOffset(8).format("YYYYMMDD_HHmmss") + '.mp4';
      //let video = "data/" + "GH010140.jpg";

      takeVideo(video)
        .then(result => {
          console.log("Video " + video + " is ready for processing now.");
          broadcastWSMessage('CAPTURE_DONE ' + video);
        })
        .catch(err => {
          console.log("Failed to capture video " + video + " !");
          broadcastWSMessage('CAPTURE_FAILED');
        });
    } else if (message.indexOf('BROADCAST') == 0) {
      let msg = message.substring("BROADCAST ".length)
      console.log("Broadcast message: " + msg);
      broadcastWSMessage(msg);
    }

  });

  ws.on('error', function(error) {
    console.log(error);
  });
});

// Start server
broker.start();
