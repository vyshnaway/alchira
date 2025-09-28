/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Merges multiple objects with optional aggressive or array concatenation modes.
 */
function innerMerge(
	target: Record<string, any>,
	source: Record<string, any>,
	aggressive = false,
	arrayMerge = false
): Record<string, any> {
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

function bulkMerge(
	objectArray: Record<string, any>[] = [],
	aggressive = false,
	arrayMerge = false,
): Record<string, any> {
	if (!Array.isArray(objectArray) || objectArray.length === 0) {
		return {};
	}

	return objectArray.reduce(
		(result, obj) => innerMerge(structuredClone(result), obj, aggressive, arrayMerge),
		{}
	);
}

/**
 * Creates an object retaining only the structure of the input, with
 * nested objects preserved as empty shells.
 */
function skeleton(object: Record<string, any> = {}): Record<string, any> {
	return Object.entries(object).reduce((result, [k, v]) => {
		if (typeof v === "object") {
			result[k] = skeleton(v);
		} else if (k.startsWith("--") && typeof v === "string") {
			result[k] = v;
		}
		return result;
	}, {} as Record<string, any>);
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

const utils: {
	skeleton: typeof skeleton;
	onlyB: typeof ObjectDelta;
	multiMerge: typeof bulkMerge;
} = {
	skeleton,
	onlyB: ObjectDelta,
	multiMerge: bulkMerge,
};

export default utils;