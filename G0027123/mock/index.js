const WebSocket = require('ws');


const proxy = {

  'GET /development/games/G0027/services/video/process': (req, res) => {
    let ws = new WebSocket('ws://localhost:40027');
    ws.on('open', function open() {
      ws.send("BROADCAST PROCESS_DONE data/abcd.json");
    });
    return res.json({
      id: 1,
      username: 'kenny',
      sex: 6
    });
  },

  'POST /api/machine/info': (req, res) => {
    //const { password, username } = req.body;
    let bodyData = req.body;
    let machineId = bodyData.machineId;

    return res.json({
      result: 'succeed',
      code: 0,
      data: {
        machine: {
          machineId: machineId,
          params: {},
          game: {
            gameId: 'G0027',
            brandName: 'BrandName',
            originFlag: 'OFlag',
            sellerId: 'S123456',
            shopId: 'SP123456',
            interactId: 'I123456'
          }
        }
      }
    });
  },

  'GET /api/user': {
    id: 1,
    username: 'kenny',
    sex: 6
  },
  'GET /api/user/list': [
    {
      id: 1,
      username: 'kenny',
      sex: 6
    }, {
      id: 2,
      username: 'kenny',
      sex: 6
    }
  ],
  'POST /api/login/account': (req, res) => {
    const { password, username } = req.body;
    if (password === '888888' && username === 'admin') {
      return res.json({
        status: 'ok',
        code: 0,
        token: "sdfsdfsdfdsf",
        data: {
          id: 1,
          username: 'kenny',
          sex: 6
        }
      });
    } else {
      return res.status(403).json({
        status: 'error',
        code: 403
      });
    }
  },
  'DELETE /api/user/:id': (req, res) => {
    console.log('---->', req.body)
    console.log('---->', req.params.id)
    res.send({ status: 'ok', message: '删除成功！' });
  }
}
module.exports = proxy;
