injectConsole = (w) => {
    const pushToConsole = (payload, type) => {
        w.parent.postMessage({
            console: {
                payload: payload,
                type:    type
            }
        }, "*")
    }
    
    w.onerror = (message, url, line, column) => {
        pushToConsole(`${message} at ${line}:${column}`, "iframe-error")
    }
    
    if (w.console.system){
        w.console.system("🔏 Running Playground Snippet")
        return
    }

    let console = (function(systemConsole){
        const createConsoleMethod = (method) => {
            return function() {
                let args = Array.from(arguments);
                pushToConsole(args, method);
                systemConsole[method].apply(this, args);
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
            timeEnd: createConsoleMethod("timeEnd"),
            timeLog: createConsoleMethod("timeLog"),
            trace: createConsoleMethod("trace"),
            profile: createConsoleMethod("profile"),
            profileEnd: createConsoleMethod("profileEnd"),
            count: createConsoleMethod("count"),
            countReset: createConsoleMethod("countReset"),
            timeStamp: createConsoleMethod("timeStamp"),
            system: function(arg) {
                pushToConsole(arg, "system");
            },
            clear: function() {
                systemConsole.clear.apply(this, {});
            },
            time: function() {
                let args = Array.from(arguments);
                systemConsole.time.apply(this, args);
            },
            assert: function(assertion, label) {
                if (!assertion) {
                    pushToConsole(label, "log");
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