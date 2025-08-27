import $ from "./shell/main.js";
import * as $$ from "./shell.js";
import * as _support from "./type/support.js";
import * as CACHE from "./data/cache.js";

const hashPattern = /#\{[a-z0-9]+\}/i;

function IMPORT(string: string, watchUndef = true, sourcePath = "") {
	const response: {
		status: boolean,
		result: string,
		error: string,
		diagnostic: _support.Diagnostic
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
			recursionPreview["ERROR BY"] = $.FMT(cause, $.style.AS_Bold, $.style.TC_Normal_Red);
			response.error = $.MAKE(
				$.tag.H6(source + $.FMT(" : Hashrule recursion loop.", $.style.TB_Normal_Yellow)),
				$$.PropMap(recursionPreview),
				[$.list.Waterfall, 0, []],
			);
			response.diagnostic.error = $.MAKE(
				$.tag.H6(source + " : Hashrule recursion loop."),
				$$.PropMap(recursionPreview),
				[$.list.Waterfall, 0, []],
			);
			return response;
		},
		undefinedHash: (recursionPreview: Record<string, string>, cause: string) => {
			response.status = false;
			recursionPreview["ERROR BY"] = $.FMT(cause, $.style.AS_Bold, $.style.TC_Normal_Red);
			response.error = $.MAKE(
				$.tag.H6(source + $.FMT(" : Undefined hashrule.", $.style.TB_Normal_Yellow)),
				$$.PropMap(recursionPreview),
				[$.list.Waterfall, 0, []],
			);
			response.diagnostic.error = $.MAKE(
				$.tag.H6(source + " : Undefined hashrule."),
				$$.PropMap(recursionPreview),
				[$.list.Waterfall, 0, []],
			);
			return response;
		},
	};

	while ((hashMatch = hashPattern.exec(string))) {
		const hash = hashMatch[0];
		const key = hash.slice(2, -1);
		const replacement = watchUndef
			? CACHE.DYNAMIC.HashRule[key]
			: (CACHE.DYNAMIC.HashRule[key] ?? hash);
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
	const hashrule = CACHE.STATIC.HashRule;
	const hashruleErrors: string[] = [];

	CACHE.DYNAMIC.HashRule = { ...hashrule };
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
	CACHE.DYNAMIC.HashRule = hashrule;

	return $.MAKE("", [
		$.tag.H2("Active Hashrules", $.preset.primary),
		$.MAKE("", $$.PropMap(hashrule), [$.list.Bullets, 0, []]),
		...(hashruleErrors.length ? [$.MAKE($.tag.H5("Invalid Hashrules", $.preset.failed), hashruleErrors)] : []),
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
		error: extended.error + $.tag.Li(sourcePath) + "\n",
		diagnostic: extended.diagnostic
	};
}

export default {
	IMPORT,
	UPLOAD,
	RENDER,
};
