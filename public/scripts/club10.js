let requestURL = 'https://thargoid-watch.onrender.com/api/club10';
let request = new XMLHttpRequest();

function fetchJSON() {
    try {
        request.open('GET', requestURL);
        request.responseType = 'json';
        request.send();
    } catch (err) {
        toast("Unable to fetch data")
    }
    request.onload = async function() {
        updateclub10()
    }
}

function updateclub10() {
    let content;

    try {
        content = request.response.message;
    } catch {
        console.log(`Invalid data recieved or no data recieved at all`)
        toast(`Unable to load data, please contact staff`)
        return 
    }
    
    let inchtml = ``

    let entries = content.rows
    for (let entry of entries) {
        inchtml+= `
        <article class="smallround article-alt">
            <div class="article-alt-bg" style="background-image: linear-gradient(90deg, rgba(19,19,19,1) 0%, rgba(19,19,19,0) 100%), url(https://cdn.discordapp.com/avatars/${entry.user_id}/${entry.avatar}.webp);"></div>
            <div class="article-alt-content">
                <img src="https://cdn.discordapp.com/avatars/${entry.user_id}/${entry.avatar}.webp?size=64" alt="">
                <h3>${entry.name}</h3>
            </div>
        </article>`
    }


    try {
        document.getElementById("Club10-List").innerHTML = inchtml;
    } catch {
        console.log("Skipping Club10-List Leaderboard")
    }
}

// Onload

window.onload = async function() {
    await fetchJSON()
}
