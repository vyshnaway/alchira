function objectSwitch(srcObject) {
    if (!srcObject || typeof srcObject !== 'object') {
        return {};
    }

    const output = {};

    for (const outerKey in srcObject) {
        if (srcObject.hasOwnProperty(outerKey) && outerKey[0] !== '+') {
            const innerObject = srcObject[outerKey];

            if (typeof innerObject === 'object' && innerObject !== null) {
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
    if (!source || typeof source !== 'object') return target;

    for (const key in source) {
        const sourceValue = source[key];
        if (sourceValue === undefined) continue;

        const targetValue = target[key];

        if (targetValue &&
            sourceValue &&
            typeof targetValue === 'object' &&
            typeof sourceValue === 'object' &&
            !Array.isArray(targetValue)) {
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
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    if (typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
                        // Recursively merge into existing object
                        deepMerge(target[key], source[key]);
                    } else {
                        // Create a shallow copy if target[key] isn’t an object
                        target[key] = { ...source[key] };
                    }
                }
                // Handle arrays when arrayMerge is true
                else if (Array.isArray(source[key]) && Array.isArray(target[key]) && arrayMerge) {
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

    // Merge all objects into a single result object
    return objectArray.reduce((result, obj) => deepMerge(structuredClone(result), obj), {});
}

function objectBoolean(objectA, objectB, onlyA = true, intersect = true, onlyB = true, notA = true, notB = true) {
    // Result object to store all boolean operations
    const result = {};

    // Helper function to deep compare two values
    function deepCompare(valA, valB) {
        if (valA === valB) return true;
        if (typeof valA !== 'object' || typeof valB !== 'object' || valA === null || valB === null) return false;

        const keysA = Object.keys(valA);
        const keysB = Object.keys(valB);
        if (keysA.length !== keysB.length) return false;

        return keysA.every(key => deepCompare(valA[key], valB[key]));
    }

    // Helper function to get all paths in an object
    function getAllPaths(obj, currentPath = '') {
        let paths = [];
        for (const key in obj) {
            const newPath = currentPath ? `${currentPath}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                paths = paths.concat(getAllPaths(obj[key], newPath));
            } else {
                paths.push(newPath);
            }
        }
        return paths;
    }

    // Convert arrays to objects with numeric keys for consistent processing
    function normalizeInput(obj) {
        if (Array.isArray(obj)) {
            return Object.fromEntries(obj.map((item, index) => [index, item]));
        }
        return obj;
    }

    const normalizedA = normalizeInput(objectA);
    const normalizedB = normalizeInput(objectB);
    const pathsA = getAllPaths(normalizedA);
    const pathsB = getAllPaths(normalizedB);

    // Only in A (A - B)
    if (onlyA) {
        result.onlyA = {};
        pathsA.forEach(path => {
            if (!pathsB.includes(path)) {
                const value = path.split('.').reduce((acc, key) => acc[key], normalizedA);
                setNestedValue(result.onlyA, path, value);
            }
        });
    }

    // Intersection (A ∩ B)
    if (intersect) {
        result.intersect = {};
        pathsA.forEach(path => {
            if (pathsB.includes(path)) {
                const valA = path.split('.').reduce((acc, key) => acc[key], normalizedA);
                const valB = path.split('.').reduce((acc, key) => acc[key], normalizedB);
                if (deepCompare(valA, valB)) {
                    setNestedValue(result.intersect, path, valA);
                }
            }
        });
    }

    // Only in B (B - A)
    if (onlyB) {
        result.onlyB = {};
        pathsB.forEach(path => {
            if (!pathsA.includes(path)) {
                const value = path.split('.').reduce((acc, key) => acc[key], normalizedB);
                setNestedValue(result.onlyB, path, value);
            }
        });
    }

    // Not in A (complement of A with respect to both)
    if (notA) {
        result.notA = {};
        pathsB.forEach(path => {
            if (!pathsA.includes(path)) {
                const value = path.split('.').reduce((acc, key) => acc[key], normalizedB);
                setNestedValue(result.notA, path, value);
            }
        });
    }

    // Not in B (complement of B with respect to both)
    if (notB) {
        result.notB = {};
        pathsA.forEach(path => {
            if (!pathsB.includes(path)) {
                const value = path.split('.').reduce((acc, key) => acc[key], normalizedA);
                setNestedValue(result.notB, path, value);
            }
        });
    }

    // Helper function to set nested value
    function setNestedValue(obj, path, value) {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            current[parts[i]] = current[parts[i]] || {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
    }

    return result;
}

function BminusA(A = {}, B = {}) {
    let score = 0, result = {};
    Object.entries(B).forEach(([Bkey, Bvalue]) => {
        switch (typeof Bvalue) {
            case "string":
                score++
                result[Bkey] = Bvalue
                break;
            case "object":
                if (typeof A[Bkey] === "object") {
                    const subobj = BminusA(A[Bkey], Bvalue);
                    result[Bkey] = subobj.result;
                    score += subobj.score;
                } else result[Bkey] = Bvalue
                break;
        }
    });
    return { result, score }
}

// console.log(BminusA({
//     a: "b",
//     b: "c",
//     d: {
//         a: "b",
//         b: "c"
//     }
// }, {
//     a: "a",
//     d: "c",
//     d: {
//         b: "h"
//     }
// }))

export default {
    onlyB: BminusA,
    switch: objectSwitch,
    extract: objectBoolean,
    deepMerge: deepMerge,
    multiMerge: bulkMerge,
}
