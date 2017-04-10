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

        var decisionMade = false;

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
                //enableVoting(false);
                decisionMade = true;
                console.log(data.answer);
                if(!data.answer){
                    if (getCookie("participantData") !== "") {
                        // grab cookie data from cookies
                        cookieData = getCookie("participantData");

                        // make json from the parsed cookie json
                        json = JSON.parse(cookieData);

                        for (var i = 0; i<json.participants.length; i++) {
                            var partsData = json.participants[i]; 

                            if (partsData.id == valId) {
                                console.log(partsData[valName]);
                                //console.log($(this).val());

                                partsData[valName] = '(' + partsData[valName] + ')';
                                //partsData[valName] = $(this).val();
                            }
                        }

                        var sendString = JSON.stringify(json);

                        setCookie("participantData", sendString, 1000);
                        populateMe();
                    }
                }
            }else{
                if(castedVote){
                    $("#arrow").show();
                    console.log("I voted");
                }else{
                    console.log("I didnt vote");
                    $("#waitDiv").show();
                    $("#arrow").show();
                    $("#voteDiv").hide();
                }
               
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
    var firstVisit = true;
    var sendJSON = "";
    var cookieData = "";
    var json;
    var id = 0;
    var dataArray = [];
    var valId = 0;
    var valName = "";

    // number of participants
    var participantCount;


    var myJSON = {
        participants:[]
    } 

    // disable the pause/stop on page load
    $("#btnTimerPause").prop('disabled', true);
    $("#btnTimerStop").prop('disabled', true);
    $("#confirmReset").hide();

    if (getCookie("participantData") !== "") {
        populateMe();
    }

    console.log(getCookie("compName"));
    console.log(getCookie("compDate"));

    if (getCookie("compName") !== "") {
        $("#txtCompName").val(getCookie("compName"));
    }

    if (getCookie("compDate") !== "") {
        $("#txtDate").val(getCookie("compDate"));
    }

    // ----------------------------------------------------------- event handlers

    function onDelete() {
         $("select option").remove();
         populateDelete();
         populateMe();
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

        // grab cookie data from cookies if there is a cookie
            if (getCookie("participantData") !== "") {
                cookieData = getCookie("participantData");

                myJSON = JSON.parse(cookieData);
            }

            if (getCookie("idCounter") === "") {
                id = -1;
            } else {
                id = getCookie("idCounter");
            }

            // increment id by one and save to cookie
            id ++;
            setCookie("idCounter", id, 1000);

            var participant = { 
                // use id from cookie
                "id" : id,
                "name" : $("#newName").val(),
                "weight" : $("#newWeight").val(),
                "class" : $("#newClass").val(),
                "lift1" : "--",
                "lift2" : "--",
                "lift3" : "--",
                "slift1" : "--",
                "slift2" : "--",
                "slift3" : "--" 
            };

            // convert to string (serializing)

            var sendString;

            myJSON.participants.push(participant);

            

            //if (getCookie("participantData") === "") {
                //sendString = JSON.stringify(participant);       
            //} else {

                ///var data = JSON.parse(getCookie("participantData"));

                // sendString.push(data);
                // sendString.push(participant);

                //sendString = $.extend(true, {}, data, participant);

                

                sendString = JSON.stringify(myJSON);
            //}

            setCookie("participantData", sendString, 1000);
        }
        
    function populateMe() {
       
            $("#tableData").find("tbody > tr").remove();

            if (getCookie("participantData") !== "") {             
                cookieData = getCookie("participantData");

                // grab the JSON response from the server
                json = JSON.parse(cookieData);

                // loop through all participants in participants array of JSON
                for (var i = 0; i<json.participants.length; i++) {
                    var partsData = json.participants[i];

                    // clone the table template
                    var spreadTemp = $("#spreadsheetData").clone(true);
                    // change the id 
                    $(spreadTemp).prop("id", "spreadSheetData" + i);

                    // populate the template
                    $(spreadTemp).find("td").prop("id", partsData.id);
                    $(spreadTemp).find("td:eq(0) > input").val(partsData.name);
                    $(spreadTemp).find("td:eq(1) > input").val(partsData.weight);
                    $(spreadTemp).find("td:eq(2) > input").val(partsData.class);
                    $(spreadTemp).children("td").eq(3).find(":input").val(partsData.lift1);
                    $(spreadTemp).children("td").eq(4).find(":input").val(partsData.lift2);
                    $(spreadTemp).children("td").eq(5).find(":input").val(partsData.lift3);
                    $(spreadTemp).children("td").eq(6).find(":input").val(partsData.slift1);
                    $(spreadTemp).children("td").eq(7).find(":input").val(partsData.slift2);
                    $(spreadTemp).children("td").eq(8).find(":input").val(partsData.slift3);

                    //console.log($(spreadTemp).children("td").eq(9).find(":radio").val());
                    console.log($(spreadTemp).find("td").prop("id"));

                    // make orderNode visible
                    $(spreadTemp).css("display", "table-row");
                    // append the orderNode to the #output div
                    $("#spreadSheetBody").append(spreadTemp);
                }
            }
        }

    function populateDelete() {
        // grab cookie data from cookies
       cookieData = getCookie("participantData");

       // make json from the parsed cookie json
       json = JSON.parse(cookieData);

       // grab the participants
       var sampleCount = json.participants.length;

       if (sampleCount > 0) {
           $("select option").remove();

           // loop through all orders in orders array of JSON
           for (var i = 0; i < json.participants.length; i++) {
               var partsData = json.participants[i];

               // populate the template
               $("select").append('<option value=' + partsData.id + '>' + partsData.name + '</option>');
           }
       }
           //populateMe();
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    } 

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
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
            $("#deleteMe").hide();
            $("#confirmReset").hide();
        } else {
            // hide the spreadsheet and display the add entry screen
            $("#spreadsheet").hide();
            $("#addParticipant").show();
            $("#confirmReset").hide();
            $("#deleteMe").hide();
        }
    });

    $("#btnRemove").click(function() {
        if ($("#deleteMe").is(":visible")){
            // hide the add entry and display spreadsheet screen
            $("#deleteMe").hide();
            $("#spreadsheet").show();
            $("#addParticipant").hide();
            $("#confirmReset").hide();
        } else {
            // hide the delete and display the entry screens
            populateDelete();
            $("#spreadsheet").hide();
            $("#deleteMe").show();
            $("#addParticipant").hide();
            $("#confirmReset").hide();
        }
    });

    $("#btnReset").click(function(){
        if ($("#confirmReset").is(":visible")) {
            $("#confirmReset").hide();
            $("#addParticipant").hide();
            $("#deleteMe").hide();
            $("#spreadsheet").show();
        } else {
            $("#confirmReset").show();
            $("#spreadsheet").hide();
            $("#addParticipant").hide();
            $("#deleteMe").hide();
        }
        
    });

   $("#btnResetYes").click(function(){
        // empty out the participant data
        setCookie("participantData", "", 1000);
        setCookie("idCounter", "", 1000);
        setCookie("compName", "", 1000);
        setCookie("compDate", "", 1000);

        // go back to clean spreadsheet
        populateMe();

        $("#confirmReset").hide();
        $("#deleteMe").hide();
        $("#spreadsheet").show();
    });

    $("#btnResetNo").click(function(){
        $("#confirmReset").hide();
        $("#deleteMe").hide();
        $("#spreadsheet").show();
    }); 

    $("#btnAddEntry").click(function(){
        
        // hide the add entry screen and display spreadsheet
        $("#spreadsheet").show();
        $("#addParticipant").hide();
        $("#deleteMe").hide();

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
        decisionMade = false;
        // enable the start button and disable the pause/stop
        $("#btnTimerGo").prop('disabled', false);
        $("#btnTimerPause").prop('disabled', true);
        $("#btnTimerStop").prop('disabled', true);

        // switch the resume button back to pause
        $("#btnTimerPause").show();
        $("#btnTimerPause").prop('disabled', true);
        $("#btnTimerResume").hide();
        socket.emit('coordinatorStopped', {timerStopped:true});
    });

    $("#btnTimerResume").click(function(){
        // resume the timer
        paused = false;
        // switch the resume button back to pause
        $("#btnTimerPause").show();
        $("#btnTimerResume").hide();
    });

    $("#btnDelNo").click(function(){
        $("#spreadsheet").show();
        $("#deleteMe").hide();

        var cookData = getCookie("participantData");
        var jsonObject = JSON.parse(cookData);

        delete jsonObject.participants[0];

        console.log(jsonObject.participants.splice(0, 1));

    });

    $("#btnDelYes").click(function() {

        // grab cookie data from cookies
       cookieData = getCookie("participantData");

       // make json from the parsed cookie json
       json = JSON.parse(cookieData);

       console.log($("select").val());

       for (var i = 0; i<json.participants.length; i++) {
            var partsData = json.participants[i]; 

            if (partsData.id == $("select").val()) {
                console.log("landed");
                json.participants.splice(i, 1);
            }
        }

        var sendString = JSON.stringify(json);

        setCookie("participantData", sendString, 1000);

        populateMe();

        $("#deleteMe").hide();
        $("#spreadsheet").show();
    });

    $("#txtCompName").blur(function() {
        var competitionName = $("#txtCompName").val();
        setCookie("compName", competitionName, 1000);

    });

    $("#txtDate").blur(function() {
        var competitionDate = $("#txtDate").val();
        setCookie("compDate", competitionDate, 1000);
    });

    $("#btnPrint").click(function(){
        $("#compDetails").html(getCookie("compName") + " - " + getCookie("compDate"));
        window.location.href = "printsheet.html";
        //window.print();
    });

    $("input[name='radioSelect']").change(function() {
        console.log("Stuff " + $("input[name='radioSelect']:checked").val());
    });

    $("input").focus(function() {
        valId = $(this).parent().prop("id");
        valName = $(this).prop("name");
        // $('#currentLift').html(valName);
        // $('#currentCompetitor').html(valName);
        console.log('valId: ' + valId + ", " + 'valName: ' + valName);
        console.log($(this).prop("name") + " id: " + $(this).parent().prop("id"));

    });

    $("input").blur(function() {
        if (getCookie("participantData") !== "") {
            // grab cookie data from cookies
            cookieData = getCookie("participantData");

            // make json from the parsed cookie json
            json = JSON.parse(cookieData);

            for (var i = 0; i<json.participants.length; i++) {
                var partsData = json.participants[i]; 

                if (partsData.id == valId) {
                    console.log('BLUR ' + partsData[valName]);
                    console.log('BLUR ' + $(this).val());

                    partsData[valName] = $(this).val();
                }
            }

            var sendString = JSON.stringify(json);

            setCookie("participantData", sendString, 1000);
        }
        
    });


});
