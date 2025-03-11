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
let fullscreenEnabled = false;
if (window !== window.parent) {
    btnFullscreen.style.display = "block";
    btnFullscreen.addEventListener("click", (event) => {
        if (fullscreenEnabled) {
            // exit full screen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            btnFullscreen.src = btnFullscreen.src.replace("closefs", "fullscreen");
            fullscreenEnabled = false;
            return;
        }
        requestFullScreen(document.documentElement);
        btnFullscreen.src = btnFullscreen.src.replace("fullscreen", "closefs");
        fullscreenEnabled = true;
    });
}