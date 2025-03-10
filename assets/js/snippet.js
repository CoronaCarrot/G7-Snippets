const jsCode = document.getElementById("js-contain");
const urlParams = new URLSearchParams(window.location.search);

const jsSrc = urlParams.get('js') ?? "";
jsCode.value = jsSrc;

const jsEditor = CodeMirror.fromTextArea(document.getElementById("js-contain"), {
    mode: "javascript",
    lineWrapping: true,
    readOnly: true,
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