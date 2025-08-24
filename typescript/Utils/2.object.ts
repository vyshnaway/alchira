/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Transposes a nested object structure so inner keys become outer keys.
 *
 * Example:
 * { a: { x: 1, y: 2 }, b: { x: 3 } }
 * => { x: { a: 1, b: 3 }, y: { a: 2 } }
 */
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
						output[innerKey][outerKey] = innerObject[innerKey];
					}
				}
			}
		}
	}

	return output;
}

/**
 * Deep merges `source` into `target` (recursively for plain objects).
 */
function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
	if (!source || typeof source !== "object") { return target; }
	
	for (const key in source) {
		const sourceValue = source[key];
		if (sourceValue === undefined) { continue; }

		const targetValue = target[key];

		if (
			targetValue &&
			sourceValue &&
			typeof targetValue === "object" &&
			typeof sourceValue === "object" &&
			!Array.isArray(targetValue)
		) {
			target[key] = deepMerge(targetValue, sourceValue);
		} else {
			target[key] = sourceValue;
		}
	}

	return target;
}

/**
 * Merges multiple objects with optional aggressive or array concatenation modes.
 */
function bulkMerge(
	objectArray: Record<string, any>[] = [],
	aggressive = false,
	arrayMerge = false
): Record<string, any> {
	if (!Array.isArray(objectArray) || objectArray.length === 0) {
		return {};
	}

	function innerMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
		for (const key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				const srcVal = source[key];
				const tgtVal = target[key];

				if (
					typeof srcVal === "object" &&
					srcVal !== null &&
					!Array.isArray(srcVal)
				) {
					if (
						typeof tgtVal === "object" &&
						tgtVal !== null &&
						!Array.isArray(tgtVal)
					) {
						innerMerge(tgtVal, srcVal);
					} else {
						target[key] = { ...srcVal };
					}
				} else if (
					Array.isArray(srcVal) &&
					Array.isArray(tgtVal) &&
					arrayMerge
				) {
					tgtVal.push(...srcVal);
				} else if (aggressive || !(key in target)) {
					target[key] = srcVal;
				}
			}
		}
		return target;
	}

	return objectArray.reduce(
		(result, obj) => innerMerge(structuredClone(result), obj),
		{}
	);
}

/**
 * Creates an object retaining only the structure of the input, with
 * nested objects preserved as empty shells.
 */
function skeleton(object: Record<string, any> = {}): Record<string, any> {
	return Object.entries(object).reduce<Record<string, any>>((result, [k, o]) => {
		if (typeof o === "object" && o !== null) {
			result[k] = skeleton(o);
		}
		return result;
	}, {});
}

/**
 * Computes the delta from object A to object B.
 */
function ObjectDelta(
	A: Record<string, any> = {},
	B: Record<string, any> = {}
): { result: Partial<Record<string, any>>; score: number } {
	let score = 0;
	const result: Partial<Record<string, any>> = {};

	Object.entries(B).forEach(([Bkey, Bvalue]) => {
		if (typeof Bvalue === "string" || typeof Bvalue === "number" || typeof Bvalue === "boolean" || Bvalue === null) {
			if (A[Bkey] !== Bvalue) {
				score++;
				result[Bkey] = Bvalue;
			}
		} else if (typeof Bvalue === "object" && Bvalue !== null) {
			if (typeof A[Bkey] === "object" && A[Bkey] !== null) {
				const subobj = ObjectDelta(
					A[Bkey],
					Bvalue
				);
				if (subobj.score) {
					result[Bkey] = subobj.result;
				}
				score += subobj.score;
			} else {
				result[Bkey] = Bvalue;
			}
		}
	});

	return { result, score };
}

export interface ObjectUtils {
	skeleton: typeof skeleton;
	onlyB: typeof ObjectDelta;
	switch: typeof objectSwitch;
	deepMerge: typeof deepMerge;
	multiMerge: typeof bulkMerge;
}

const utils: ObjectUtils = {
	skeleton,
	deepMerge,
	onlyB: ObjectDelta,
	switch: objectSwitch,
	multiMerge: bulkMerge,
};

export default utils;