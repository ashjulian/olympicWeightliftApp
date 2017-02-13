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
console.log("Listening on port 8080");

var SOCKET_LIST = [];

// this block of code runs when a client connects
var io = require('socket.io')(server, {});
io.sockets.on('connection', function(socket){

// temporary form of Id'ing the client. we will eventually do a login system.
socket.id = Math.random();

socket.on('vote', function(data){
    // when vote is heard prints judges vote to consol for now
    console.log('Judge ' + socket.id + " voted " + data.vote);
    //emit the vote back to all connectec sockets
    socket.broadcast.emit('judgeVoted', {
        vote:data.vote,
        judge:socket.id
    });
});


socket.emit('serverMsg',{
msg:'hello'
});




});