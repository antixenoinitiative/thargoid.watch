// Toggle the opacity of an ID
function toggleOpacity(id, toggle) {
    document.getElementById(id).style.opacity = toggle;
}

function toggleCollapsible(id) {
    let coll = document.getElementById(id);
    if (coll.style.display == 'none') {
        coll.style.display = 'block';
    } else {
        coll.style.display = 'none'
    }
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

// Action Functions

function play() {
    var audio = document.getElementById("audio");
    audio.play();
}