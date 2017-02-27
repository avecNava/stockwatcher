//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var stocks = [];
var sockets = [];

io.on('connection', function (socket) {
    console.log("io.on connection")
    stocks.forEach(function (data) {
      socket.emit('stock', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      console.log("socket.on disconnect")
      sockets.splice(sockets.indexOf(socket), 1);
    });

    socket.on('stock', function (msg) {
      console.log("socket.on stock")
      var stock = String(msg || '');

      if (!stock)
        return;

      socket.get('stock', function (err, stock) {
        console.log("socket.get stock!!!!!!" + stock)
        var data = {
          stock: stock,
        };

        broadcast('stock', data);
        stocks.push(data);
      });
    });
  });


function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
