let requestURL = 'https://www.thargoid.watch/api/systems';
let request = new XMLHttpRequest();
let sortToggle = 1
let lastSort;
let lastSelection;
let showAll;

function fetchJSON() {
    try {
        request.open('GET', requestURL);
        request.responseType = 'json';
        request.send();
    } catch (err) {
        toast("Unable to fetch data")
    }
    request.onload = async function() {
        updateInc("name")
    }
}

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
    return x.toLocaleString("en-US");
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

// Toggle the opacity of an ID
function toggleOpacity(id, toggle) {
    document.getElementById(id).style.opacity = toggle;
}

function copyToClipboard(content) {
    navigator.clipboard.writeText(content);
    toast(`Copied ${content} to clipboard`)
}

function toast(content) {
    // Get the snackbar DIV
    var x = document.getElementById("toast");
    document.getElementById("toast").innerHTML = content
  
    // Add the "show" class to DIV
    x.className = "show";
  
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
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

function updateInc(sorting, all) {
    let content;
    let prioritycontent = ""

    if (sorting === 0) {
        sorting = lastSelection
    }
    if (all === true) {
        showAll = true
        document.getElementById("btn-showall").style.display = "none"
    }

    lastSelection = sorting

    try {
        content = request.response.message;
    } catch {
        console.log(`Invalid data recieved or no data recieved at all`)
        toast(`Unable to load data, please contact staff`)
        return 
    }
    
    let inchtml = ``

    if (content.rows.length === 0) {
        document.getElementById("incursions-section").innerHTML = `<article><h1>Incursions</h1><p>There are currently no Thargoid Incursions at this time, please check again later. 🙁</p></article>`;
        return;
    }

    let inclist = []
    for (let system of content.rows) {
        if (system.status === true || showAll === true) {
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
            }

            // Timestamp
            if (system.last_updated == null) {
                system.timestamp = "No Data"
            } else {
                system.timestamp = new Date(system.last_updated * 1000).toISOString().slice(0, 16).replace('T', ' ')
                let year = parseInt(system.timestamp.substring(0,4))
                year += 1286
                system.timestamp = year + system.timestamp.slice(4)
            }

            system.presenceBlocks = ["status-block-0", "status-block-0", "status-block-0", "status-block-0"]
            if (system.presence >= 1) {system.presenceBlocks[0] = "status-block-1"}
            if (system.presence >= 2) {system.presenceBlocks[1] = "status-block-2"}
            if (system.presence >= 3) {system.presenceBlocks[2] = "status-block-3"}
            if (system.presence >= 4) {system.presenceBlocks[3] = "status-block-4"}

            inclist.push(system)
        }
    }

    // Handle Priorities]
    let priorities = [1,2,3]
    for (let priority of priorities) {
        system = inclist.find(element => element.priority === priority)
        if (system) {
            prioritycontent += getPriorityHTML(system)
        }
        //inclist = inclist.filter(element => element.name != system.name)
    }

    // Sorting
    if (lastSort != sorting) {
        sortToggle = 1
    }
    lastSort = sorting
    inclist.sort(dynamicSort(sorting))

    if (sortToggle%2 == 0) {
        inclist.reverse()
    }
    if (sorting == "population") {
        inclist.reverse()
    }

    // Printing
    for (let system of inclist) {
        inchtml += `
        <div class="subsection gap-large round-border" onmouseover="toggleOpacity('HoverItem-${system.system_id}',1)" onmouseout="toggleOpacity('HoverItem-${system.system_id}',0)">
            <div class="subsection-start">
                <div class="subsection-row gap-medium">
                    <h1 class="clipboard text-large nomargin" onclick="copyToClipboard('${system.name}')">${system.name}</h1>
                    <h2>${system.region}</h2>
                </div>
                <div class="subsection-row gap-medium flex-wrap">
                    <p class="mobile-hide"><span class="axiorange">Faction:</span> ${system.faction}</p>
                    <p class="mobile-hide"><span class="axiorange">Population:</span> ${numberWithCommas(system.population)}</p>
                </div>
            </div>
            <div class="end">
                <div class="subsection-row-end gap-medium">
                    <div id="HoverItem-${system.system_id}" class="lastUpdated mobile-hide">Last Updated: ${system.timestamp}</div>
                    <div id="incstatus-title" class="status-${system.presenceName} noselect">${capitalizeFirstLetter(system.presenceName)}</div>
                </div>
                <div id="incstatus-progress">
                    <div id="incstatus-progress-block" class="${system.presenceBlocks[0]} blockheight-1"></div>
                    <div id="incstatus-progress-block" class="${system.presenceBlocks[1]} blockheight-2"></div>
                    <div id="incstatus-progress-block" class="${system.presenceBlocks[2]} blockheight-3"></div>
                    <div id="incstatus-progress-block" class="${system.presenceBlocks[3]} blockheight-4"></div>
                </div>
            </div>   
        </div>`
    }
    document.getElementById("priorities").innerHTML = prioritycontent;
    document.getElementById("incursions").innerHTML = inchtml;
    sortToggle += 1
}

function getPriorityHTML(system) {
    function getPriorityText(priority) {
        switch (priority) {
            case 1:
                return "1st"
            case 2:
                return "2nd"
            case 3:
                return "3rd"
        }
    }
    return `
    <div class="priority-box subsection flex-column gap-medium round-border flex-grow">
        <div class="flex-row flex-space width-100">
            <div style="position: relative; width: 0; height: 0">
                <div style="background-color: var(--priority-${system.priority});" class="priority-number-box noselect round-border flex-center flex-row flex-justify-center">
                    <div class="priority-number">${getPriorityText(system.priority)} Priority</div>
                </div>
            </div>
            <div class="priority-title-box flex-column">
                <h1 class="clipboard text-large nomargin" onclick="copyToClipboard('${system.name}')">${system.name}</h1>
                <h2>${system.region}</h2>
            </div>
            <div class="end">
                <div class="subsection-row-end gap-medium">
                    <div id="incstatus-title" class="status-${system.presenceName} noselect">${capitalizeFirstLetter(system.presenceName)}</div>
                </div>
                <div id="incstatus-progress">
                    <div id="incstatus-progress-block" class="${system.presenceBlocks[0]} blockheight-1"></div>
                    <div id="incstatus-progress-block" class="${system.presenceBlocks[1]} blockheight-2"></div>
                    <div id="incstatus-progress-block" class="${system.presenceBlocks[2]} blockheight-3"></div>
                    <div id="incstatus-progress-block" class="${system.presenceBlocks[3]} blockheight-4"></div>
                </div>
            </div>
        </div>
        <div class="flex-column">
            <p class="mobile-hide"><span class="axiorange">Faction:</span> ${system.faction}</p>
            <p class="mobile-hide"><span class="axiorange">Population:</span> ${numberWithCommas(system.population)}</p>
        </div>
    </div>`
}

// Action Functions

function play() {
    var audio = document.getElementById("audio");
    audio.play();
}

// Onload

window.onload = async function() {
    await fetchJSON()
}