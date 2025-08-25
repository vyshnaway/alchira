import $ from "./Shell/main.js";
import { CACHE_DYNAMIC, CACHE_STATIC } from "./Data/cache.js";
import * as $$ from "./shell.js";
import { t_Diagnostic } from "./types.js";

const hashPattern = /#\{[a-z0-9]+\}/i;

function IMPORT(string: string, watchUndef = true, sourcePath = "") {
	const response: {
		status: boolean,
		result: string,
		error: string,
		diagnostic: t_Diagnostic
	} = {
		status: true,
		result: "",
		error: "",
		diagnostic: {
			error: '',
			source: [sourcePath]
		}
	};

	let hashMatch;
	const source = string;
	const recursionPreview: Record<string, string> = {};
	const recursionSequence: string[] = [];

	const errors = {
		recursionLoop: (recursionPreview: Record<string, string>, cause: string) => {
			response.status = false;
			recursionPreview["ERROR BY"] = $.MAKE(cause, $.style.TS_Bold, $.style.BG_Normal_Red);
			response.error = $.MOLD.failed.List(
				source +
				$.MAKE(" : Hashrule recursion loop.", $.style.FG_Normal_Yellow),
				$$.Props.text(recursionPreview),
				$.list.std.Waterfall,
			);
			response.diagnostic.error = $.MOLD.std.List(
				source + " : Hashrule recursion loop.",
				$$.Props.std(recursionPreview),
				$.list.std.Waterfall,
			);
			return response;
		},
		undefinedHash: (recursionPreview: Record<string, string>, cause: string) => {
			response.status = false;
			recursionPreview["ERROR BY"] = $.MAKE(cause, $.style.TS_Bold, $.style.BG_Normal_Red);
			response.error = $.MOLD.failed.List(
				source +
				$.MAKE(" : Undefined hashrule.", $.style.FG_Normal_Yellow),
				$$.Props.text(recursionPreview),
				$.list.std.Waterfall,
			);
			response.diagnostic.error = $.MOLD.std.List(
				source + " : Undefined hashrule.",
				$$.Props.std(recursionPreview),
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
	const hashrule = CACHE_STATIC.HashRule;
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

function RENDER(string: string, sourcePath = "") {
	const extended = IMPORT(string, true, sourcePath);
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
					rule += " ";
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

	const subSelector = selector.trim();
	const finalRule = rule.trim()
		.replace(/width\s*>=/g, "min-width:")
		.replace(/width\s*<=/g, "max-width:")
		.replace(/height\s*>=/g, "min-height:")
		.replace(/height\s*<=/g, "max-height:")
		.replace(/\s+/g, " ");


	return {
		rule: (finalRule === "_" || finalRule === "-") ? "" : finalRule,
		subSelector: (subSelector === "_" || subSelector === "-") ? "" : subSelector,
		status: extended.status,
		error: extended.error + $.MOLD.text.Item(sourcePath) + "\n",
		diagnostic: extended.diagnostic
	};
}

export default {
	IMPORT,
	UPLOAD,
	RENDER,
};
