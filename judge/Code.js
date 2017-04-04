$(document).ready(function () {
    "use strict";

        // makes global socket variable creating a web socket connection from client to app.js
        var socket = io();
        var vote = true;
        var castedVote = false;
        // sign in elements 
        var signDivPassword = null;;
        var signDivUsername = null;
        var coordinatorDiv = null;
        //var arrowDiv = null;



        var agent = "";

        var voteDivClean = null;
        var waitDivClean = null;       

        /***************************** NODE RECEIVERS ******************************/

        socket.on("connect", function(data){
            //wire up the input tags to the objects

            //voteDiv = document.getElementById('voteDiv');

            //waitDiv = document.getElementById('waitDiv');
            
            //arrowDiv = document.getElementById('arrow');

            // sign in elements
            //signDiv = document.getElementById('signDiv');
            signDivUsername = document.getElementById('signDiv-username');
            // signDivSignIn = document.getElementById('signDiv-signIn');
            // signDivSignIn = document.getElementById('signDiv-signIn');
            // signDivSignUp = document.getElementById('signDiv-signUp');
            signDivPassword = document.getElementById('signDiv-password');
            coordinatorDiv = document.getElementById('coordinatorDiv');
            //console.log("Connected...");
            enableVoting(false);
        });
        
        socket.on('signInResponse', function(data){
            if(data.success){
                if(data.judge){
                    $('#signDiv').toggle();
                    $('#voteDiv').toggle();
                    voteDivClean = $('#voteDiv').clone(true);
                    waitDivClean = $('#waitDiv').clone(true);
                }else {
                    $('#signDiv').toggle();
                    $('#coordinatorDiv').toggle();
                }
            }else{
                alert('Sign in unsuccessful');
            }
        });

        socket.on('username', function(data){
            agent = data.user;
        });

        socket.on('signUpResponse', function(data){
            if(data.success){
                alert('Sign up successful');
            }else{
                alert('Sign up unsuccessful');
            }
        });

        socket.on('serverMsg', function(data){
            console.log(data.msg);
        });

        socket.on('judgeVoted', function(data){
            console.log("Judge " + data.judge + " voted " + data.vote);
            setVote(data);
        });

        socket.on('judgesBegin', function(data){
            if(data.started){
                enableVoting(true);
            }else{
                enableVoting(false);
            }
        });

        socket.on('decisionMade', function(data){
            if(agent === "coordinator"){
                pauseTimer();
            }else{
                $("#arrow").toggle();
            }
        });

        socket.on('reset', function(data){
            initialState();
        });

        socket.on('wipeJudges', function(data){
            if(data.wipe){
                initialState();
                castedVote = false;
                checkState();
            }
        });

        /***************************** PRIVATE METHODS ******************************/

        $("#signIn").click(function(){
            socket.emit('signIn', {
                username: $('#signDiv-username').val(),
                password: $('#signDiv-password').val()
            })
        });

        var initialState = function(){
            console.log("reached InitialState");
            $('#voteDiv').replaceWith(voteDivClean);
            $('#waitDiv').replaceWith(waitDivClean);
            voteDivClean = $('#voteDiv').clone(true);
            waitDivClean = $('#waitDiv').clone(true);
            $('#voteDiv').toggle();
            $('#waitDiv').toggle();
            enableVoting(false);
        }

        var checkState = function(){
            $('#voteDiv').toggle();
            $('#waitDiv').toggle();
        }

        var setVote = function (data){
            if(data.judge === "judge1"){
                if(data.vote){
                    $("#judge1").attr("src", "lib/yes.png");
                }else if(!data.vote){
                    $("#judge1").attr("src", "lib/no.png");
                }else{
                    $("#judge1").attr("src", "lib/noDown.png");
                }    
            }else if(data.judge === "judge2"){
                if(data.vote){
                    $("#judge2").attr("src", "lib/yes.png");
                }else if(!data.vote){
                    $("#judge2").attr("src", "lib/no.png");
                }else{
                    $("#judge2").attr("src", "lib/noDown.png");
                }  
            }else if(data.judge === "judge3"){
                if(data.vote){
                    $("#judge3").attr("src", "lib/yes.png");
                }else if(!data.vote){
                    $("#judge3").attr("src", "lib/no.png");
                }else{
                    $("#judge3").attr("src", "lib/noDown.png");
                }  
            }

        }

        var enableVoting = function(yes){
            if(yes){
                $("#btnYes").prop('disabled', false);
                $("#btnNo").prop('disabled', false);
                $("#btnYes").attr('src', 'lib/yes.png');
                $("#btnNo").attr('src', 'lib/no.png');
            }else{
                $("#btnYes").prop('disabled', true);
                $("#btnNo").prop('disabled', true);
                $("#btnYes").attr('src', 'lib/yesDown.png');
                $("#btnNo").attr('src', 'lib/noDown.png');
            }
        }

        $('#btnYes').click(function(){
            castedVote = true;
            checkState();
            vote = true;
            socket.emit('vote', {
                vote: vote
            });
        });

        $('#btnNo').click(function(){
            castedVote = true;
            checkState();
            vote = false;
            socket.emit('vote', {
                vote: vote
            });
        });
// ------------------------------------------------------------

    var paused = false;
    var setTime = null;

    // server sided script
    var retrieveScript = "http://web.nscctruro.ca/ashton_julian/ria/weightTestReceive.ashx";
    var submitScript = "http://web.nscctruro.ca/ashton_julian/ria/weightTestSubmit.ashx";
    // JSON data returned from server
    var json;
    // number of orders
    var participantCount;

    // disable the pause/stop on page load
    $("#btnTimerPause").prop('disabled', true);
    $("#btnTimerStop").prop('disabled', true);

    // force data to scroll after getting too large
    document.getElementById("spreadsheet").style.height='350px';
    document.getElementById("spreadsheet").style.overflowY='auto';
    document.getElementById("spreadsheet").style.overflowX='hidden';

    populateMe();

    // ----------------------------------------------------------- event handlers

    function onResponse(result, textStatus, xmlhttp) {

        // grab the JSON response from the server
        json = JSON.parse(xmlhttp.responseText);

            // loop through all participants in participants array of JSON
            for (var i = 0; i<json.participants.length; i++) {
                var partsData = json.participants[i];

                // clone the table template
                var spreadTemp = $("#spreadsheetData").clone();
                // change the id 
                $(spreadTemp).prop("id", "spreadSheetData", i);

                // populate the template
                $(spreadTemp).find("td:eq(0) > input").val(partsData.name);
                $(spreadTemp).find("td:eq(1) > input").val(partsData.weight);
                $(spreadTemp).find("td:eq(2) > input").val(partsData.weightClass);
                $(spreadTemp).children("td").eq(3).find(":input").val(partsData.lift1);
                $(spreadTemp).children("td").eq(4).find(":input").val(partsData.lift2);
                $(spreadTemp).children("td").eq(5).find(":input").val(partsData.lift3);

                 // make orderNode visible
                $(spreadTemp).css("display", "table-row");
                // append the orderNode to the #output div
                $("#tableData").append(spreadTemp);
            }

        console.log(xmlhttp.responseText);
        console.log("response received!");
    }

    function onError(xmlhttp, textStatus) {
        console.log("AJAX error");
    }

    // -------------------------------------------------------------------- private methods

    // feed in the duration and the div where the timer is displayed
    function startTimer(duration, display) {
        var timer = duration, minutes, seconds;
        // use set interval to make a timer but only run it when not paused
        setTime = setInterval(function () {
            if (!paused) {
                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);

                // only display values less than 10
                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                // output to the div
                display.text("Timer: " + minutes + ":" + seconds);

                // don't allow the timer to go below 0
                if (--timer < 0) {
                    timer = 0;
                }
            }

        }, 1000);
    }

    function onNewEntry() {

            var sendJSON = {
                name: $("#newName").val(),
                weight: $("#newWeight").val(),
                weightClass: $("#newClass").val(),
                lift1: "--",
                lift2: "--",
                lift3: "--"
            };

            console.log(sendJSON);

            // convert to string (serializing)
            var sendString = JSON.stringify(sendJSON);

            console.log(sendString);

            // send the request with JSON string to server
            $.ajax({
                type: "POST",
                url: submitScript,
                contentType: "application/JSON",
                data: sendString,
                success: onResponse,
                error: onError
            });
        }
        
    function populateMe() {
       
            $("tbody").children("tr:visible").remove();

            // send request to get pizza orders via JSON
            $.ajax({
                type: "GET",
                url: retrieveScript,
                contentType: "application/json",
                success: onResponse,
                error: onError
            });
        }

        function pauseTimer(){
            // pause the timer and switch the button to resume
            paused = true;
            $("#btnTimerPause").hide();
            $("#btnTimerResume").show();
        }


    // ----------------------------------------------------------- JQuery Implementation
    $("#btnAdd").click(function(){
        if ($("#addParticipant").is(":visible")){
            // hide the add entry and display spreadsheet screen
            $("#spreadsheet").show();
            $("#addParticipant").hide();
        } else {
            // hide the spreadsheet and display the add entry screen
            $("#spreadsheet").hide();
            $("#addParticipant").show();
        }
    });

    $("#btnRemove").click(function(){
        $("#addParticipant").hide();
        $("#spreadsheet").show();
    });

    $("#btnReset").click(function(){
        populateMe();
    });

    $("#btnAddEntry").click(function(){
        
        // hide the add entry screen and display spreadsheet
        $("#spreadsheet").show();
        $("#addParticipant").hide();

        onNewEntry();
        populateMe();

        // clear out the text boxes
        $("#addParticipant").find("input").val("");

    });

    $("#btnTimerGo").click(function(){
        // unpause the timer and set it back to the default value
        paused = false;
        var minute = 60,
            display = $('#timer');
        startTimer(minute, display);
        // enable the pause and stop buttons while disabling play
        $("#btnTimerGo").prop('disabled', true);
        $("#btnTimerPause").prop('disabled', false);
        $("#btnTimerStop").prop('disabled', false);
        socket.emit('timerStart', {started:true});
    });

    $("#btnTimerPause").click(function(){
        // pause the timer and switch the button to resume
        paused = true;
        $("#btnTimerPause").hide();
        $("#btnTimerResume").show();
    });

    $("#btnTimerStop").click(function(){
        // pause the timer, clear the interval
        paused = true;
        clearInterval(setTime);
        // enable the start button and disable the pause/stop
        $("#btnTimerGo").prop('disabled', false);
        $("#btnTimerPause").prop('disabled', true);
        $("#btnTimerStop").prop('disabled', true);
        socket.emit('coordinatorStopped', {timerStopped:true});
    });

    $("#btnTimerResume").click(function(){
        // resume the timer
        paused = false;
        // switch the resume button back to pause
        $("#btnTimerPause").show();
        $("#btnTimerResume").hide();
    });


});
