import FORGE from "./forge.js";
import * as LOADPREFIX from "./prefix.js";

import Use from "../Utils/index.js";
import { CACHE } from "../data-cache.js";
import { INDEX } from "../data-set.js";

function LoadVendors(collection = {}, vendor = "") {
	return vendor == ""
		? ["webkit", "moz", "ms", "o"].filter(
			(ven) => !collection.hasOwnProperty(ven),
		)
		: [vendor];
}

function StylePartialsArray(object, vendors = LoadVendors()) {
	const result = [];
	Object.entries(object).forEach(([key, value]) => {
		if (typeof value === "object") {
			if (Object.keys(value).length) result.push([key, value]);
		} else if (key[0] === "@") {
			Object.values(LOADPREFIX.forAtRule(key, vendors)).forEach((r) =>
				result.push([r + ";", ""]),
			);
		} else {
			LOADPREFIX.LoadProps(key, value, vendors).forEach(([k, v]) => {
				if (k === key || !object[k]) result.push([k + ":", v + ";"]);
			});
		}
	});
	return result;
}

function unNester(selector = "", object = {}, cumulates = {}) {
	const siblings = {},
		children = {},
		myself = {};
	const holder = (myself[selector] = {});

	Object.entries(object).forEach(([subSelector, subContent]) => {
		if (typeof subContent === "object") {
			if (subSelector[0] === "&") {
				const xelector = selector + subSelector.slice(1);
				if (subSelector[1] === " " || subSelector[1] === ":")
					unNester(xelector, subContent, children);
				else unNester(xelector, subContent, siblings);
			} else {
				unNester(subSelector, subContent, holder);
			}
		} else holder[subSelector] = subContent;
	});

	Object.assign(cumulates, siblings, myself, children);
	return cumulates;
}

function objectCompose(
	object,
	minify = false,
	vendors = LoadVendors(),
	first = true,
) {
	const tab = minify ? "" : "  ",
		space = minify ? "" : " ",
		styleSheet = [];

	StylePartialsArray(object, vendors).forEach(([key, value]) => {
		if (typeof value === "object") {
			if (!minify && first) styleSheet.push("");
			if (key[0] === "@") {
				const atPrefixes = LOADPREFIX.forAtRule;
				Object.entries(atPrefixes(key, vendors)).forEach(
					([vendor, selector]) => {
						styleSheet.push(
							selector,
							"{",
							...objectCompose(
								value,
								minify,
								LoadVendors(atPrefixes, vendor),
								false,
							).map((i) => tab + i),
							"}",
						);
					},
				);
			} else {
				styleSheet.push(...LOADPREFIX.forSelector(key, vendors));
				styleSheet.push(
					"{",
					...objectCompose(value, minify, vendors, false).map((i) => tab + i),
					"}",
				);
			}
		} else if (key[0] === "@") {
			styleSheet.push(key);
		} else {
			styleSheet.push(key + space + value);
		}
	});

	return styleSheet;
}

function stylesheetCreator(array, minify) {
	const styleSheet = [];

	array.forEach(([key, value]) => {
		const processed = typeof value === "object" ? unNester(key, value) : { [key]: value };
		styleSheet.push(...objectCompose(processed, minify));
	});

	return styleSheet.join(minify ? "" : "\n");
}

function rawCompose(selectorObjectArray = [], tab = "  ") {
	const styleSheet = [];

	selectorObjectArray.forEach(([key, value]) => {
		if (typeof value === "object") {
			styleSheet.push(
				key,
				"{",
				...rawCompose(Object.entries(value), tab).map((i) => tab + i),
				"}",
			);
		} else if (key[0] === "@") {
			styleSheet.push(key) + ";";
		} else {
			styleSheet.push(key + ": " + value + ";");
		}
	});

	return styleSheet;
}

function portableCreator(
	preBinds = [],
	postBinds = [],
	essentials = [],
	module = "module",
	version = "0.0.0",
) {
	const bindstack = {}, tab = "    ", portable = [`# ${module}@${version}`], binding = [];
	const bindingResponse = FORGE.bindIndex(new Set(preBinds), new Set(postBinds), true);

	Object.entries(CACHE.GlobalsStyle2Index).forEach(([selector, index]) => {
		const style = INDEX.OBJECT(index);
		bindstack[selector] = FORGE.bindIndex(new Set(style.preBinds), new Set(style.postBinds), true);
	});

	const classList = Object.keys(CACHE.GlobalsStyle2Index);
	portable.push(
		"", `## Xtyle Classes (${classList.length})`, "",
		...classList.map((c) => "- `" + c + "`"), "---",
	);
	[
		...Object.entries(CACHE.GlobalsStyle2Index).map(([selector, index]) => [selector, INDEX.OBJECT(index).object]),
		...bindingResponse.postBindsObject, ...bindingResponse.preBindsObject,
	].forEach(([selector, object]) => {
		portable.push(
			"", `### Selector: \`${selector}\``, "",
			"````html",
			"<xtyle",
			...Object.entries(object).reduce((accum, [subSelector, block]) => {
				if (subSelector === "") {
					accum.push(
						`${selector}="`,
						tab + `@pre-bind ${bindstack[selector].preBindsList.join(" ")}; `,
						tab + `@post-bind ${bindstack[selector].postBindsList.join(" ")}; `,
						...rawCompose(Object.entries(block), tab).map(
							(line) => tab + line,
						),
						'"',
					);
				} else {
					if (subSelector[0] === "@") {
						const ind = subSelector.indexOf(" ");
						const rule = subSelector.slice(1, ind);
						const query = subSelector.slice(ind + 1);

						subSelector = `${rule}@{${query}}`;
					}
					accum.push(
						`${subSelector}="`,
						...rawCompose(Object.entries(block), tab).map(
							(line) => tab + line,
						),
						'"',
					);
				}
				return accum;
			}, []).map((line) => tab + line),
			"/>",
			"````",
		);
	});

	portable.push(
		"",
		"## Portable Essentials",
		"",
		"````html",
		"<xtyle",
		...essentials
			.reduce((accum, [subSelector, block]) => {
				if (subSelector[0] === "@") {
					const ind = subSelector.indexOf(" ");
					const rule = subSelector.slice(1, ind);
					const query = subSelector.slice(ind + 1);

					subSelector = `${rule}@{${query}}`;
				}
				accum.push(
					`${subSelector}="`,
					...rawCompose(Object.entries(block), tab).map((line) => tab + line),
					'"',
				);
				return accum;
			}, [])
			.map((line) => tab + line),
		"/>",
		"````",
	);

	return {
		portable: portable.join("\n"),
		binding: binding.join("\n"),
	};
}

export default {
	Portable: portableCreator,
	Stylesheet: stylesheetCreator,
};
