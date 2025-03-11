const app = document.getElementById("app");
const jsCode = document.getElementById("js-contain");
const cssCode = document.getElementById("css-contain");
const htmlCode = document.getElementById("html-contain");
const htmlpanel = document.getElementById("htmlpanel");
const csspanel = document.getElementById("csspanel");
const jspanel = document.getElementById("jspanel");
const consoleOutput = document.getElementById("consoleOutput");
const consoleGutter = document.getElementById("consoleGutter");
const iframeConsoleOutput = document.getElementById("cout");
const editorReseize = document.getElementById("editor");
const outputResize = document.getElementById("output");
const previewResize = document.getElementById("playground-container");

const urlParams = new URLSearchParams(window.location.search);

const showConsole = ["1", "true"].includes(urlParams.get('showConsole') ?? "true")
const lang = urlParams.get('lang');
const highlight = ["1", "true"].includes(urlParams.get('highlight') ?? "true");
const mode = urlParams.get('mode') ?? "html";
const autoRun = ["1", "true"].includes(urlParams.get('autoRun') ?? "false");
const hideSystemMessages = ["1", "true"].includes(urlParams.get('hideSystemMessages') ?? "true");
const readOnly = ["1", "true"].includes(urlParams.get('readOnly') ?? "false");
const jsMaxLines = parseInt(urlParams.get('jsMaxLines'));
const cssMaxLines = parseInt(urlParams.get('cssMaxLines'));
const htmlMaxLines = parseInt(urlParams.get('htmlMaxLines'));
const jsSaveForReferanceTo = urlParams.get('jsSaveForReferanceTo') ?? undefined;

const jsRef = urlParams.get('jsRef') ?? "";
let jsSrc;
let readOnlyLines = [];
console.log(jsRef);
if (jsRef != "") {
    console.log("jsRef found");
    const code = localStorage.getItem(`jsstorage-${jsRef}`);
    if (code !== null && code !== undefined) {
        jsSrc = `// Start of stored JavaScript code for reference ${jsRef}\n${code}\n// End of stored JavaScript code for reference ${jsRef}`;
        readOnlyLines = jsSrc.split("\n").map((line, index) => {
            return index;
        });
        if(!jsSrc.endsWith("\n\n")) {
            jsSrc += `\n\n`;
        }
    }
    // Update jsSrc on local storage change
    window.addEventListener("storage", function(event) {
        if (event.key === `jsstorage-${jsRef}`) {
            // Update jsCode.value
            jsCode.value = jsCode.value.replace(/\/\/ Start of stored JavaScript code for reference [\w\d]+[\s\S]*?\/\/ End of stored JavaScript code for reference [\w\d]+/, `// Start of stored JavaScript code for reference ${jsRef}\n${event.newValue}\n// End of stored JavaScript code for reference ${jsRef}`);
            jsEditor.setValue(jsEditor.getValue().replace(/\/\/ Start of stored JavaScript code for reference [\w\d]+[\s\S]*?\/\/ End of stored JavaScript code for reference [\w\d]+/, `// Start of stored JavaScript code for reference ${jsRef}\n${event.newValue}\n// End of stored JavaScript code for reference ${jsRef}`));
            jsSrc = jsCode.value;
            readOnlyLines = `// Start of stored JavaScript code for reference ${jsRef}\n${event.newValue}\n// End of stored JavaScript code for reference ${jsRef}`.split("\n").map((line, index) => {
                return index;
            });
        }
    });
}
jsSrc = jsSrc ? jsSrc + urlParams.get('js') ?? "" : urlParams.get('js') ?? "";
const cssSrc = urlParams.get('css') ?? "";
const htmlSrc = urlParams.get('html') ?? "";
jsCode.value = jsSrc;
cssCode.value = cssSrc;
htmlCode.value = htmlSrc;


if (showConsole) consoleOutput.style.display = "block"; consoleGutter.style.display = "block"

function toggleconsole() {
    if (consoleOutput.classList.contains("maximised")) {
        consoleOutput.classList.remove("maximised");
        iframeConsoleOutput.style.display = "none";
    } else { }
}

// if mode == "js" only show the js editor and console
if (mode === "js") {
    console.log("js mode")
    const gutters = document.querySelectorAll(".gutter-v");
    const consolehidebtn = document.getElementById("btn-cmin");
    const htmlcontainer = document.getElementById("iframe-container")
    gutters.forEach(gutter => {
        gutter.style.display = "none";
    });
    htmlcontainer.style.display = "none";
    htmlpanel.style.display = "none";
    csspanel.style.display = "none";
    jspanel.style.height = "100%";
    consoleOutput.style.height = "100%";
    consolehidebtn.style.display = "none";
    iframeConsoleOutput.style.height = "calc(100% - 40px)";
}


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
    foldGutter: true,
    maxLines: jsMaxLines,
    readOnly: readOnly
});

if (jsSaveForReferanceTo) {
    const jsCode = jsEditor.getValue();
    // save the js code to jsstorage-{jsSaveForReferanceTo} in local storage
    localStorage.setItem(`jsstorage-${jsSaveForReferanceTo}`, jsCode);
}q

jsEditor.on("inputRead", function(cm, change) {
    if (!cm.state.completionActive && /* Enforce single completion */ change.origin !== "setValue" && shouldShowHint(cm, change)) {
        autoComplete(cm);
    }
});

jsEditor.on("change", function(cm, change) {
    if (jsSaveForReferanceTo) {
        const jsCode = jsEditor.getValue();
        // save the js code to jsstorage-{jsSaveForReferanceTo} in local storage
        localStorage.setItem(`jsstorage-${jsSaveForReferanceTo}`, jsCode);
    }
});

jsEditor.on("beforeChange", function(cm, change) {
    if (readOnlyLines.includes(change.from.line)) {
        // if line edit is from user input, cancel the change
        if (change.origin !== "setValue") {
            change.cancel();
        }
    }
});

function jumpToLine(i) {
    //jsEditor.setCursor(i);
    window.setTimeout(function() {
        const code = document.querySelector('.CodeMirror-code');
        const line = code.children[i];
        if (line) {
            line.scrollIntoView({block: "center", inline: "nearest", behavior: "smooth", boundary: code});
            line.classList.add('highlighted');
            setTimeout(() => line.classList.remove('highlighted'), 200);
        }
    }, 200);
}

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
    foldGutter: true,
    maxLines: cssMaxLines,
    readOnly: readOnly
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
    foldGutter: true,
    maxLines: htmlMaxLines,
    readOnly: readOnly
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

setupResizing(editorReseize, true); // Vertical resizing for editor
setupResizing(outputResize, true); // Vertical resizing for output
setupResizing(previewResize, false); // Horizontal resizing for preview

/// END OF EDITOR SETUP ///


/// OUTPUT IFRAME ///
const iframe = document.getElementById("output-iframe");

function toggleView(element) {
    const parentLi = element.parentElement;
    const expandedView = element.nextElementSibling;
    if (expandedView.style.display === "inline") {
        parentLi.classList.remove("expanded");
        expandedView.style.display = "none";
    } else {
        parentLi.classList.add("expanded");
        expandedView.style.display = "inline";
    }
}

function highlightDepth(depth, uniqueId) {
    const dir = document.getElementById(`dir-${uniqueId}`);
    if (dir) {
        
    }
}

function objectToHTML(obj, maxDepth = 2, currentDepth = 0, visited = new WeakMap(), uniqueId = 0) {
    if (uniqueId === 0) {
        // uuid
        uniqueId = Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
    }
    if (currentDepth >= maxDepth) {
        console.log("maxDepth reached");
        return "{...}";
    }
    if (visited.has(obj)) {
        return `<a onclick="highlightDepth(${visited.get(obj)}, '${uniqueId}')" style="cursor: pointer;">[Circular]</a>`;
    }
    visited.set(obj, currentDepth);

    const keys = Object.keys(obj);
    var collapsedView = `{${keys.slice(0, 5).map(k => `${k}: ${typeof obj[k] === 'object' ? '{...}' : obj[k]}`).join(', ')}${keys.length > 5 ? ', ...' : ''}}`;
    let html = `<li id="dir-${uniqueId}" class="console-line dir can-collapse"><details><summary>${collapsedView}</summary><ul>`;
    for (let key in obj) {
        if (typeof obj[key] === "object") {
            const isTypeErrorInstance = obj[key] instanceof TypeError;
            if (isTypeErrorInstance) {
                html += `<li class="collapsed"><strong>${key}</strong>: <ul><li>${obj[key]}</li></ul></li>`;
                continue;
            }
            const keys = Object.keys(obj[key]);
            collapsedView = `{${keys.slice(0, 5).map(k => `${k}: ${typeof obj[key][k] === 'object' ? '{...}' : obj[key][k]}`).join(', ')}${keys.length > 5 ? ', ...' : ''}}`;
            html += [
                `<li class="can-collapse">`,
                    `<details>`,
                        `<summary><strong>${key}</strong>: ${collapsedView}</summary>`,
                        `${objectToHTML(obj[key], maxDepth, currentDepth + 1, visited, uniqueId)}`,
                    `</details>`,
                `</li>`
            ].join("");
            continue;
        }
        html += `<li><strong>${key}</strong>: ${(typeof obj[key] === "string") ? `"${obj[key]}"` : obj[key]}</li>`;
    }
    html += "</ul></details></li>";

    return html;
}

class HTMLConsole {
    constructor(htmlElement) {
        this.document = htmlElement;
        this.counts = {};
        this.groupDepth = 1;
        this.groupCollapsed = [];
        this.timers = {};
    }

    peparePayload(payload) {
        if (typeof payload === "string") {
            payload = [payload];
        }

        if (payload.length === 0) {
            payload = [""];
        }

        for (let i = 0; i < payload.length; i++) {
            if (typeof payload[i] === "object" && payload[i] !== null) {
                payload[i] = JSON.stringify(payload[i]);
            }
            // undefined -> "undefined"
            if (payload[i] === undefined) {
                payload[i] = "undefined";
            }
            // null -> "null"
            if (payload[i] === null) {
                payload[i] = "null";
            }
        }

        return payload;
    }

    logErrorTrace(payload) {
        var aux = payload[0];
        aux = [aux.map((line, index, array) => {
            const match = line.match(/at\s+(.*)\s+\((?:.*):(\d+):(\d+)\)/) || line.match(/at\s+(.*):(\d+):(\d+)/);
            if (match) {
                const functionName = match[1] && !match[1].includes('/') ? match[1] : '(playground)';
                const lineNumber = match[2];
                const columnNumber = match[3];
                const prefix = index === array.length - 1 ? '└' : '┝';
                return `${prefix}─ ${functionName.trim()} @ <a href="javascript:void(0)" onclick="jumpToLine(${lineNumber - 1})">${lineNumber}:${columnNumber}</a>`;
            }
            return line;
        }).join("\n")].join("\n");
        return aux;
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
        this.document.innerHTML += `<li class="console-line debug group-level-${this.groupDepth}" style="--group-level: ${this.groupDepth};"><span>${payload.join(" ")}</span></li>`;
    }

    dir(payload) {
        const obj = payload[0];
        // if obj is not an object 
        if (typeof obj !== "object") {
            this.log(payload);
            return;
        }
        // convert object to expandable html representation (include deep objects)
        const lookupDepth = 3;
        const html = objectToHTML(obj, lookupDepth);
        this.document.innerHTML += html
    }

    dirxml(payload) {
        this.system("🔏 Built-In Console Doesn't Support dirxml")
    };

    error(payload) {
        payload = this.peparePayload(payload);
        this.document.innerHTML += `<li class="console-line error group-level-${this.groupDepth}" style="--group-level: ${this.groupDepth};"><span>${payload.join(" ")}</span></li>`;
    }

    group() {
        this.groupDepth++;
        this.groupCollapsed.push(false);
    }

    groupCollapsed() {
        this.system("🔏 Built-In Console Doesn't Support Collapsed Groups");
        this.groupDepth++;
        this.groupCollapsed.push(true);
    }

    groupEnd() {
        this.groupDepth > 1 && this.groupDepth--;
        this.groupCollapsed.pop();
    }
    
    info(payload) {
        payload = this.peparePayload(payload);
        this.document.innerHTML += `<li class="console-line info group-level-${this.groupDepth}" style="--group-level: ${this.groupDepth};"><span>${payload.join(" ")}</span></li>`;
    }
    
    log(payload) {
        payload = this.peparePayload(payload);
        this.document.innerHTML += `<li class="console-line log group-level-${this.groupDepth}" style="--group-level: ${this.groupDepth};"><span>${payload.join(" ")}</span></li>`;
    }

    profile() {
        this.system("🔏 Built-In Console Doesn't Support Profiling");
    }

    profileEnd() {
        this.system("🔏 Built-In Console Doesn't Support Profiling");
    }
    
    system(payload) {
        if (hideSystemMessages) {
            return;
        }
        payload = this.peparePayload(payload);
        this.document.innerHTML += `<li class="console-line system group-level-${this.groupDepth}" style="--group-level: ${this.groupDepth};"><span>${payload.join(" ")}</span></li>`;
    }

    table(payload) {
        this.system("🔏 Built-In Console Doesn't Support Tables");
    }

    time(label) {
        const timeLabel = label[0] || "default";
        if (this.timers[timeLabel]) {
            this.warn(`Timer "${timeLabel}" already exists`);
            return;
        }
        this.timers[timeLabel] = Date.now();
    }
    
    timeEnd(label) {
        const timeLabel = label[0] || "default";
        if (!this.timers[timeLabel]) {
            this.warn(`Timer "${timeLabel}" doesn't exist`);
            return;
        }
        const time = Date.now() - this.timers[timeLabel];
        this.info(`${timeLabel}: ${time}ms`);
        console.info(`${timeLabel}: ${time}ms`);
        delete this.timers[timeLabel];
    }

    timeLog(label) {
        const timeLabel = label[0] || "default";
        if (!this.timers[timeLabel]) {
            this.warn(`Timer "${timeLabel}" doesn't exist`);
            return;
        }
        const time = Date.now() - this.timers[timeLabel];
        this.info(`${timeLabel}: ${time}ms`);
        console.info(`${timeLabel}: ${time}ms`);
    }

    timeStamp() {
        this.system("🔏 Built-In Console Doesn't Support TimeStamps");
    }

    trace(payload) {
        var aux = payload[0];
        aux = ["console.trace", aux.map((line, index, array) => {
            const match = line.match(/at\s+(.*)\s+\((?:.*):(\d+):(\d+)\)/) || line.match(/at\s+(.*):(\d+):(\d+)/);
            if (match) {
                const functionName = match[1] && !match[1].includes('/') ? match[1] : '(playground)';
                const lineNumber = match[2];
                const columnNumber = match[3];
                const prefix = index === array.length - 1 ? '└' : '┝';
                return `${prefix}─ ${functionName.trim()} @ <a href="javascript:void(0)" onclick="jumpToLine(${lineNumber - 1})">${lineNumber}:${columnNumber}</a>`;
            }
            return line;
        }).join("\n")].join("\n");

        this.log(aux);
    }
    
    warn(payload) {
        payload = this.peparePayload(payload);
        this.document.innerHTML += `<li class="console-line warn group-level-${this.groupDepth}" style="--group-level: ${this.groupDepth};"><span>${payload.join(" ")}</span></li>`;
    }

}

var iframeConsole = new HTMLConsole(iframeConsoleOutput);
// listen for errors
window.addEventListener("message", function(event) {
    if ((event.data.console.type ?? "undefined") == "iframe-error"){
        var aux = event.data.error.stack.split("\n").slice(1);
        iframeConsole.error(`🔏 ${event.data.message.replace(/at\s+(\d+):(\d+)/g, 'at <a href="javascript:void(0)" onclick="jumpToLine($1 - 1)">$1:$2</a>')}<br>${iframeConsole.logErrorTrace([aux])}`);
    } else {
        // fun HTMLConsole function for console.type
        try {
            if (typeof iframeConsole[event.data.console.type] === 'function') {
                iframeConsole[event.data.console.type](event.data.console.payload);
            } else {
                throw new Error(`console.${event.data.console.type}() is unknown or not supported`);
            }
        } catch (e) {
            console.error(e);
            iframeConsole.error(`🔏 ${e.message}`);
        }
    }
});

document.addEventListener("DOMContentLoaded", function() {
    var consoleAutoScroll = true;
    function updateHasNextClass() {
        const validNextClasses = ['log', 'info', 'debug', 'dir'];
        const consoleLines = iframeConsoleOutput.querySelectorAll('.console-line');
        consoleLines.forEach((line, index) => {
            const nextLine = consoleLines[index + 1];
            if (nextLine && validNextClasses.some(cls => nextLine.classList.contains(cls))) {
                line.classList.add('br');
            } else {
                line.classList.remove('br');
            }
        });

        // auto scroll if scroll wheel was at bottom before new element was added
        if (consoleAutoScroll) {
            console.log("scrolling")
            iframeConsoleOutput.scrollTo({ behavior: 'smooth', top: iframeConsoleOutput.scrollHeight})
        }
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
        </body>
        <footer>
            <script>${jsCode}</script>
        </footer>
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






// if autoRun is true, run the snippet
if (autoRun) {
    compileSnippet();
}