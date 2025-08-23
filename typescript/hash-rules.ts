import $ from "./Shell/main.js";
import { CACHE_DYNAMIC, CACHE_STATIC, TWEAKS } from "./Data/cache.js";
import * as $$ from "./shell.js";

const hashPattern = /#\{[a-z0-9]+\}/i;

function IMPORT(string: string, watchUndef = true, ErrorisWarning = false) {
	const response = {
		status: true,
		result: "",
		error: "",
	};
	let hashMatch;
	const source = string;
	const recursionPreview: Record<string, string> = {};
	const recursionSequence: string[] = [];

	const errors = {
		recursionLoop: (recursionPreview: Record<string, string>, cause: string) => {
			response.status = false;
			recursionPreview["ERROR BY"] = $.MAKE(cause, $.style.TS_Bold, $.style.BG_Normal_Red);
			response.error = $.MOLD[ErrorisWarning ? "warning" : "failed"].List(
				source +
				$.MAKE(" : Hashrule recursion loop.", ErrorisWarning ? $.style.FG_Normal_Yellow : $.style.FG_Normal_Red),
				$$.Props.text(recursionPreview),
				$.list.std.Waterfall,
			);
			return response;
		},
		undefinedHash: (recursionPreview: Record<string, string>, cause: string) => {
			response.status = false;
			recursionPreview["ERROR BY"] = $.MAKE(cause, $.style.TS_Bold, $.style.BG_Normal_Red);
			response.error = $.MOLD[ErrorisWarning ? "warning" : "failed"].List(
				source +
				$.MAKE(" : Undefined hashrule.", ErrorisWarning ? $.style.FG_Normal_Yellow : $.style.FG_Normal_Red),
				$$.Props.text(recursionPreview),
				$.list.std.Waterfall,
			);
			return response;
		},
	};

	while ((hashMatch = hashPattern.exec(string))) {
		const hash = hashMatch[0];
		const key = hash.slice(2, -1);
		const replacement = watchUndef
			? CACHE_DYNAMIC.HashRule[key]
			: (CACHE_DYNAMIC.HashRule[key] ?? hash);
		recursionPreview["FROM " + hash] = `GETS ${replacement} FROM ${string}`;

		if (replacement === undefined) {
			return errors.undefinedHash(recursionPreview, hash);
		}
		if (recursionSequence.includes(hash)) {
			return errors.recursionLoop(recursionPreview, hash);
		}
		string = string.replace(hashPattern, replacement);

		recursionSequence.push(hash);
	}

	response.result = string;
	return response;
}

function UPLOAD() {
	const hashrule = CACHE_STATIC.HASHRULE;
	const hashruleErrors: string[] = [];

	CACHE_DYNAMIC.HashRule = { ...hashrule };
	Object.keys(hashrule).map((key) => {
		const hash = "#" + key;
		const response = IMPORT(hash);
		if (typeof hashrule[key] === "string") {
			if (response.status) {
				hashrule[key] = response.result;
			} else {
				delete hashrule[key];
				hashruleErrors.push(response.error);
			}
		}
	});
	CACHE_DYNAMIC.HashRule = hashrule;

	return $.MOLD.std.Block([
		$.MOLD.primary.Section("Active Hashrules"),
		$.MOLD.std.Block($$.Props.std(hashrule), $.list.std.Bullets),
		...(hashruleErrors.length ? [$.MOLD.failed.Footer("Invalid Hashrules", hashruleErrors)] : []),
	]);
}

function RENDER(string: string, sourcePath = "", ErrorisWarning = false) {
	const extended = IMPORT(string, true, ErrorisWarning);
	string = extended.result;
	const length = string.length;
	let rule = '', selector = '', Marker = 0, deviance = 0;

	for (let i = 0; i < length; i++) {
		const ch = string[i];

		if (")}".includes(ch)) { deviance--; }

		if (deviance) {
			rule += ch;
		} else if (ch === "$") {
			Marker = i + 1;
			break;
		} else {
			switch (ch) {
				case "{":
					rule += "";
					break;
				case "}":
					rule += "";
					break;
				case ",":
					rule += TWEAKS.shorthands ? ", " : ",";
					break;
				case "|":
					rule += TWEAKS.shorthands ? " or " : "|";
					break;
				case "&":
					rule += TWEAKS.shorthands ? " and " : "&";
					break;
				case "!":
					rule += TWEAKS.shorthands ? " not " : "!";
					break;
				case "*":
					rule += TWEAKS.shorthands ? " all " : "*";
					break;
				case "^":
					rule += TWEAKS.shorthands ? " only " : "^";
					break;
				case "@":
					rule = "@" + rule;
					rule += " ";
					break;
				default:
					rule += ch;
			}
		}
		if ("({".includes(ch)) { deviance++; }
	}

	if (Marker > 0) {
		for (let i = Marker; i < length; i++) {
			const ch = string[i];
			if (ch === "{") {
				if (i + 1 < string.length && string[i + 1] !== ":") { selector += " "; }
			} else if (ch !== "}") {
				selector += ch;
			}
		}
	}

	const finalRule = rule.trim()
		.replace(/width\s*>=/g, "min-width:")
		.replace(/width\s*<=/g, "max-width:")
		.replace(/height\s*>=/g, "min-height:")
		.replace(/height\s*<=/g, "max-height:")
		.replace(/\s+/g, " ");

	return {
		rule: finalRule,
		subSelector: selector.trim(),
		status: extended.status,
		error: extended.error + $.MOLD.text.Item(sourcePath) + "\n",
	};
}

export default {
	IMPORT,
	UPLOAD,
	RENDER,
};
