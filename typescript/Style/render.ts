/* eslint-disable @typescript-eslint/no-explicit-any */
import * as INDEX from "../data/index.js";
import * as CACHE from "../data/cache.js";
import * as LOADPREFIX from "./prefix.js";

type t_styleSorceTemplate = Record<string, string | object>;

function objectSwitch(srcObject: Record<string, any>): Record<string, any> {
	if (!srcObject || typeof srcObject !== "object") {
		return {};
	}

	const output: Record<string, any> = {};

	for (const outerKey in srcObject) {
		if (Object.prototype.hasOwnProperty.call(srcObject, outerKey) && outerKey[0] !== "+") {
			const innerObject = srcObject[outerKey];
			if (typeof innerObject === "object" && innerObject !== null) {
				for (const innerKey in innerObject) {
					if (Object.prototype.hasOwnProperty.call(innerObject, innerKey)) {
						if (!output[innerKey]) {
							output[innerKey] = {};
						}
						output[innerKey][(innerKey[0] === '@' || innerKey === "") ? outerKey : `& ${outerKey}`] = innerObject[innerKey];
					}
				}
			}
		}
	}

	return output;
}

function styleSwitch(object: Record<string, Record<string, object | string>>) {
	const result: Record<string, object> = {};
	const inits: string[] = [], mins: string[] = [], maxs: string[] = [], flats: string[] = [];

	const switched = objectSwitch(object);
	Object.keys(switched).forEach((key) => {
		const min = key.indexOf("min");
		const max = key.indexOf("max");
		if (key !== "") {
			if (min === -1 && max === -1) { inits.push(key); }
			else if (min < max) { mins.push(key); }
			else if (min > max) { maxs.push(key); }
			else if (min === max) { flats.push(key); }
		}
	});

	inits.forEach(key => result[key] = switched[key]);
	Object.assign(result, switched[""]);
	[...flats.sort(), ...mins.sort().reverse(), ...maxs.sort()].forEach((key) => (result[key] = switched[key]));
	return result;
}

function LoadVendors(collection = {}, vendor = "") {
	return vendor == ""
		? CACHE.ROOT.vendors.filter((ven) =>
			!Object.prototype.hasOwnProperty.call(collection, ven),
		) : [vendor];
}

function stylePartialsArray(object: t_styleSorceTemplate, vendors = LoadVendors()) {
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

// Pending to handle states &:* states.

function unNester(selector = "", object: object = {}, cumulates: object = {}) {
	const siblings: t_styleSorceTemplate = {},
		children: t_styleSorceTemplate = {},
		myself: t_styleSorceTemplate = {};
	const holder: t_styleSorceTemplate = myself[selector] = {};

	Object.entries(object as t_styleSorceTemplate).forEach(([subSelector, subContent]) => {
		if (typeof subContent === "object") {
			if (subSelector[0] === "&") {
				const xelector = selector + subSelector.slice(1);
				if (subSelector[1] === " " || subSelector[1] === ":" || subSelector[1] !== ":") {
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

function _objectCompose(
	object: t_styleSorceTemplate,
	minify = false,
	vendors = LoadVendors(),
	first = true,
) {
	const tab = minify ? "" : "  ",
		space = minify ? "" : " ",
		styleSheet: string[] = [];

	stylePartialsArray(object, vendors).forEach(([key, value]) => {
		if (typeof value === "object") {
			if (Object.keys(value).length) {
				if (!minify && first) { styleSheet.push(""); }
				if (key[0] === "@") {
					const atPrefixes = LOADPREFIX.forAtRule;
					Object.entries(atPrefixes(key, vendors)).forEach(
						([vendor, selector]) => {
							const composedObject = _objectCompose(
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
					const composedObject = _objectCompose(
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




function ComposePrefixed(array: [string, string | object][], minify = !CACHE.STATIC.DEBUG) {
	const styleSheet: string[] = [];

	array.forEach(([key, value]) => {
		if (typeof value === "object") {
			const unNested = unNester(key, value);
			if (Object.keys(unNested).length) {
				styleSheet.push(..._objectCompose(unNested, minify));
			}
		} else {
			styleSheet.push(..._objectCompose({ [key]: value }, minify));
		}
	});

	return styleSheet.join(minify ? "" : "\n");
}


function ComposeArtifact(array: [string, object | string][] = [], tab = "  ") {
	const styleSheet: string[] = [];

	array.forEach(([key, value]) => {
		if (typeof value === "object") {
			if (Object.keys(value).length) {
				styleSheet.push(
					key,
					"{",
					...ComposeArtifact(Object.entries(value), tab).map((i) => tab + i),
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


function ComposeSwitched(selectorIndexObject: Record<string, number>, minify = !CACHE.STATIC.DEBUG) {
	const object = styleSwitch(
		Object.entries(selectorIndexObject).reduce((A: Record<string, Record<string, object>>, [selector, index]) => {
			A[selector] = INDEX.FETCH(index).style_object;
			return A;
		}, {}),
	);
	return ComposePrefixed(Object.entries(object), minify);
}

export default {
	Artifact: ComposeArtifact,
	Prefixed: ComposePrefixed,
	Switched: ComposeSwitched,
};
