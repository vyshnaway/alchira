function mergeObjects(objectArray, aggressive = false, arrayMerge = false) {
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
                else {
                    if (aggressive || !(key in target)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    }

    // Merge all objects into a single result object
    const result = {};
    objectArray.forEach(obj => deepMerge(result, obj));
    return result;
}

function booleanOnObject(objectA, objectB, onlyA = true, intersect = true, onlyB = true, notA = true, notB = true) {
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

export default {
    merge: mergeObjects,
    extract: booleanOnObject
}

// // Test function
// function testBooleanOnObject() {
//     // Test case 1: Simple objects
//     const test1A = { a: 1, b: { c: 2 } };
//     const test1B = { b: { c: 2 }, d: 3 };
//     console.log("Test 1 - Simple objects:");
//     console.log(booleanOnObject(test1A, test1B));

//     // Test case 2: Arrays
//     const test2A = [{ x: 1 }, { y: 2 }];
//     const test2B = [{ x: 1 }, { z: 3 }];
//     console.log("\nTest 2 - Arrays:");
//     console.log(booleanOnObject(test2A, test2B));

//     // Test case 3: Deep nested objects
//     const test3A = {
//         level1: {
//             level2: {
//                 a: 1,
//                 b: 2
//             },
//             c: 3
//         }
//     };
//     const test3B = {
//         level1: {
//             level2: {
//                 b: 2,
//                 d: 4
//             }
//         }
//     };
//     console.log("\nTest 3 - Deep nested:");
//     console.log(booleanOnObject(test3A, test3B));

//     // Test case 4: Selective operations
//     console.log("\nTest 4 - Selective operations:");
//     console.log(booleanOnObject(test1A, test1B, true, false, false, false, false));
// }

// // Run the tests
// testBooleanOnObject();


// // Test function
// function testMergeObjects() {
//     const testData = [
//         {
//             name: "John",
//             details: {
//                 hobbies: ["reading", "gaming"],
//                 scores: [90, 85]
//             },
//             tags: ["user", "active"]
//         },
//         {
//             name: "Johnny",
//             details: {
//                 hobbies: ["swimming"],
//                 scores: [95]
//             },
//             tags: ["member"]
//         }
//     ];

//     console.log("Test 1: Default behavior (no array merge, non-aggressive)");
//     console.log(JSON.stringify(mergeObjects(testData), null, 2));
//     // Expected: keeps first arrays, only adds new properties

//     console.log("\nTest 2: Aggressive merge, no array merge");
//     console.log(JSON.stringify(mergeObjects(testData, true), null, 2));
//     // Expected: replaces arrays completely with last value

//     console.log("\nTest 3: Array merge enabled, non-aggressive");
//     console.log(JSON.stringify(mergeObjects(testData, false, true), null, 2));
//     // Expected: concatenates arrays, keeps first values for conflicts

//     console.log("\nTest 4: Array merge enabled, aggressive");
//     console.log(JSON.stringify(mergeObjects(testData, true, true), null, 2));
//     // Expected: concatenates arrays, uses last values for conflicts

//     // Additional edge case
//     const edgeCase = [
//         {
//             mixed: [1, 2, { a: 1 }],
//             nested: { arr: [1, 2] }
//         },
//         {
//             mixed: [3, { b: 2 }],
//             nested: { arr: [3] }
//         }
//     ];

//     console.log("\nTest 5: Edge case with array merge");
//     console.log(JSON.stringify(mergeObjects(edgeCase, false, true), null, 2));
// }

// // Run the tests
// testMergeObjects();