const app = document.getElementById("app");
const urlParams = new URLSearchParams(window.location.search);

const showConsole = ["1", "true"].includes(urlParams.get('showConsole') ?? "true")
const lang = urlParams.get('lang');
const highlight = ["1", "true"].includes(urlParams.get('highlight') ?? "true");

const jsSrc = urlParams.get('js') ?? "";
const cssSrc = urlParams.get('css') ?? "";
const htmlSrc = urlParams.get('html') ?? "";
const jsCode = document.getElementById("js-contain");
const cssCode = document.getElementById("css-contain");
const htmlCode = document.getElementById("html-contain");
jsCode.value = jsSrc;
cssCode.value = cssSrc;
htmlCode.value = htmlSrc;

const consoleOutput = document.getElementById("consoleOutput");
const consoleGutter = document.getElementById("consoleGutter");

if (showConsole) consoleOutput.style.display = "block"; consoleGutter.style.display = "block"



/// EDITOR SETUP ///
window.HTMLHint = window.HTMLHint.HTMLHint;

function autoComplete(editor) {
    editor.showHint({
        completeSingle: false
    });
}

function shouldShowHint(cm, change) {
    const cursor = cm.getCursor();
    const line = cm.getLine(cursor.line);
    return !line.trim().endsWith(';');
}

const jsEditor = CodeMirror.fromTextArea(document.getElementById("js-contain"), {
    mode: "javascript",
    lineWrapping: true,
    lineNumbers: true,
    theme: "dracula",
    viewportMargin: Infinity,
    autoCloseBrackets: true,
    smartIndent: true,
    indentUnit: 4,
    tabSize: 4,
    extraKeys: { 
        "Ctrl-Space": "autocomplete"
    },
    gutters: ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    lint: {
        esversion: 8, // Specify ECMAScript version
        asi: true, // Allow missing semicolons
        // Add more linting options as needed
    },
    foldGutter: true
});

jsEditor.on("inputRead", function(cm, change) {
    if (!cm.state.completionActive && /* Enforce single completion */ change.origin !== "setValue" && shouldShowHint(cm, change)) {
        autoComplete(cm);
    }
});

const cssEditor = CodeMirror.fromTextArea(document.getElementById("css-contain"), {
    mode: "css",
    lineWrapping: true,
    lineNumbers: true,
    theme: "dracula",
    viewportMargin: Infinity,
    autoCloseBrackets: true,
    smartIndent: true,
    indentUnit: 4,
    tabSize: 4,
    extraKeys: { 
        "Ctrl-Space": "autocomplete"
    },
    gutters: ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    lint: true,
    foldGutter: true
});

cssEditor.on("inputRead", function(cm, change) {
    if (!cm.state.completionActive && /* Enforce single completion */ change.origin !== "setValue" && shouldShowHint(cm, change)) {
        autoComplete(cm);
    }
});


const htmlEditor = CodeMirror.fromTextArea(document.getElementById("html-contain"), {
    mode: "htmlmixed",
    lineWrapping: true,
    lineNumbers: true,
    theme: "dracula",
    viewportMargin: Infinity,
    autoCloseBrackets: true,
    autoCloseTags: true,
    smartIndent: true,
    indentUnit: 4,
    tabSize: 4,
    extraKeys: { 
        "Ctrl-Space": "autocomplete"
    },
    gutters: ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    lint: true,
    foldGutter: true
});

htmlEditor.on("inputRead", function(cm, change) {
    if (!cm.state.completionActive && /* Enforce single completion */ change.origin !== "setValue") {
        autoComplete(cm);
    }
});

function setupResizing(container, isVertical = true) {
    for (let i = 0; i < container.children.length; i++) {
        const element = container.children[i];
        const gutterClass = isVertical ? "gutter-v" : "gutter-h";
        const cursorStyle = isVertical ? "row-resize" : "col-resize";
        const localCursorResetStyle = element.style.cursor;
        const sizeProperty = isVertical ? "height" : "width";
        const offsetProperty = isVertical ? "offsetHeight" : "offsetWidth";
        const clientProperty = isVertical ? "clientY" : "clientX";
        const minSize = isVertical ? 8 : 25;

        if (element.classList.contains(gutterClass)) {
            element.addEventListener("mousedown", function(event) {
                const cursorResetStyle = app.style.cursor;
                app.style.cursor = cursorStyle;
                element.style.cursor = cursorStyle;
                const prevElement = container.children[i - 1];
                const nextElement = container.children[i + 1];
                const startPosition = event[clientProperty];
                const startPrevSize = prevElement[offsetProperty];
                const startNextSize = nextElement[offsetProperty];

                prevElement.style.pointerEvents = "none";
                prevElement.style.userSelect = "none";
                nextElement.style.pointerEvents = "none";
                nextElement.style.userSelect = "none";

                const mouseMove = (e) => {
                    const delta = e[clientProperty] - startPosition;
                    let newPrevSize = ((startPrevSize + delta) / container[offsetProperty]) * 100;
                    let newNextSize = ((startNextSize - delta) / container[offsetProperty]) * 100;

                    // Ensure minimum size
                    if (newPrevSize < minSize) {
                        newPrevSize = minSize;
                        newNextSize = ((startPrevSize + startNextSize) / container[offsetProperty]) * 100 - newPrevSize;
                    }
                    if (newNextSize < minSize) {
                        newNextSize = minSize;
                        newPrevSize = ((startPrevSize + startNextSize) / container[offsetProperty]) * 100 - newNextSize;
                    }

                    prevElement.style[sizeProperty] = prevElement.style[sizeProperty].replace(/(\d+(\.\d+)?)(?=%)/, newPrevSize);
                    nextElement.style[sizeProperty] = nextElement.style[sizeProperty].replace(/(\d+(\.\d+)?)(?=%)/, newNextSize);
                }

                document.addEventListener("mousemove", mouseMove);

                document.addEventListener("mouseup", () => {
                    app.style.cursor = cursorResetStyle
                    element.style.cursor = localCursorResetStyle;
                    prevElement.style.pointerEvents = "auto";
                    nextElement.style.pointerEvents = "auto";
                    prevElement.style.userSelect = "auto";
                    nextElement.style.userSelect = "auto";
                    // final resize to fix rounding errors (make sure it adds up to 100%)
                    const prevSize = prevElement[offsetProperty];
                    const nextSize = nextElement[offsetProperty];
                    prevElement.style[sizeProperty] = (prevSize / container[offsetProperty]) * 100 + "%";
                    nextElement.style[sizeProperty] = (nextSize / container[offsetProperty]) * 100 + "%";

                    document.removeEventListener("mousemove", mouseMove);
                }, { once: true });
            });
        }
    }
}

const editorReseize = document.getElementById("editor");
const outputResize = document.getElementById("output");
const previewResize = document.getElementById("playground-container");

setupResizing(editorReseize, true); // Vertical resizing for editor
setupResizing(outputResize, true); // Vertical resizing for output
setupResizing(previewResize, false); // Horizontal resizing for preview

/// END OF EDITOR SETUP ///


/// OUTPUT IFRAME ///
const iframe = document.getElementById("output-iframe");

const iframeConsoleOutput = document.getElementById("cout");

class HTMLConsole {
    constructor(htmlElement) {
        this.document = htmlElement;
        this.counts = {};
    }

    peparePayload(payload) {
        if (typeof payload === "string") {
            return [payload];
        }
        return payload;
    }

    assert(payload) {
        this.error(["Assertion failed:", ...this.peparePayload(payload)]);
    }

    clear() {
        this.document.innerHTML = "";
        this.system("🔏 Console was cleared");
    }

    count(label) {
        const countLabel = label[0] || "default";
        if (!this.counts[countLabel]) {
            this.counts[countLabel] = 0;
        }
        this.counts[countLabel]++;
        this.info(`${countLabel}: ${this.counts[countLabel]}`);
    }

    countReset(label) {
        const countLabel = label[0] || "default";
        this.counts[countLabel] = 0;
    }

    debug(payload) {
        payload = this.peparePayload(payload);
        this.document.innerHTML += `<li class="console-line debug"><span>${payload.join(" ")}</span></li>`;
    }

    dir(payload) {
        const obj = payload[0];
        console.log(obj);
        this.document.innerHTML += `<li class="console-line dir"><span>${JSON.stringify(obj, null, 2)}</span></li>`;
        payload = this.peparePayload(payload);
        this.document.innerHTML += `<li class="console-line dir"><span>${payload.join(" ")}</span></li>`;
    }

    system(payload) {
        payload = this.peparePayload(payload);
        this.document.innerHTML += `<li class="console-line system"><span>${payload.join(" ")}</span></li>`;
    }

    log(payload) {
        payload = this.peparePayload(payload);
        this.document.innerHTML += `<li class="console-line log"><span>${payload.join(" ")}</span></li>`;
    }

    error(payload) {
        payload = this.peparePayload(payload);
        this.document.innerHTML += `<li class="console-line error"><span>${payload.join(" ")}</span></li>`;
    }

    warn(payload) {
        payload = this.peparePayload(payload);
        this.document.innerHTML += `<li class="console-line warn"><span>${payload.join(" ")}</span></li>`;
    }

    info(payload) {
        payload = this.peparePayload(payload);
        this.document.innerHTML += `<li class="console-line info"><span>${payload.join(" ")}</span></li>`;
    }
}

var iframeConsole = new HTMLConsole(iframeConsoleOutput);
// listen for errors
window.addEventListener("message", function(event) {
    if (event.data.console.type == "iframe-error"){
        iframeConsole.error(event.data.console.payload);
    } else {
        // fun HTMLConsole function for console.type
        try {
            if (typeof iframeConsole[event.data.console.type] === 'function') {
                iframeConsole[event.data.console.type](event.data.console.payload);
            } else {
                throw new Error(`Unknown console type: ${event.data.console.type}`);
            }
        } catch (e) {
            console.error(e);
            iframeConsole.error(`🔏 ${e.message}`);
        }
    }
});

document.addEventListener("DOMContentLoaded", function() {
    function updateHasNextClass() {
        const consoleLines = iframeConsoleOutput.querySelectorAll('.console-line.log, .console-line.info, .console-line.debug');
        consoleLines.forEach((line, index) => {
            const nextLine = consoleLines[index + 1];
            if (nextLine && (
                (line.classList.contains('log') && (nextLine.classList.contains('log') || nextLine.classList.contains('info') || nextLine.classList.contains('debug'))) ||
                (line.classList.contains('info') && (nextLine.classList.contains('info') || nextLine.classList.contains('debug') || nextLine.classList.contains('log'))) ||
                (line.classList.contains('debug') && (nextLine.classList.contains('debug') || nextLine.classList.contains('info') || nextLine.classList.contains('log')))
            )) {
                line.classList.add('br');
            } else {
                line.classList.remove('br');
            }
        });
    }

    const observer = new MutationObserver(updateHasNextClass);
    observer.observe(iframeConsoleOutput, { childList: true, subtree: true });

    // Initial call to set up the classes
    updateHasNextClass();
});


function compileSnippet() {
    iframeConsole = new HTMLConsole(iframeConsoleOutput);
    const jsCode = jsEditor.getValue();
    const cssCode = cssEditor.getValue();
    const htmlCode = htmlEditor.getValue();
    
    // Remove the existing iframe
    const oldIframe = document.getElementById("output-iframe");
    if (oldIframe) {
        oldIframe.remove();
    }

    // Create a new iframe
    const newIframe = document.createElement("iframe");
    newIframe.id = "output-iframe";
    newIframe.style.width = "100%";
    newIframe.style.height = "100%";
    newIframe.classList.add("iframe-output");
    newIframe.allow = "midi; geolocation; microphone; camera; display-capture; encrypted-media; clipboard-read; clipboard-write; notifications; payment-handler; persistent-storage; background-sync; ambient-light-sensor; accessibility-events; speaker-selection;";
    newIframe.sandbox = "allow-modals allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation allow-downloads";
    document.getElementById("iframe-container").appendChild(newIframe);

    const iframeDoc = newIframe.contentDocument || newIframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
        <html>
        <head>
            <script src="../assets/js/injector.js"></script>
            <style>${cssCode}</style>
        </head>
        <body>
            ${htmlCode}
            <script>${jsCode}<\/script>
        </body>
        </html>
    `);
    iframeDoc.close();
}

// run button
document.getElementById("run").addEventListener("click", function() {
    compileSnippet();
});
// ctrl+enter // ctrl+s 
document.addEventListener("keydown", function(event) {
    // if ctrl+s also save the snippet to url params js= css= html=
    if (event.ctrlKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        const jsCode = jsEditor.getValue();
        const cssCode = cssEditor.getValue();
        const htmlCode = htmlEditor.getValue();
        const url = new URL(window.location);
        url.searchParams.set("js", jsCode);
        url.searchParams.set("css", cssCode);
        url.searchParams.set("html", htmlCode);
        history.pushState(null, null, url);
        compileSnippet();
    }
    if (event.ctrlKey && event.key.toLowerCase() === "enter") {
        event.preventDefault();
        compileSnippet();
    }
});


/// END OF OUTPUT IFRAME ///
