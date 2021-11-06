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

request.onload = function() {
    const content = request.response;
    let presence;
    let region;
    let inchtml = ``

    if (content.message.rows.length === 0) {
        document.getElementById("incursions-section").innerHTML = `<article><h1>Incursions</h1><p>There are currently no Thargoid Incursions at this time, please check again later. 🙁</p></article>`;
        return;
    }
    
    content.message.rows.sort(dynamicSort("name"))

    for (let system of content.message.rows) {
        if (system.status === true) {
            console.log(system)
            presence = getPresence(system.presence)

            // Region
            if (system.coords == null) {
                region = "EDMC Data not gathered yet..."
            } else {
                region = `${getRegion(system.coords)}`
            }

            // Population
            if (system.population == null) {
                system.population = "Unknown";
            } else {
                system.population = numberWithCommas(system.population)
            }

            // Faction
            if (system.faction == null) {
                system.faction = "Unknown"
            } else {
                system.faction = JSON.parse(system.faction).Name
            }
            
            inchtml += `
            <div class="subsection">
                <div class="subsection-heading-box">
                    <h1>${system.name} <span class="regionname">${region}</span></h1>
                    <div id="incstatus" class="status-${presence}">${capitalizeFirstLetter(presence)}</div>
                </div>
                <div class="subsection-details-box">
                    <p><span class="axiorange">Faction:</span> ${system.faction}</p>
                    <p><span class="axiorange">Population:</span> ${system.population}</p>
                </div>
            </div>`
        }
    }
    document.getElementById("incursions").innerHTML = inchtml;
}