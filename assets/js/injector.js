injectConsole = (w) => {

    const isClonable = (obj) => {
        try {
            structuredClone(obj);
            return true;
        } catch (e) {
            return false;
        }
    };

    const convertToPlainObject = (obj) => {
        if (typeof obj === 'object' && obj !== null) {
            const plainObject = {};
            for (const key in obj) {
                // if function, apply custom serialization
                if (typeof obj[key] === 'function') {
                    let fstring = `ƒ ${obj[key].name}()`
                    plainObject[fstring] = {
                        length: obj[key].length,
                        name: obj[key].name,
                        arguments: (() => {try {return convertToPlainObject(obj[key].arguments)} catch(e) {return e}})(),
                        caller: (() => {try {return convertToPlainObject(obj[key].caller)} catch(e) {return e}})(),
                    };
                } else if (obj.hasOwnProperty(key)) {
                    plainObject[key] = convertToPlainObject(obj[key]);
                }
            }
            return plainObject;
        }
        return obj;
    };

    const pushToConsole = (payload, type) => {
        if (!isClonable(payload)) {
            payload = convertToPlainObject(payload);
        }
        w.parent.postMessage({
            console: {
                payload: payload,
                type: type
            }
        }, "*");
    };
    
    w.onerror = (message, url, line, column, e) => {
        w.parent.postMessage({ message: message, error: e, console: { type: "iframe-error", payload: e } }, "*");
    }
    
    if (w.console.system){
        w.console.system("🔏 Running Playground Snippet")
        return
    }

    let console = (function(systemConsole){
        const createConsoleMethod = (method, dnt) => {
            return function() {
                let args = Array.from(arguments);
                if (!dnt) systemConsole[method].apply(this, args);
                pushToConsole(args, method);
            }
        }

        return {
            log: createConsoleMethod("log"),
            info: createConsoleMethod("info"),
            warn: createConsoleMethod("warn"),
            error: createConsoleMethod("error"),
            debug: createConsoleMethod("debug"),
            dir: createConsoleMethod("dir"),
            dirxml: createConsoleMethod("dirxml"),
            group: createConsoleMethod("group"),
            groupCollapsed: createConsoleMethod("groupCollapsed"),
            groupEnd: createConsoleMethod("groupEnd"),
            table: createConsoleMethod("table"),
            timeEnd: createConsoleMethod("timeEnd", true),
            timeLog: createConsoleMethod("timeLog", true),
            trace: function() {
                let args = Array.from(arguments);
                systemConsole.trace.apply(this, args);
                const err = new Error();
                var aux = err.stack.split("\n");
                aux.splice(0, 2); // removing the line that we force to generate the error (var err = new Error();) from the message

                pushToConsole([aux], "trace");
            },
            profile: createConsoleMethod("profile"),
            profileEnd: createConsoleMethod("profileEnd"),
            count: createConsoleMethod("count"),
            countReset: createConsoleMethod("countReset"),
            timeStamp: createConsoleMethod("timeStamp"),
            system: function(arg) {
                pushToConsole(arg, "system");
            },
            clear: createConsoleMethod("clear", true),
            time: createConsoleMethod("time", true),
            assert: function(assertion, label) {
                if (!assertion) {
                    pushToConsole(label, "assert");
                }
                let args = Array.from(arguments);
                systemConsole.assert.apply(this, args);
            },
        }
    }(window.console))

    window.console = { ...window.console, ...console }

    console.system("🔏 Running Playground Snippet")
}

if (window.parent){
    injectConsole(window)
}