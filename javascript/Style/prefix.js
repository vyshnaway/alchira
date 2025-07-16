import palletes from "./color.js";

import Use from "../Utils/main.js";
import { APP, PREFIX } from "../data-cache.js";

const VENDORS = APP.vendors;

export function forAtRule(
	content = "",
	prefixes = VENDORS,
) {
	let index = content.indexOf(" ");
	index = index < 0 ? content.length : index;
	const rule = content.slice(0, index),
		data = content.slice(index);

	const result = {};
	prefixes.forEach((group) => {
		if (PREFIX.atRule[rule] && PREFIX.atRule[rule][group])
			result[group] = PREFIX.atRule[rule][group] + data;
	}, {});
	result[""] = content;

	return result;
}

export function forSelector(
	content = "",
	prefixes = VENDORS,
) {
	const stringList = Use.string.zeroBreaks(content, [","]).map((i) => i.trim()), selectors = [];
	stringList.forEach((string = "") => {
		const result = Object.fromEntries([...VENDORS, ""].map(ven => [ven, { out: "", score: 0 }]))

		prefixes.forEach((group) => {
			result[group].out = string.replace(/:+[\w-]+/g, (selector) => {
				if (PREFIX.pseudos[selector] && PREFIX.pseudos[selector][group])
					result[group].score++;
				return (
					(PREFIX.pseudos[selector] && PREFIX.pseudos[selector][group]) ||
					PREFIX.pseudos[selector] ||
					selector
				);
			});
		});

		selectors.push(
			...Object.values(result).reduce((acc, item) => {
				if (item.score) acc.push(item.out);
				return acc;
			}, []),
			string,
		);
	});
	const finalIndex = selectors.length - 1;
	const result = selectors.map((s, i) => (finalIndex !== i ? s + "," : s));

	return result;
}

function forAttribute(content = "", prefixes = VENDORS) {
	const attrVals = PREFIX.attributes[content];
	if (!attrVals) return { "": content };

	const result = {};
	Object.entries(attrVals).forEach(([vendor, value]) => {
		if (prefixes.includes(vendor)) result[vendor] = value;
	});
	result[""] = content;

	return result;
}

function forValues(attribute, value, prefixes = VENDORS) {
	const cleanValue = Use.code.uncomment.Css(value);
	const venVals = PREFIX.values?.[attribute]?.[cleanValue];
	if (!venVals) return { "": value };

	const result = {};
	Object.entries(venVals).forEach(([vendor, val]) => {
		if (prefixes.includes(vendor))
			result[vendor] = value.replace(cleanValue, val);
	});
	result[""] = value;

	return result;
}

export function LoadProps(
	attribute = "",
	value = "",
	prefixes = VENDORS,
) {
	const results = [];
	const attributes = forAttribute(attribute, prefixes);

	const values = forValues(attribute, value);
	Object.entries(attributes).forEach(([attrVen, attr]) => {
		Object.entries(values).forEach(([valVen, val]) => {
			if (attrVen === valVen || valVen === "") {
				const valvars = palletes(val);
				valvars.forEach(v => results.push([attr, v]))
			}
		});
	});

	return results;
}
