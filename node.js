// ------------------------------------------------------- //
// ------------ Main entry point into the server --------- //
// ------------------------------------------------------- //

// required modules for app
var express = require('express');
var app = express();
var server = require('http').Server(app);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/judge/judge.htm');
});
// app.get('/', function(req, res){
//     res.sendFile(__dirname + '/judge/index.htm');
// });

//app.use('', express.static(__dirname + 'judges.htm'));

server.listen(8080);
console.log("Sever Started...");

var SOCKET_LIST = [];

// this block of code runs when a client connects
var io = require('socket.io')(server, {});
io.sockets.on('connection', function(socket){

// temporary form of Id'ing the client. we will eventually do a login system.
socket.id = Math.random();

socket.on('vote', function(data){
    console.log('Judge ' + socket.id + " voted " + data.vote);
    socket.emit('judgeVoted', {
        vote:data.vote
    });
});

socket.emit('serverMsg',{
msg:'hello'
});




});