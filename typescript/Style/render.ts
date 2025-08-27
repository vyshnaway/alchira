import * as CACHE from "../Data/cache.js";
import * as LOADPREFIX from "./prefix.js";

type t_styleSorceTemplate = Record<string, string | object>;

function LoadVendors(collection = {}, vendor = "") {
	return vendor == ""
		? CACHE._ROOT.vendors.filter((ven) => 
			!Object.prototype.hasOwnProperty.call(collection, ven),
		): [vendor];
}

function StylePartialsArray(object: t_styleSorceTemplate, vendors = LoadVendors()) {
	const result: [string, string | object][] = [];
	Object.entries(object).forEach(([key, value]) => {
		if (typeof value === "object") {
			if (Object.keys(value).length) {
				result.push([key, value]);
			}
		} else if (key[0] === "@") {
			Object.values(LOADPREFIX.forAtRule(key, vendors)).forEach((r) =>
				result.push([r + ";", ""]),
			);
		} else {
			LOADPREFIX.LoadProps(key, value, vendors).forEach(([k, v]) => {
				if (k === key || !object[k]) { result.push([k + ":", v + ";"]); }
			});
		}
	});
	return result;
}

function unNester(selector = "", object: object = {}, cumulates: object = {}) {
	const siblings: t_styleSorceTemplate = {},
		children: t_styleSorceTemplate = {},
		myself: t_styleSorceTemplate = {};
	const holder: t_styleSorceTemplate = myself[selector] = {};

	Object.entries(object as t_styleSorceTemplate).forEach(([subSelector, subContent]) => {
		if (typeof subContent === "object") {
			if (subSelector[0] === "&") {
				const xelector = selector + subSelector.slice(1);
				if (subSelector[1] === " " || subSelector[1] === ":") {
					unNester(xelector, subContent, children);
				} else {
					unNester(xelector, subContent, siblings);
				}
			} else {
				unNester(subSelector, subContent, holder);
			}
		} else {
			holder[subSelector] = subContent;
		}
	});

	Object.assign(cumulates, siblings, myself, children);
	return cumulates as t_styleSorceTemplate;
}

function objectCompose(
	object: t_styleSorceTemplate,
	minify = false,
	vendors = LoadVendors(),
	first = true,
) {
	const tab = minify ? "" : "  ",
		space = minify ? "" : " ",
		styleSheet: string[] = [];

	StylePartialsArray(object, vendors).forEach(([key, value]) => {
		if (typeof value === "object") {
			if (Object.keys(value).length) {
				if (!minify && first) { styleSheet.push(""); }
				if (key[0] === "@") {
					const atPrefixes = LOADPREFIX.forAtRule;
					Object.entries(atPrefixes(key, vendors)).forEach(
						([vendor, selector]) => {
							const composedObject = objectCompose(
								value as t_styleSorceTemplate,
								minify,
								LoadVendors(atPrefixes, vendor),
								false,
							);
							if (composedObject.length) {
								styleSheet.push(
									selector,
									"{",
									...composedObject.map((i) => tab + i),
									"}",
								);
							}
						},
					);
				} else {
					const composedObject = objectCompose(
						value as t_styleSorceTemplate,
						minify,
						vendors,
						false);
					if (Object.keys(composedObject).length) {
						styleSheet.push(...LOADPREFIX.forPseudos(key, vendors));
						styleSheet.push(
							"{",
							...composedObject.map((i) => tab + i),
							"}",
						);
					}
				}
			}
		} else if (key[0] === "@") {
			styleSheet.push(key);
		} else {
			styleSheet.push(key + space + value);
		}
	});

	return styleSheet;
}

function stylesheetCreator(array: [string, string | object][], minify: boolean) {
	const styleSheet: string[] = [];

	array.forEach(([key, value]) => {
		if (typeof value === "object") {
			const unNested = unNester(key, value);
			if (Object.keys(unNested).length) {
				styleSheet.push(...objectCompose(unNested, minify));
			}
		} else {
			styleSheet.push(...objectCompose({ [key]: value }, minify));
		}
	});

	return styleSheet.join(minify ? "" : "\n");
}

function rawCompose(selectorObjectArray: [string, object | string][] = [], tab = "  ") {
	const styleSheet: string[] = [];

	selectorObjectArray.forEach(([key, value]) => {
		if (typeof value === "object") {
			if (Object.keys(value).length) {
				styleSheet.push(
					key,
					"{",
					...rawCompose(Object.entries(value), tab).map((i) => tab + i),
					"}",
				);
			}
		} else if (key[0] === "@") {
			styleSheet.push(key + ";");
		} else {
			styleSheet.push(key + ": " + value + ";");
		}
	});

	return styleSheet;
}

export default {
	forPortable: rawCompose,
	forPublish: stylesheetCreator,
};
