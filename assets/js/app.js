function requestFullScreen(element) {
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullscreen;

    if (requestMethod) { // Native full screen.
        requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

// display btn-fullscreen if in iframe
const btnFullscreen = document.getElementById("btn-fullscreen");
if (window !== window.parent) {
    btnFullscreen.style.display = "block";
    btnFullscreen.addEventListener("click", (event) => {
        requestFullScreen(document.documentElement);
    });
}