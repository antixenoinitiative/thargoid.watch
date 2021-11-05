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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

request.onload = function() {
    const content = request.response;
    console.log(content)
    let presence;
    if (content.message.rows.length === 0) {
        document.getElementById("incursions").innerHTML = `<article><h1>Incursions</h1><p>There are currently no Thargoid Incursions at this time, please check again later. 🙁</p></article>`;
        return;
    }
    let inchtml = `<article><h1>Incursions</h1><p>Systems currently under attack by Thargoid Incursion</p></article>`
    for (let line of content.message.rows) {
        if (line.status === true) {
            console.log(line)
            presence = getPresence(line.presence)
            inchtml += `
            <div class="subsection">
                <div class="subsection-heading">
                    <h1>${line.name}</h1>
                    <div id="incstatus" class="status-${presence}">${capitalizeFirstLetter(presence)}</div>
                </div>
            </div>`
        }
    }
    console.log(inchtml)
    document.getElementById("incursions").innerHTML = inchtml;
}