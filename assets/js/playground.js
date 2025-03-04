const urlParams = new URLSearchParams(window.location.search);
const src = urlParams.get('js') ?? "";
const showConsole = ["1", "true"].includes(urlParams.get('showConsole') ?? "true")
const lang = urlParams.get('lang');
const highlight = ["1", "true"].includes(urlParams.get('highlight') ?? "true");
console.log(src);

const codeblock = document.getElementById("js-contain");
//const consoleOutput = document.getElementById("consoleOutput");

//if (showConsole) consoleOutput.classList.add("show")
codeblock.textContent = `${src}`

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
    
    lineNumbers: true,
    theme: "dracula",
    viewportMargin: Infinity,
    autoCloseBrackets: true,
    smartIndent: true,
    indentUnit: 4,
    tabSize: 4,
    extraKeys: { "Ctrl-Space": "autocomplete" }
});

jsEditor.on("inputRead", function(cm, change) {
    if (!cm.state.completionActive && /* Enforce single completion */ change.origin !== "setValue" && shouldShowHint(cm, change)) {
        autoComplete(cm);
    }
});

const cssEditor = CodeMirror.fromTextArea(document.getElementById("css-contain"), {
    mode: "css",
    lineNumbers: true,
    theme: "dracula",
    viewportMargin: Infinity,
    autoCloseBrackets: true,
    smartIndent: true,
    indentUnit: 4,
    tabSize: 4,
    extraKeys: { "Ctrl-Space": "autocomplete" }
});

cssEditor.on("inputRead", function(cm, change) {
    if (!cm.state.completionActive && /* Enforce single completion */ change.origin !== "setValue" && shouldShowHint(cm, change)) {
        autoComplete(cm);
    }
});


const htmlEditor = CodeMirror.fromTextArea(document.getElementById("html-contain"), {
    mode: "htmlmixed",
    lineNumbers: true,
    theme: "dracula",
    viewportMargin: Infinity,
    autoCloseBrackets: true,
    autoCloseTags: true,
    smartIndent: true,
    indentUnit: 4,
    tabSize: 4,
    extraKeys: { "Ctrl-Space": "autocomplete" }
});

htmlEditor.on("inputRead", function(cm, change) {
    if (!cm.state.completionActive && /* Enforce single completion */ change.origin !== "setValue") {
        autoComplete(cm);
    }
});




const editor = document.getElementById("editor");
for (let i = 0; i < editor.children.length; i++) {
    const element = editor.children[i];
    // if has class gutter_v 
    if (element.classList.contains("gutter-v")) {
        element.addEventListener("mousedown", function(event) {
            element.style.cursor = "row-resize";
            const prevElement = editor.children[i - 1];
            const nextElement = editor.children[i + 1];
            const startY = event.clientY;
            const startPrevHeight = prevElement.offsetHeight;
            const startNextHeight = nextElement.offsetHeight;

            const mouseMove = (e) => {
                const deltaY = e.clientY - startY;
                let newPrevHeight = ((startPrevHeight + deltaY) / editor.offsetHeight) * 100;
                let newNextHeight = ((startNextHeight - deltaY) / editor.offsetHeight) * 100;

                // Ensure minimum size of 8%
                if (newPrevHeight < 8) {
                    newPrevHeight = 8;
                    newNextHeight = ((startPrevHeight + startNextHeight) / editor.offsetHeight) * 100 - newPrevHeight;
                }
                if (newNextHeight < 8) {
                    newNextHeight = 8;
                    newPrevHeight = ((startPrevHeight + startNextHeight) / editor.offsetHeight) * 100 - newNextHeight;
                }

                prevElement.style.height = `${newPrevHeight}%`;
                nextElement.style.height = `${newNextHeight}%`;
            }

            document.addEventListener("mousemove", mouseMove);

            document.addEventListener("mouseup", () => {
                element.style.cursor = "n-resize";
                document.removeEventListener("mousemove", mouseMove);
            }, { once: true });
        });
    }
}
