import palletes from "./color.js";

import Use from "../utils/main.js";
import * as CACHE from "../data/cache.js";

const VENDORS = CACHE._ROOT.vendors;


function forAttribute(content: string, prefixes = VENDORS) {
	const attrVals = CACHE._PREFIX.attributes[content];
	if (!attrVals) { return { "": content }; }

	const result: Record<string, string> = {};
	Object.entries(attrVals).forEach(([vendor, value]) => {
		if (prefixes.includes(vendor)) { result[vendor] = value; }
	});
	result[""] = content;

	return result;
}

function forValues(attribute: string, value: string, prefixes = VENDORS) {
	const cleanValue = Use.code.uncomment.Css(value);
	const venVals = CACHE._PREFIX.values?.[attribute]?.[cleanValue];
	if (!venVals) { return { "": value }; }

	const result: Record<string, string> = {};
	Object.entries(venVals).forEach(([vendor, val]) => {
		if (prefixes.includes(vendor)) {
			result[vendor] = value.replace(cleanValue, val);
		}
	});
	result[""] = value;

	return result;
}

export function LoadProps(
	attribute = "",
	value = "",
	prefixes = VENDORS,
) {
	const results: [string, string][] = [];
	const attributes = forAttribute(attribute, prefixes);

	const values = forValues(attribute, value);
	Object.entries(attributes).forEach(([attrVen, attr]) => {
		Object.entries(values).forEach(([valVen, val]) => {
			if (attrVen === valVen || valVen === "") {
				const valvars = palletes(val);
				valvars.forEach(v => results.push([attr, v]));
			}
		});
	});

	return results;
}



export function forAtRule(
	content = "",
	prefixes = VENDORS,
) {
	let index = content.indexOf(" ");
	index = index < 0 ? content.length : index;
	const rule = content.slice(0, index), data = content.slice(index);

	const result: Record<string, string> = {};
	prefixes.forEach((group) => {
		if (CACHE._PREFIX.atrules[rule] && CACHE._PREFIX.atrules[rule][group]) {
			result[group] = CACHE._PREFIX.atrules[rule][group] + data;
		}
	}, {});
	result[""] = content;

	return result;
}

export function forPseudos(
	content = "",
	prefixes = VENDORS,
) {
	const stringList = Use.string.zeroBreaks(content, [","]).map((i) => i.trim()), selectors: string[] = [];
	stringList.forEach((string = "") => {

		const result = Object.fromEntries([...VENDORS, ""].map(ven => [ven, { out: "", score: 0 }]));

		prefixes.forEach((group) => {
			result[group].out = string.replace(/:+[\w-]+/g, (selector) => {
				if (CACHE._PREFIX.pseudos[selector] && CACHE._PREFIX.pseudos[selector][group]) {
					result[group].score++;
					return CACHE._PREFIX.pseudos[selector][group];
				}

				if (CACHE._PREFIX.pseudos[selector]) {
					return selector;
				}

				return selector;
			});
		});

		selectors.push(
			...Object.values(result).reduce((acc: string[], item) => {
				if (item.score) { acc.push(item.out); }
				return acc;
			}, []),
			string,
		);
	});
	const finalIndex = selectors.length - 1;
	const result = selectors.map((s, i) => (finalIndex !== i ? s + "," : s));

	return result;
}