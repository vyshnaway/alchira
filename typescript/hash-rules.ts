import * as $$ from "./shell.js";
import * as CACHE from "./data/cache.js";

const hashPattern = /#\{[a-z0-9-]+\}/i;

function IMPORT(rule: string, watchUndef = true, source = CACHE.PATH.json.hashrules.path) {
	const primitive = rule;
	const recursionSequence: string[] = [];
	const preview: Record<string, string> = {};

	const response = (
		result: string,
		cause = '',
		message = '',
	) => {
		const E = $$.HashruleError(
			primitive,
			cause,
			source,
			message,
			preview
		);

		return {
			status: message.length === 0,
			result,
			error: E.error,
			diagnostic: E.diagnostic
		};
	};

	let hashMatch;
	while ((hashMatch = hashPattern.exec(rule))) {
		const hash = hashMatch[0];
		const key = hash.slice(2, -1);
		const replacement = watchUndef
			? CACHE.CLASS.HashRule[key]
			: (CACHE.CLASS.HashRule[key] ?? hash);
		preview["FROM " + hash] = `GETS ${replacement} FROM ${rule}`;

		if (replacement === undefined) {
			return response('', hash, "Undefined Hashrule.");
		}
		if (recursionSequence.includes(hash)) {
			return response('', hash, "Hashrule recursion loop.");
		}
		rule = rule.replace(hashPattern, replacement);

		recursionSequence.push(hash);
	}

	return response(rule);
}

function UPLOAD() {
	const hashrules = CACHE.STATIC.HashRule;
	const errors: string[] = [];

	CACHE.CLASS.HashRule = { ...hashrules };
	Object.keys(hashrules).map((key) => {
		const hash = `#{${key}}`;
		const response = IMPORT(hash);
		if (typeof hashrules[key] === "string") {
			if (response.status) {
				hashrules[key] = response.result;
			} else {
				delete hashrules[key];
				errors.push(response.error);
			}
		}
	});

	CACHE.CLASS.HashRule = hashrules;

	return $$.HashruleReport(hashrules, errors);
}

function RENDER(string: string, sourcePath:string) {
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
		error: extended.error,
		diagnostic: extended.diagnostic
	};
}

export default {
	IMPORT,
	UPLOAD,
	RENDER,
};
