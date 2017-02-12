// ------------------------------------------------------- //
// ------------ Main entry point into the server --------- //
// ------------------------------------------------------- //

// required modules for app
var express = require('express');
var app = express();
var server = require('http').Server(app);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/judges/index.html');
});

server.listen(8080);
console.log("Sever Started...");

var SOCKET_LIST = [];

// this block of code runs when a client connects
var io = require('socket.io')(server, {});
io.sockets.on('connection', function(socket){

// temporary form of Id'ing the client. we will eventually do a login system.
socket.id = Math.random();

socket.on('happy', function(data){
    console.log('Judge ' + socket.id + " voted " + data.reason);
});

socket.emit('serverMsg',{
msg:'hello'
});




});