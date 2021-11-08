let requestURL = 'https://sentry.antixenoinitiative.com/systems';
let request = new XMLHttpRequest();

request.open('GET', requestURL);
request.responseType = 'json';
request.send();

function getPresence(presence) {
    switch (presence) {
        case 0:
            return "cleared"
        case 1:
            return "marginal"
        case 2:
            return "moderate"
        case 3:
            return "significant"
        case 4:
            return "massive"
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function indexOfSmallest(a) {
    return a.indexOf(Math.min.apply(Math, a));
}

function getRegion(coords) {
    let regionDistances = []
    let regions = [
        [-78.59375, -149.625, -340.53125], // Pleiades (Merope)
        [355.3125, -425.96875, -723.03125], // Witch Head (Witch Head Sector IR-W C1-9)
        [432.625, 2.53125, 288.6875], // Coalsack (Musca Dark Region PJ-P B6-1)
        [-299.0625, -229.25, -876.125], // California (HIP 18390)
        [0,0,0] // Sol
    ]
    for (let region of regions) {
        let a = region[0] - coords[0];
        let b = region[1] - coords[1];
        let c = region[2] - coords[2];

        let distance = Math.sqrt(a * a + b * b + c * c);
        regionDistances.push(distance)
    }
    let regionid = indexOfSmallest(regionDistances)

    switch (regionid) {
        case 0:
            return "Pleiades Nebula"
        case 1:
            return "Witch Head Nebula"
        case 2:
            return "Coalsack Nebula"
        case 3:
            return "California Nebula"
        case 4:
            return "The Bubble"
    }
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

function updateInc(sorting) {
    let content = request.response;

    let inchtml = ``

    if (content.message.rows.length === 0) {
        document.getElementById("incursions-section").innerHTML = `<article><h1>Incursions</h1><p>There are currently no Thargoid Incursions at this time, please check again later. 🙁</p></article>`;
        return;
    }

    let inclist = []
    for (let system of content.message.rows) {
        if (system.status === true) {
            system.presenceName = getPresence(system.presence)

            // Region
            if (system.coords == null) {
                system.region = "Pending EDMC Data"
            } else {
                system.region = `${getRegion(system.coords)}`
            }

            // Population
            if (system.population == null) {
                system.population = "Unknown";
            } else {
                system.population = parseInt(system.population)
            }

            // Faction
            if (system.faction == null) {
                system.faction = "Unknown"
            } else {
                system.faction = JSON.parse(system.faction).Name
            }

            system.presenceBlocks = ["status-block-0", "status-block-0", "status-block-0", "status-block-0"]
            if (system.presence >= 1) {system.presenceBlocks[0] = "status-block-1"}
            if (system.presence >= 2) {system.presenceBlocks[1] = "status-block-2"}
            if (system.presence >= 3) {system.presenceBlocks[2] = "status-block-3"}
            if (system.presence >= 4) {system.presenceBlocks[3] = "status-block-4"}

            inclist.push(system)
            
        }
    }

    inclist.sort(dynamicSort(sorting))
    if (sorting === "population") {inclist.reverse()}
    console.log(inclist)

    for (let system of inclist) {
        inchtml += `
        <div class="subsection">
            <div class="subsection-start">
                <div class="subsection-row">
                    <h1>${system.name}</h1>
                    <h2>${system.region}</h2>
                </div>
                <div class="subsection-row flex-wrap">
                    <p class="mobile-hide"><span class="axiorange">Faction:</span> ${system.faction}</p>
                    <p class="mobile-hide"><span class="axiorange">Population:</span> ${numberWithCommas(system.population)}</p>
                </div>
                
                
            </div>
            <div class="subsection-end">
                <div id="incstatus-title" class="status-${system.presenceName}">${capitalizeFirstLetter(system.presenceName)}</div>
                <div id="incstatus-progress">
                    <div id="incstatus-progress-block" class="${system.presenceBlocks[0]} blockheight-1"></div>
                    <div id="incstatus-progress-block" class="${system.presenceBlocks[1]} blockheight-2"></div>
                    <div id="incstatus-progress-block" class="${system.presenceBlocks[2]} blockheight-3"></div>
                    <div id="incstatus-progress-block" class="${system.presenceBlocks[3]} blockheight-4"></div>
                </div>
            </div>   
        </div>`
    }
    document.getElementById("incursions").innerHTML = inchtml;
}

request.onload = function() {
    updateInc("name")

    
}

// Action Functions

function play() {
    var audio = document.getElementById("audio");
    audio.play();
}