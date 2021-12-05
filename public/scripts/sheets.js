const spreadsheetId = '1ADKNcyGnne-wSzm1jYYYgOXH9L4uiIbhbWZkPWI6gy0'
const parser = new PublicGoogleSheetsParser(spreadsheetId)
parser.parse().then((items) => {
    items.reverse()
    try {
        document.getElementById("newsarticlestop3").innerHTML = parseArticles(items, 3);
    } catch {
        console.log("Skipping newsarticlestop3")
    }
    try {
        document.getElementById("newsarticles").innerHTML = parseArticles(items, 50);
    } catch {
        console.log("Skipping newsarticles")
    }
})

function parseArticles(items, limit) {
    if (limit) {
        articlelimit = limit
    }
    count = 0
    let htmlstring = ""
    for (let article of items) {
        if (count == articlelimit) { break }
        htmlstring += `
        <article class="smallround">
            <div class="article-title" style="background-image: linear-gradient(90deg, rgba(19,19,19,1) 0%, rgba(19,19,19,0) 100%), url(${article.imagelink});">
                <h3>${article.title}</h3>
                <div>${article.date}</div>
            </div>
            <div class="article-content">
                ${article.content}
            </div>
        </article>`
        count++;
    }
    return htmlstring;
}