let requestURL = 'https://dcoh.watch/api/v1/overwatch/systems?ngsw-bypass=true';
let request = new XMLHttpRequest();
let systemData;

function fetchJSON() {
    try {
        request.open('GET', requestURL);
        request.responseType = 'json';
        request.send();
    } catch (err) {
        toast("Unable to fetch data")
    }
    request.onload = async function() {
        updateInc('progressPercent')
    }
}

function getSystemUrl(systemName){
    return `https://inara.cz/elite/starsystem/?search=${encodeURI(systemName)}`
}

function getPresence(presence) {
    switch (presence) {
        case 0:
            return "safe" //cleared
        case 1:
            return "alert" //marginal
        case 2:
            return "invasion" //moderate
        case 3:
            return "controlled" //significant
        case 4:
            return "maelstrom" //massive
    }
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
        let a = region[0] - coords.x;
        let b = region[1] - coords.y;
        let c = region[2] - coords.z;

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

function generateTimeRemaining(stateExpiration) {
    let timeRemaining = ""
    if (stateExpiration != null) {
        let expiryDate = Date.parse(stateExpiration.stateExpires)
        let date = new Date()
        hoursTotal = Math.abs(date - expiryDate) / 36e5
        let Days=Math.floor(hoursTotal/24);
        let Remainder=hoursTotal % 24;
        let Hours=Math.floor(Remainder);
        timeRemaining = `${Days} Day(s) ${Hours} Hour(s)`
    }
    return timeRemaining
  }

function generateProgressBar(percent) {
    let barColor = 'var(--accent-color)'
    if (percent < 0.25 && percent > 0) {
        barColor = 'var(--presence-maelstrom)'
    } else if (percent <= 0.50 && percent > 0.25) {
        barColor = 'var(--presence-controlled)'
    } else if (percent <= 0.75 && percent > 0.50) {
        barColor = 'var(--presence-invasion)'
    } else if (percent < 1 && percent > 0.75) {
        barColor = 'var(--presence-alert)'
    } else {
        barColor = 'var(--presence-safe)'
    }
    let outerBar = document.createElement("div")
    let innerBar = document.createElement("div")
    outerBar.style.cssText = 'border-radius: 5px'
    outerBar.style.backgroundColor = '#373737'
    innerBar.style.cssText = 'border-radius: 5px'
    innerBar.style.backgroundColor = barColor
    innerBar.style.height = '8px'
    innerBar.style.width = (percent * 100 + "%")
    outerBar.appendChild(innerBar)
    return outerBar
}

function generateOperations(operations) {
    if (operations.length != 0) {
        let opsBox = document.createElement('div')
        opsBox.style.height = '2rem'
        for (let op of operations) {
            let img = new Image();
            img.src = `https://dcoh.watch/assets/badges/${op.tag}.png`
            img.style.cssText = `max-height: 100%; max-width: 100%; padding: 0rem 0.2rem 0rem 0.2rem`
            img.value = op.tag
            opsBox.appendChild(img)
        }
        return opsBox
    } else {
        return document.createTextNode('')
    }
}

function generateTableHead(table) {
    let thead = table.createTHead();
    let row = thead.insertRow();

    function generateHeader(input) {
        let th = document.createElement("th");
        let text = document.createTextNode(input);
        th.appendChild(text);
        row.appendChild(th);
    }

    generateHeader('Name')
    generateHeader('State')
    generateHeader('Population')
    generateHeader('Maelstrom')
    generateHeader('Progress')
    generateHeader('Operations')
    generateHeader('Time Remaining')
}

function generateTable(table, data) {
    for (let system of data) {
      let row = table.insertRow();

      function generateCell(content) {
        let cell = row.insertCell();
        cell.appendChild(content);
      }

      generateCell(document.createTextNode(system.name))
      generateCell(document.createTextNode(system.thargoidLevel.name))
      generateCell(document.createTextNode(system.population.toLocaleString()))
      generateCell(document.createTextNode(system.maelstrom.name))
      generateCell(generateProgressBar(system.progressPercent))
      generateCell(generateOperations(system.specialFactionOperations))
      generateCell(document.createTextNode(generateTimeRemaining(system.stateExpiration)))

    }
  }

function updateInc(order) {
    console.log(request.response)
    let systems = request.response.systems
    systems.sort(dynamicSort(order))
    systems.reverse()
    let table = document.querySelector('table')
    let data = Object.keys(systems[0]);
    generateTableHead(table, data);
    generateTable(table, systems)
}


// Onload

window.onload = async function() {
    await fetchJSON()
}