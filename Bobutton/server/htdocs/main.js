var express = require('express');
var http = require('http');
var url = require('url');
var app = express();
var send_queque = new Array();
var button_counter = {
                         '1' : { 'count_on' : 18, 'count_off' : 0, 'button_1' : -1, 'button_2' : -1, 'button_3' : -1 },
                         '2' : { 'count_on' : 12, 'count_off' : 0, 'button_1' : -1, 'button_2' : -1, 'button_3' : -1 },
                         '3' : { 'count_on' : 8, 'count_off' : 0, 'button_1' : -1, 'button_2' : -1, 'button_3' : -1 },
                         '4' : { 'count_on' : 0, 'count_off' : 0, 'button_1' : -1, 'button_2' : -1, 'button_3' : -1 },
                         '5' : { 'count_on' : 0, 'count_off' : 0, 'button_1' : -1, 'button_2' : -1, 'button_3' : -1 },
                         '6' : { 'count_on' : 0, 'count_off' : 0, 'button_1' : -1, 'button_2' : -1, 'button_3' : -1 },
                     }

app.use('/img', express.static(__dirname + '/img'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/video', express.static(__dirname + '/video'));
app.use('/js', express.static(__dirname + '/js'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/kuroko.html', function (req, res) {
  res.sendfile(__dirname + '/kuroko.html');
});

app.get('/api/button', function(req, res) {
  var url_parts = url.parse(req.url, true);
  var q = url_parts.query;


  for (wear_id in button_counter) {
    button_counter[wear_id]['trigger_on']  = -1;
    button_counter[wear_id]['trigger_off'] = -1;
    button_counter[wear_id]['button_1'] = -1;
    button_counter[wear_id]['button_2'] = -1;
    button_counter[wear_id]['button_3'] = -1;
  }

  button_counter[q.wear_id]['button_1'] = q.button_1;
  button_counter[q.wear_id]['button_2'] = q.button_2;
  button_counter[q.wear_id]['button_3'] = q.button_3;

  if (q.button_1 == 1 &&
      q.button_2 == 1 &&
      q.button_3 == 1) {
      button_counter[q.wear_id]['count_on']++;
      button_counter[q.wear_id]['trigger_on'] = 1;
  }

  if (q.button_1 == 0 &&
      q.button_2 == 0 &&
      q.button_3 == 0) {
      button_counter[q.wear_id]['count_off']++;
      button_counter[q.wear_id]['trigger_off'] = 1;
  }

  respond = {
             'status'  : 'OK',
             'wear_id' : q.wear_id,
             'button_1' : q.button_1,
             'button_2' : q.button_2,
             'button_3' : q.button_3,
            };

  res.status(200).send(JSON.stringify(respond));
  send_queque.push(button_counter);
});

app.use(function(req, res, next){
    res.status(404);
});

server = http.createServer(app)
server.listen(80);

var socketio = require('socket.io');
var io = socketio.listen(server);

io.sockets.on('connection', function(socket) {
    io.sockets.emit('count', socket.client.conn.server.clientsCount);

    socket.on('disconnect', function(data) {
      //console.log('disconnected');
    });

    // 0.1秒ごとにクライアントに最新のボタンの状態を送る
    setInterval(function() {
        if (send_queque.length >= 1) {
          data = send_queque.pop();
          console.log(data[1]);
          console.log(data[2]);
          io.sockets.emit('count_recv', data);
        }
    }, 1000);

});


