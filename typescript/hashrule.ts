import * as $$ from "./shell.js";
import * as CACHE from "./data/cache.js";
import Use from "./utils/main.js";

const hashPattern = /#\{[a-z0-9-]+\}/i;

function IMPORT(rule: string, watchUndef = true, source = CACHE.PATH.json.hashrule.path) {
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

	let rgxMatch;
	while ((rgxMatch = hashPattern.exec(rule))) {
		const match = rgxMatch[0];
		const key = match.slice(2, -1);
		const replacement = watchUndef
			? CACHE.CLASS.Hashrule[key]
			: (CACHE.CLASS.Hashrule[key] ?? match);
		preview["FROM " + match] = `GETS ${replacement} FROM ${rule}`;

		if (replacement === undefined) {
			return response('', match, "Undefined Hashrule.");
		}
		if (recursionSequence.includes(match)) {
			return response('', match, "Hashrule recursion loop.");
		}
		rule = rule.replace(hashPattern, replacement);

		recursionSequence.push(match);
	}

	return response(rule);
}

function UPLOAD() {
	const errors: string[] = [];
	CACHE.CLASS.Hashrule = CACHE.STATIC.Hashrule;
	const hashrule = { ...CACHE.STATIC.Hashrule };

	Object.keys(hashrule).map((key) => {
		const hash = `#{${key}}`;
		const response = IMPORT(hash);
		if (response.status) {
			hashrule[key] = response.result;
		} else {
			delete hashrule[key];
			errors.push(response.error);
		}
	});

	CACHE.CLASS.Hashrule = hashrule;
	CACHE.DELTA.Manifest.hashrules = hashrule;
	CACHE.DELTA.Report.hashrule = $$.HashruleReport(hashrule, errors);
}

function RENDER(string: string, sourcePath: string) {
	const extended = IMPORT(string, true, sourcePath);
	const snippets = Use.string.zeroBreaks(extended.result, ["&"]);
	const wrappers: string[] = [];

	snippets.forEach(snippet => {
		snippet = snippet.trim();
		const length = snippet.length;
		let wrapper = '', deviance = 0, splAtrule = false;

		for (let i = 0; i < length; i++) {
			const ch = snippet[i];
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
						if (wrapper.length) {
							wrapper += " ";
							splAtrule = true;
						}
						wrapper = "@" + wrapper;
						break;
					default:
						wrapper += ch;
				}
			}
			if ("({".includes(ch)) { deviance++; }
		}
		if (wrapper.length) {
			wrappers.push((splAtrule
				? wrapper
					.replace(/width\s*>=/g, "min-width:")
					.replace(/width\s*<=/g, "max-width:")
					.replace(/height\s*>=/g, "min-height:")
					.replace(/height\s*<=/g, "max-height:")
				: wrapper).replace(/\s+/g, " "));
		}
	});

	return {
		wrappers,
		status: extended.status,
		error: extended.error,
		diagnostic: extended.diagnostic
	};
}

function WRAPPER(parentObject: Record<string, object>, keys: string[], childObject: object, parentAtrule = true) {
	const activeKey = keys.shift();
	if (activeKey) {
		const modkey = (parentAtrule || activeKey.startsWith("@")) ? activeKey : ('&' + activeKey);
		if (keys.length) {
			if (!parentObject[modkey]) {
				parentObject[modkey] = {};
				WRAPPER(parentObject[modkey] as Record<string, object>, keys, childObject, activeKey.startsWith("@"));
			}
		} else {
			parentObject[modkey] = childObject;
		}
	}
}; 

export default {
	IMPORT,
	UPLOAD,
	RENDER,
	WRAPPER
};
