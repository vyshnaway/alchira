import * as $$ from "./shell.js";
import * as CACHE from "./data/cache.js";
import Use from "./utils/main.js";

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
	CACHE.DELTA.Manifest.hashrules = hashrules;
	CACHE.DELTA.Report.hashrules = $$.HashruleReport(hashrules, errors);
}

function RENDER(string: string, sourcePath: string) {
	const extended = IMPORT(string, true, sourcePath);
	const snippets = Use.string.zeroBreaks(extended.result, ["&"]);
	const wrappers: string[] = [];

	snippets.forEach(snippet => {
		const length = snippet.length;
		let wrapper = '', deviance = 0, splAtrule = false;

		for (let i = 0; i < length; i++) {
			const ch = string[i];
			if (")}".includes(ch)) { deviance--; }

			if (deviance) {
				wrapper += ch;
			} else {
				switch (ch) {
					case "{":
					case "}":
						wrapper += "";
						break;
					case "@":
						wrapper = "@" + wrapper;
						if (wrapper.length === 0) { splAtrule = true; }
						wrapper += " ";
						break;
					default:
						wrapper += ch;
				}
			}
			if ("({".includes(ch)) { deviance++; }
		}

		wrappers.push((splAtrule
			?  wrapper
				.replace(/width\s*>=/g, "min-width:")
				.replace(/width\s*<=/g, "max-width:")
				.replace(/height\s*>=/g, "min-height:")
				.replace(/height\s*<=/g, "max-height:")
			: wrapper).replace(/\s+/g, " "));
	});

	console.log(wrappers);
	return {
		wrappers,
		status: extended.status,
		error: extended.error,
		diagnostic: extended.diagnostic
	};
}

function WRAPPER(parentObject: Record<string, object>, keys: string[], childObject: object, inital = true) {
	const activeKey = keys.pop();
	if (activeKey) {
		const modkey = (inital || activeKey.startsWith("@")) ? activeKey : ('&' + activeKey);
		if (keys.length) {
			if (!parentObject[modkey]) {
				parentObject[modkey] = {};
				WRAPPER(parentObject[modkey] as Record<string, object>, keys, childObject, false);
			}
		} else {
			parentObject[modkey] = childObject;
		}
	}
}

export default {
	IMPORT,
	UPLOAD,
	RENDER,
	WRAPPER
};
