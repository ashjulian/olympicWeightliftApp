$(document).ready(function () { 

    populateMe();

    // display the competition information
    $("#compDetails").html(getCookie("compName") + " - " + getCookie("compDate"));



    // print the document displayed
    window.print();

    // function to get the cookies
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

    function populateMe() {  
            $("#tableData").find("tbody > tr").remove();

            if (getCookie("participantData") !== "") {    
                console.log("log");         
                var cookieData = getCookie("participantData");

                // grab the JSON response from the server
                var json = JSON.parse(cookieData);

                console.log(json);

                // loop through all participants in participants array of JSON
                for (var i = 0; i<json.participants.length; i++) {
                    var partsData = json.participants[i];

                    // clone the table template
                    var spreadTemp = $("#spreadsheetData").clone();
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
                    $(spreadTemp).children("td").eq(9).find(":input").val(partsData.fin);

                    //console.log($(spreadTemp).children("td").eq(9).find(":radio").val());
                    console.log($(spreadTemp).find("td").prop("id"));

                    // make orderNode visible
                    $(spreadTemp).css("display", "table-row");
                    // append the orderNode to the #output div
                    $("#spreadSheetBody").append(spreadTemp);
                }
            }

        }

});