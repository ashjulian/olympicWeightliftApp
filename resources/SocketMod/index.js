var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  // ------- nickname
  socket.on('join', function(name){
    socket.nickname = name;

  });
// ----------
  //console.log('a user connected');
//   socket.on('disconnect', function(){
//   console.log('user disconnected');
//   });
socket.on('chat message', function(msg){
    // --------nickname
    if(socket.nickname !== " "){
      var nickname = socket.nickname;
    }else if(socket.nickname === " "){
      var nickname = "anonymous";
    }
    // ---------------------
    console.log(nickname + ': ' + msg);
    io.emit('chat message', nickname + ": " + msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});