import $ from "./Shell/main.js";
import { CACHE, RAW, TWEAKS } from "./Data/data-cache.js";

const hashPattern = /\{#[a-z0-9]+\}/i;
const preHashPattern = /(?<!\{)#\w+/g;

function IMPORT(string, watchUndef = true, ErrorisWarning = false) {
	const response = {
		status: true,
		result: "",
		error: "",
	};
	let hashMatch;
	const source = string;
	const recursionPreview = {};
	const recursionSequence = [];
	string = string.replace(preHashPattern, (match) => "{" + match + "}");

	const errors = {
		recursionLoop: (recursionPreview, cause) => {
			response.status = false;
			recursionPreview["ERROR BY"] = $.style.bold.Red(cause);
			response.error = $.MOLD[ErrorisWarning ? "warning" : "failed"].List(
				source +
				$.style.text[ErrorisWarning ? "Orange" : "Red"](
					" : Hashrule recursion loop.",
				),
				$.list.text.Props(recursionPreview),
				$.list.std.Waterfall,
			);
			return response;
		},
		undefinedHash: (recursionPreview, cause) => {
			response.status = false;
			recursionPreview["ERROR BY"] = $.style.bold.Red(cause);
			response.error = $.MOLD[ErrorisWarning ? "warning" : "failed"].List(
				source +
				$.style.text[ErrorisWarning ? "Orange" : "Red"](
					" : Undefined hashrule.",
				),
				$.list.text.Props(recursionPreview),
				$.list.std.Waterfall,
			);
			return response;
		},
	};

	while ((hashMatch = hashPattern.exec(string))) {
		const hash = hashMatch[0];
		const key = hash.slice(2, -1);
		const replacement = watchUndef
			? CACHE.HashRule[key]
			: (CACHE.HashRule[key] ?? hash);
		recursionPreview["FROM " + hash] = `GETS ${replacement} FROM ${string}`;

		if (replacement === undefined) {
			return errors.undefinedHash(recursionPreview, hash);
		}
		if (recursionSequence.includes(hash)) {
			return errors.recursionLoop(recursionPreview, hash);
		}
		string = string
			.replace(hashPattern, replacement)
			.replace(preHashPattern, (match) => "{" + match + "}");

		recursionSequence.push(hash);
	}

	response.result = string;
	return response;
}

function UPLOAD() {
	const hashrule = RAW.HASHRULE;
	const hashruleErrors = [];

	CACHE.HashRule = { ...hashrule };
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
	CACHE.HashRule = hashrule;

	return $.MOLD.std.Block([
		$.MOLD.primary.Section("Active Hashrules"),
		$.MOLD.std.Block($.list.text.Props(hashrule), $.list.std.Bullets),
		...(hashruleErrors.length > 0
			? [$.MOLD.failed.Footer("Invalid Hashrules"), hashruleErrors]
			: []),
	]);
}

function RENDER(string, sourcePath = "", ErrorisWarning = false) {
	const extended = IMPORT(string, true, ErrorisWarning);
	string = extended.result;
	let rule = [],
		selector = [],
		Marker = 0,
		length = string.length,
		deviance = 0;

	for (let i = 0; i < length; i++) {
		let ch = string[i];

		if (")}".includes(ch)) deviance--;

		if (deviance) {
			rule.push(ch);
		} else if (ch === "$") {
			Marker = i + 1;
			break;
		} else {
			switch (ch) {
				case "{":
					rule.push("");
					break;
				case "}":
					rule.push("");
					break;
				case ",":
					rule.push(TWEAKS.shorthands ? ", " : ",");
					break;
				case "|":
					rule.push(TWEAKS.shorthands ? " or " : "|");
					break;
				case "&":
					rule.push(TWEAKS.shorthands ? " and " : "&");
					break;
				case "!":
					rule.push(TWEAKS.shorthands ? " not " : "!");
					break;
				case "*":
					rule.push(TWEAKS.shorthands ? " all " : "*");
					break;
				case "^":
					rule.push(TWEAKS.shorthands ? " only " : "^");
					break;
				case "@":
					rule.unshift("@");
					rule.push(" ");
					break;
				default:
					rule.push(ch);
			}
		}
		if ("({".includes(ch)) deviance++;
	}

	if (Marker > 0) {
		for (let i = Marker; i < length; i++) {
			const ch = string[i];
			if (ch === "{") {
				if (i + 1 < string.length && string[i + 1] !== ":") selector.push(" ");
			} else if (ch !== "}") {
				selector.push(ch);
			}
		}
	}

	const finalRule = rule.join("").trim()
		.replaceAll(/width\s*>=/, "min-width:")
		.replaceAll(/width\s*<=/, "max-width:")
		.replaceAll(/height\s*>=/, "min-height:")
		.replaceAll(/height\s*<=/, "max-height:")
		.replaceAll(/\s+/, " ");

	return {
		rule: finalRule,
		subSelector: selector.join("").trim(),
		status: extended.status,
		error: extended.error + $.MOLD.text.Item(sourcePath) + "\n",
	};
}

export default {
	IMPORT,
	UPLOAD,
	RENDER,
};
