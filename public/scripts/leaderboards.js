let requestURL = 'https://antixenoinitiative.com/api/ace';
let request = new XMLHttpRequest();
let ships = ['chieftain', 'challenger', 'kraitmk2', 'fdl']

function fetchJSON() {
    try {
        request.open('GET', requestURL);
        request.responseType = 'json';
        request.send();
    } catch (err) {
        toast("Unable to fetch data")
    }
    request.onload = async function() {
        updateLeaderboard()
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function dynamicSort(property) {
    let sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function timeConverter(UNIX_timestamp){
    UNIX_timestamp = UNIX_timestamp.substring(0, UNIX_timestamp.length-3)
    let a = new Date(UNIX_timestamp * 1000);
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    let hour = a.getHours();
    let min = a.getMinutes();
    let sec = a.getSeconds();
    let time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

function fancyTimeFormat(duration)
{   
    // Hours, minutes and seconds
    let hrs = ~~(duration / 3600);
    let mins = ~~((duration % 3600) / 60);
    let secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

function updateLeaderboard() {
    let content;

    try {
        content = request.response.message;
    } catch {
        console.log(`Invalid data recieved or no data recieved at all`)
        toast(`Unable to load data, please contact staff`)
        return 
    }
    
    let inchtml = ``

    for (let ship of ships) {
        let realName
        switch (ship) {
            case "chieftain":
                realName = 'Chieftain'
            break;
            case "challenger":
                realName = 'Challenger'
            break;
            case "kraitmk2":
                realName = 'Krait Mk.II'
            break;
            case "fdl":
                realName = 'Fer-De-Lance'
            break;
        }
        let results = content.rows.filter(entry => entry.shiptype == ship)
        results.sort(dynamicSort("score"))
        results.reverse()
        results = results.slice(0,10)
        let shiphtml = `<article class="smallround">
        <div class="article-title" style="background-image: linear-gradient(90deg, rgba(19,19,19,1) 0%, rgba(19,19,19,0) 100%), url(https://axicdn.s3.us-east-1.amazonaws.com/images/${ship}-wide.png);">
            <h3>${realName}</h3>
            <div>Top 10</div>
        </div>
        <div class="article-content">
            <table class="ace-table">
                <tr>
                    <th>Score</th>
                    <th>Time</th>
                    <th>CMDR</th>
                    <th>S Gauss (fired)</th>
                    <th>M Gauss (fired)</th>
                    <th>Hull Damage %</th>
                    <th>Date</th>
                </tr>`

        for (let result of results) {
            shiphtml += `<tr class="ace-row" onclick="window.location='${result.link}';"'>
            <td>${result.score}</td>
            <td>${fancyTimeFormat(result.timetaken)}</td>
            <td>${result.name}</td>
            <td style="text-align: center;">${result.sgauss} (${result.sgaussfired})</td>
            <td style="text-align: center;">${result.mgauss} (${result.mgaussfired})</td>
            <td style="text-align: center;">${result.percenthulllost}%</td>
            <td>${timeConverter(result.date)}</td>
        </tr>`
        }
        shiphtml += `</table>`
        if (results.length == 0) {
            shiphtml += `<div>Sorry, there are currently no results for ${realName}, you can be the first by submitting a kill in the AXI Discord.</div>`
        }
        shiphtml += `</div></article>`
        console.log(results)
        inchtml += shiphtml
    }

    try {
        document.getElementById("Ace-Leaderboards").innerHTML = inchtml;
    } catch {
        console.log("Skipping Ace Leaderboard")
    }
}

// Onload



window.onload = async function() {
    await fetchJSON()
}