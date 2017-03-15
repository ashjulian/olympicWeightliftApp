// ------------------------------------------------------- //
// ------------ Main entry point into the server --------- //
// ------------------------------------------------------- //

// required modules for app
var express = require('express');
var app = express();
var server = require('http').Server(app);

var myJudge = null;

var judgeCount = 0;
var coordinatorCount = 0;

app.get('/', function(req, res){
    res.sendFile(__dirname + '/judge/testIndex.htm');
});
app.use(express.static(__dirname + '/judge'));
// app.get('/', function(req, res){
//     res.sendFile(__dirname + '/judge/index.htm');
// });

//app.use('', express.static(__dirname + 'judges.htm'));

server.listen(8080);
console.log("Sever Started...");
console.log("Listening on port 8080");

var Judge = function(id, judge){
    var self = {
        id: id,
        judge: judge,
        vote: ""
    }
    Judge.list[id] = self;
    return self;
}

Judge.list = {};
Judge.onConnect = function(socket, userName){
    //var assetManager = new assetManager(canvas);
    var judge = Judge(socket.id, userName);
    return judge;
    // socket.on('vote', function(data){
    
    // // when vote is heard prints judges vote to consol for now
    // console.log('Judge ' + socket.id + " voted " + data.vote);
    // //emit the vote back to all connectec sockets
    // socket.broadcast.emit('judgeVoted', {
    //     vote:data.vote,
    //     judge:socket.id
    // });      
    // });
}

// ----------------------------------------------------------------------- //
// --------------------------- SIGN IN METHODS --------------------------- //
// ----------------------------------------------------------------------- //

var USERS = {
    // username:password
    "judge1":"123",
    "judge2":"456",
    "judge3":"789",
    "coordinator":"123",
}

var isValidPassword = function(data){
    return USERS[data.username] === data.password; 
}

var isUsernameTaken = function(data){
    return USERS[data.username]; 
}

var addUser = function(data){
    USERS[data.username] = data.password; 
}

// ----------------------------------------------------------------------- //
// ----------------------------------------------------------------------- //
// ----------------------------------------------------------------------- //

var SOCKET_LIST = [];
var JUDGE_LIST = [];
var VOTE_LIST = [];

// this block of code runs when a client connects
var io = require('socket.io')(server, {});
io.sockets.on('connection', function(socket){

    // temporary form of Id'ing the client. we will eventually do a login system.
    socket.id = Math.floor(10*Math.random());
    

    socket.on('signIn', function(data){
        if(isValidPassword(data) && judgeCount <= 3){
            if(data.username === 'coordinator'){
                console.log("coordinator signed on");
                //return app.redirect('/spreadsheet.html');
                socket.emit('signInResponse', {success:true, judge:false});
                socket.emit('username', {user:data.username});
                //socket.id = data.username;
                // app.get('/', function(req, res){
                //     res.redirect(__dirname + '/spreadsheet.html');
                //     res.statusCode = 302; 
                //     res.setHeader("Location", "/spreadsheet.html");
                //     res.end();
                //});
            }else{
            
                socket.emit('signInResponse', {success:true, judge:true});
                socket.id = data.username;
                console.log();
                //judgeCount ++;
                var judge = Judge.onConnect(socket.id, data.username);
                console.log("SOCKET - signed in with socket " + socket.id + " username " + data.username + " Judge count" + judgeCount);
                console.log("Judge - signed in with ID " + socket.id + " username " + judge.judge + " Judge count" + judgeCount);
            }

            socket.emit('username', {user:data.username});
        }else{
            socket.emit('signInResponse', {success:false});
        }
            socket.emit('serverMsg',{
                msg:'Connected...'
            });
    });

    socket.on('signUp', function(data){
        if((data.username !== '') && (data.password !== '')){
            if(isUsernameTaken(data)){
                socket.emit('signUpResponse', {success:false});
            }else{
                addUser(data);
                socket.emit('signUpResponse', {success:true});
            }
        }else{
            socket.emit('signUpResponse', {success:false});
        }
    });

    socket.on('vote', function(data){
        console.log(data.username);
        if(VOTE_LIST.length === 0){
            VOTE_LIST.push({
                judge:socket.id,
                vote:data.vote,
                username:data.judge   
                });
        }else{
            for(var i in VOTE_LIST){
                var vote = VOTE_LIST[i];
                if(data.vote === vote.vote){
                    console.log('Decision Made');
                    socket.broadcast.emit('decisionMade', {decision:true, answer:data.vote});
                    VOTE_LIST.length = 0;
                }else{
                    VOTE_LIST.push({
                    judge:socket.id,
                    vote:data.vote 
                    });
                }
            }
        }

        // when vote is heard prints judges vote to consol for now
        console.log('Judge ' + socket.id + " voted " + data.vote);
        //emit the vote back to all connectec sockets
        socket.broadcast.emit('judgeVoted', {
            vote:data.vote,
            judge:socket.id
        });
    });

    socket.on('timerStart', function(data){
        socket.broadcast.emit('judgesBegin', {started:true});
    });

    socket.on('coordinatorStopped', function(data){
        socket.broadcast.emit('wipeJudges', {wipe:true});
    });

});