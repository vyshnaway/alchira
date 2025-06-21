function objectSwitch(srcObject) {
	if (!srcObject || typeof srcObject !== "object") {
		return {};
	}

	const output = {};

	for (const outerKey in srcObject) {
		if (srcObject.hasOwnProperty(outerKey) && outerKey[0] !== "+") {
			const innerObject = srcObject[outerKey];

			if (typeof innerObject === "object" && innerObject !== null) {
				for (const innerKey in innerObject) {
					if (innerObject.hasOwnProperty(innerKey)) {
						output[innerKey] = output[innerKey] || {};
						output[innerKey][outerKey] = innerObject[innerKey];
					}
				}
			}
		}
	}

	return output;
}

function deepMerge(target, source) {
	if (!source || typeof source !== "object") return target;

	for (const key in source) {
		const sourceValue = source[key];
		if (sourceValue === undefined) continue;

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

function bulkMerge(objectArray = [], aggressive = false, arrayMerge = false) {
	// Input validation: return empty object if input is invalid or empty
	if (!objectArray || !Array.isArray(objectArray) || objectArray.length === 0) {
		return {};
	}

	// Helper function to merge source into target in place
	function deepMerge(target, source) {
		for (const key in source) {
			if (source.hasOwnProperty(key)) {
				// Handle nested objects (non-arrays)
				if (
					typeof source[key] === "object" &&
					source[key] !== null &&
					!Array.isArray(source[key])
				) {
					if (
						typeof target[key] === "object" &&
						target[key] !== null &&
						!Array.isArray(target[key])
					) {
						// Recursively merge into existing object
						deepMerge(target[key], source[key]);
					} else {
						// Create a shallow copy if target[key] isn’t an object
						target[key] = { ...source[key] };
					}
				}
				// Handle arrays when arrayMerge is true
				else if (
					Array.isArray(source[key]) &&
					Array.isArray(target[key]) &&
					arrayMerge
				) {
					// Append elements to existing array
					target[key].push(...source[key]);
				}
				// Handle primitives and arrays when arrayMerge is false
				else if (aggressive || !(key in target)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	}

	return objectArray.reduce(
		(result, obj) => deepMerge(structuredClone(result), obj),
		{},
	);
}

function skeleton(object = {}) {
	return Object.entries(object).reduce((result, [k, o]) => {
		if (typeof o === "object") result[k] = skeleton(o);
		return result;
	}, {})
}

function ObjectDelta(A = {}, B = {}) {
	let score = 0,
		result = {};
	Object.entries(B).forEach(([Bkey, Bvalue]) => {
		switch (typeof Bvalue) {
			case "string":
				if (A[Bkey] !== Bvalue) {
					score++;
					result[Bkey] = Bvalue;
				}
				break;
			case "object":
				if (typeof A[Bkey] === "object") {
					const subobj = ObjectDelta(A[Bkey], Bvalue);
					if (subobj.score)
						result[Bkey] = subobj.result;
					score += subobj.score;
				} else result[Bkey] = Bvalue;
				break;
		}
	});
	return { result, score };
}

export default {
	skeleton,
	onlyB: ObjectDelta,
	switch: objectSwitch,
	deepMerge: deepMerge,
	multiMerge: bulkMerge,
};
