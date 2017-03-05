$(document).ready(function () {
    "use strict";

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

    // ----------------------------------------------------------- event handlers

    function onResponse(result, textStatus, xmlhttp) {
        // grab the JSON response from the server
        json = JSON.parse(xmlhttp.responseText);

        // grab the order orderCount
        orderCount = json.orders.length;
        if (orderCount > 0) {
            reportMe();
        } else {
            $("#content div:last").html("No orders submitted...");
        }

        //console.log(xmlhttp.responseText);
        //console.log("response received!");

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
                class: $("#newClass").val(),
                lift1: "--",
                lift2: "--",
                lift3: "--"
            };

            console.log(sendJSON);

        //     // convert to string (serializing)
        //     var sendString = JSON.stringify(sendJSON);

        //     console.log(sendString);

        //     // send the request with JSON string to server
        //     $.ajax({
        //         type: "POST",
        //         url: submitScript,
        //         contentType: "application/JSON",
        //         data: sendString,
        //         success: onResponse,
        //         error: onError
        //     });
        // }
    }



    // ----------------------------------------------------------- JQuery Implementation
    $("#btnAdd").click(function(){
        // hide the spreadsheet and display the add entry screen
        $("#spreadsheet").hide();
        $("#addParticipant").show();
    });

    $("#btnRemove").click(function(){
        $("#addParticipant").hide();
        $("#spreadsheet").show();
    });

    $("#btnAddEntry").click(function(){
        
        // hide the add entry screen and display spreadsheet
        $("#spreadsheet").show();
        $("#addParticipant").hide();

        // // clone the table template
        // var spreadTemp = $("#spreadsheetData").clone();
        // // change the id 
        // $(spreadTemp).prop("id", "spreadSheetData", 1);

        // // populate the template
        // $(spreadTemp).find("td:eq(0) > input").val("This is a name!");
        // $(spreadTemp).find("td:eq(1) > input").val("This is a weight!");
        // $(spreadTemp).find("td:eq(2) > input").val("This is a class!");
        // $(spreadTemp).children("td").eq(3).find(":input").val("This is lift1!");
        // $(spreadTemp).children("td").eq(4).find(":input").val("This is a lift2!");
        // $(spreadTemp).children("td").eq(5).find(":input").val("This is a lift3!");

        onNewEntry();

        // // make orderNode visible
        // $(spreadTemp).css("display", "table-row");
        // // append the orderNode to the #output div
        // $("#tableData").append(spreadTemp);

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
    });

    $("#btnTimerResume").click(function(){
        // resume the timer
        paused = false;
        // switch the resume button back to pause
        $("#btnTimerPause").show();
        $("#btnTimerResume").hide();
    });

});