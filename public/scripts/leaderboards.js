let requestURL = '/api/ace';
let request = new XMLHttpRequest();
let sortToggle = 1
let lastSort;
let lastSelection;
let showAll;

function fetchAPI(url) {
    return new Promise(function (resolve, reject) {
        let request = new XMLHttpRequest();
        request.open('GET', url);
        request.responseType = 'json';
        request.onload = function() {
            var status = request.status;
            if (status == 200) {
                resolve(request.response.message);
            } else {
                reject(status);
            }
        };
        request.send();
    });
}


function numberWithCommas(x) {
    return x.toLocaleString("en-US");
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function indexOfSmallest(a) {
    return a.indexOf(Math.min.apply(Math, a));
}

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function getId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11)
      ? match[2]
      : null;
}

function buildShip(rows, ship) {
    let html = ""
    filtered = rows.filter(row => row.shiptype === ship && row.approval === true)
    filtered.sort(dynamicSort("score"))
    filtered.reverse()
    for (let row of filtered) {
        html += `
        <div onclick="modal('modal-${ship}-${row.id}', true)" class="lbentry hovershadow">
            <p>${row.name}</p>
            <p>${row.score}</p>
        </div>
        <div id="modal-${ship}-${row.id}" class="modal">
            <div class="modal-content">
                <div class="modal-title">
                    <div class="modal-title">${row.name}</div>
                    <span onclick="modal('modal-${ship}-${row.id}', false)" class="close mdi mdi-close"></span>
                </div>
                <div>
                    <div class="lbgridace">
                        <div class="lbdetails">
                            <p>Date:</p>
                            <p class="grid-end">${row.date}</p>
                            <p>Ace Score:</p>
                            <p class="grid-end">${row.score}</p>
                            <p>Time Taken:</p>
                            <p class="grid-end">${row.timetaken}</p>
                            <p>Ship:</p>
                            <p class="grid-end">${capitalizeFirstLetter(ship)}</p>
                            <p>Hull Lost:</p>
                            <p class="grid-end">${row.percenthulllost}%</p>
                            <p>Medium Gauss:</p>
                            <p class="grid-end">${row.mgauss}</p>
                            <p>Medium Shots Fired:</p>
                            <p class="grid-end">${row.mgaussfired}</p>
                            <p>Small Gauss:</p>
                            <p class="grid-end">${row.sgauss}</p>
                            <p>Small Shots Fired:</p>
                            <p class="grid-end">${row.sgaussfired}</p>
                        </div>
                        <div class="video-container">
                            <iframe class="video" src="//www.youtube.com/embed/${getId(row.link)}" allowfullscreen></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
    }
    return `
    <div class="lbclass smallround hovershadow">
        <div class="lbheader bg${ship}">
            <h3 class="nomargin">${capitalizeFirstLetter(ship)}</h3>
        </div>
        <div class="lbcontainer">
        ${html}
        </div>
    </div>`
}

function buildAce(data) {
    let rows = data.rows
    console.log(rows)
    let cheifhtml = buildShip(rows, "chieftain")
    let km2html = buildShip(rows, "kraitmk2")
    let fdlhtml = buildShip(rows, "fdl")
    let challhtml = buildShip(rows, "challenger")
    return cheifhtml + km2html + fdlhtml + challhtml
}

function buildSpeedruns(data) {
    let rows = data.rows
    console.log(rows)
    let cheifhtml = buildShip(rows, "chieftain")
    let km2html = buildShip(rows, "kraitmk2")
    let fdlhtml = buildShip(rows, "fdl")
    let challhtml = buildShip(rows, "challenger")
    return cheifhtml + km2html + fdlhtml + challhtml
}

// Onload

window.onload = async function() {
    let acedata = await fetchAPI('/api/ace')
    let srdata = await fetchAPI('/api/speedrun')
    document.getElementById("acelb").innerHTML = buildAce(acedata);
    await fetchLeaderboards()
}