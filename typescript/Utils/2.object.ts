type PlainObject<T = unknown> = Record<string, T>;

/**
 * Transposes a nested object structure so inner keys become outer keys.
 *
 * Example:
 * { a: { x: 1, y: 2 }, b: { x: 3 } }
 * => { x: { a: 1, b: 3 }, y: { a: 2 } }
 */
function objectSwitch<T extends PlainObject<PlainObject>>(srcObject: T): PlainObject<PlainObject> {
	if (!srcObject || typeof srcObject !== "object") {
		return {};
	}

	const output: PlainObject<PlainObject> = {};

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
function deepMerge<T extends PlainObject, S extends PlainObject>(target: T, source: S): T & S {
	if (!source || typeof source !== "object") { return target as T & S; }

	for (const key in source) {
		const sourceValue = source[key as keyof S];
		if (sourceValue === undefined) { continue; }

		const targetValue = target[key as keyof T];

		if (
			targetValue &&
			sourceValue &&
			typeof targetValue === "object" &&
			typeof sourceValue === "object" &&
			!Array.isArray(targetValue)
		) {
			target[key as keyof T] = deepMerge(
				targetValue as PlainObject,
				sourceValue as PlainObject
			) as any;
		} else {
			target[key] = sourceValue as (T & S)[typeof key];
		}
	}

	return target as T & S;
}

/**
 * Merges multiple objects with optional aggressive or array concatenation modes.
 */
function bulkMerge<T extends PlainObject>(
	objectArray: T[] = [],
	aggressive = false,
	arrayMerge = false
): PlainObject {
	if (!Array.isArray(objectArray) || objectArray.length === 0) {
		return {};
	}

	function innerMerge(target: PlainObject, source: PlainObject): PlainObject {
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
						innerMerge(tgtVal as PlainObject, srcVal as PlainObject);
					} else {
						target[key] = { ...(srcVal as PlainObject) };
					}
				} else if (
					Array.isArray(srcVal) &&
					Array.isArray(tgtVal) &&
					arrayMerge
				) {
					(tgtVal as unknown[]).push(...srcVal);
				} else if (aggressive || !(key in target)) {
					target[key] = srcVal;
				}
			}
		}
		return target;
	}

	return objectArray.reduce(
		(result, obj) => innerMerge(structuredClone(result), obj),
		{} as PlainObject
	);
}

/**
 * Creates an object retaining only the structure of the input, with
 * nested objects preserved as empty shells.
 */
function skeleton<T extends PlainObject>(object: T = {} as T): PlainObject {
	return Object.entries(object).reduce<PlainObject>((result, [k, o]) => {
		if (typeof o === "object" && o !== null) {
			result[k] = skeleton(o as PlainObject);
		}
		return result;
	}, {});
}

/**
 * Computes the delta from object A to object B.
 */
function ObjectDelta<T extends PlainObject>(
	A: T = {} as T,
	B: T = {} as T
): { result: Partial<T>; score: number } {
	let score = 0;
	const result: Partial<T> = {};

	Object.entries(B).forEach(([Bkey, Bvalue]) => {
		if (typeof Bvalue === "string" || typeof Bvalue === "number" || typeof Bvalue === "boolean" || Bvalue === null) {
			if (A[Bkey] !== Bvalue) {
				score++;
				result[Bkey as keyof T] = Bvalue as T[keyof T];
			}
		} else if (typeof Bvalue === "object" && Bvalue !== null) {
			if (typeof A[Bkey] === "object" && A[Bkey] !== null) {
				const subobj = ObjectDelta(
					A[Bkey] as PlainObject,
					Bvalue as PlainObject
				);
				if (subobj.score) {
					result[Bkey as keyof T] = subobj.result as T[keyof T];
				}
				score += subobj.score;
			} else {
				result[Bkey as keyof T] = Bvalue as T[keyof T];
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
