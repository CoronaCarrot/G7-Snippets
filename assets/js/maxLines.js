// set maximum number of lines CodeMirror instance is allowed to have}
// https://codepen.io/Souleste/pen/QWpGBva
(function (mod) {
	mod(CodeMirror);
})(function (CodeMirror) {
	var empty = function (cm, start, n) {
		while (start > n) {
			let count = cm.lineCount() - 1;
			cm.replaceRange(
				"",
				{ line: count - 1, ch: cm.getLine(count - 1).length },
				{ line: count, ch: cm.getLine(count).length }
			),
				start--;
			if (start == n) break;
		}
	};
	var extraContent = function (cm) {
		if (cm.lineCount() > cm.options.maxLines) {
			return cm
				.getRange(
					{ line: cm.options.maxLines - 1, ch: 0 },
					{
						line: cm.lineCount() - 1,
						ch: cm.getLine(cm.lineCount() - 1).length
					}
				)
				.replace(/\n/g, ""); // replace line breaks
		}
		return null;
	};
	var replaceExtra = function (cm, content) {
		cm.replaceRange(
			content,
			{ line: cm.options.maxLines - 1, ch: 0 },
			{
				line: cm.options.maxLines - 1,
				ch: cm.getLine(cm.options.maxLines - 1).length
			}
		); // replace last line with the extra content as one line
	};

	var onChange = function (cm, change) {
		if (
			change.text[0] == ">" &&
			change.text.length > 1 &&
			cm.options.autoCloseTags &&
			change.origin == "+insert"
		) {
			var content = extraContent(cm);
			empty(cm, cm.lineCount(), cm.options.maxLines);
			if (content) replaceExtra(cm, content);
			cm.setCursor({ line: change.from.line, ch: change.from.ch + 1 });
			cm.replaceRange(
				"",
				{ line: change.from.line, ch: change.from.ch + 1 },
				{ line: change.from.line, ch: change.from.ch + 3 }
			);
		}
	};

	var onPaste = function (cm) {
		if (cm.lineCount() >= cm.options.maxLines) {
			var lastLine = cm.lineCount() - 1;
			var content = extraContent(cm);
			cm.replaceRange(
				"",
				{ line: cm.options.maxLines - 1, ch: 0 },
				{ line: lastLine, ch: cm.getLine(lastLine).length }
			); // replace all extra content
			if (content) replaceExtra(cm, content);
		}
	};

	var keyMap = {
		Enter: function (cm) {
			if (cm.lineCount() < cm.options.maxLines) return CodeMirror.Pass; // run default behaviour
			cm.setCursor(cm.getCursor().line + 1);
		}
	};

	var start = function (cm) {
		// set maximum number of lines
		var count = cm.lineCount(); // current number of lines
		cm.setCursor(count); // set the cursor at the end of existing content
		var content = extraContent(cm);
		empty(cm, count, cm.options.maxLines);
		if (content) replaceExtra(cm, content);

		// disable user from adding lines past maximum
		cm.addKeyMap(keyMap);

		// bind functions
		cm.on("change", onChange);
		var wrapper = cm.display.wrapper;
		wrapper.addEventListener("paste", onPaste, true);
	};
	var end = function (cm) {
		cm.removeKeyMap(keyMap);

		// undbind functions
		cm.off("change", onChange);
		var wrapper = cm.display.wrapper;
		wrapper.removeEventListener("paste", onPaste, true);
	};

	CodeMirror.defineOption("maxLines", undefined, function (cm, val, old) {
		if (val !== undefined && val > 0) start(cm);
		else end(cm);
	});
});