const app = document.getElementById("app");


const urlParams = new URLSearchParams(window.location.search);
const src = urlParams.get('js') ?? "";
const showConsole = ["1", "true"].includes(urlParams.get('showConsole') ?? "true")
const lang = urlParams.get('lang');
const highlight = ["1", "true"].includes(urlParams.get('highlight') ?? "true");
console.log(src);

const codeblock = document.getElementById("js-contain");
const consoleOutput = document.getElementById("consoleOutput");
const consoleGutter = document.getElementById("consoleGutter");

if (showConsole) consoleOutput.style.display = "block"; consoleGutter.style.display = "block"
codeblock.textContent = `${src}`



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
    }

    clear() {
        this.document.innerHTML = "";
        this.system("🔏 Console was cleared");
    }

    system(payload) {
        this.document.innerHTML += `<li class="console-line system"><span>${payload}</span></li>`;
    }

    log(payload) {
        this.document.innerHTML += `<li class="console-line log"><span>${payload}</span></li>`;
    }

    error(payload) {
        this.document.innerHTML += `<li class="console-line error"><span>${payload}</span></li>`;
    }
}

const iframeConsole = new HTMLConsole(iframeConsoleOutput);
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


function compileSnippet() {
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
    if (event.ctrlKey && event.key === "s") {
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
    if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        compileSnippet();
    }
});


/// END OF OUTPUT IFRAME ///
