
function switchColumnsToRows(array) {
    if (!array || array.length === 0) return [];

    const numRows = array.length;
    const numCols = Math.max(...array.map(row => row.length));
    const switchedArray = new Array(numCols);

    // Pre-allocate rows with single assignment
    for (let j = 0; j < numCols; j++) {
        switchedArray[j] = new Array(numRows);
    }

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            switchedArray[j][i] = array[i][j] !== undefined ? array[i][j] : 0;
        }
    }

    return switchedArray;
}

function watchClassGroup(arr1, arr2) {
    const mergedSet = Array.from(new Set([...arr1, ...arr2]));
    const positions = {};

    mergedSet.forEach(element => {
        if (arr2.includes(element)) {
            const occurrences = arr2.map((value, index) =>
                (value === element ? index : -1))
                .filter(index => index !== -1);
            positions[element] = occurrences;
        }
    });

    return { mergedSet, positions };
}

function createCycleBreakRule(array) {
    if (!Array.isArray(array) || array.length === 0) return {};
    const arrayx = switchColumnsToRows(array);
    if (arrayx.length === 0) return {};
    const dependents = new Uint32Array(array.length);
    const result = new Map();
    let set = [];
    for (let index1 = 0; index1 < arrayx.length; index1++) {
        const arr = arrayx[index1];
        let response;
        try {
            response = watchClassGroup(set, arr);
        } catch (e) {
            console.error(`Error in superImposition at column ${index1}: ${e.message}`);
            continue;
        }
        set = response.mergedSet;
        for (let index2 = 0; index2 < arr.length; index2++) {
            const key = arr[index2];
            if (key === 0 || key === null || key === undefined) continue;
            if (!result.has(key)) {
                result.set(key, { "#": 0, "$": 0 });
            }
            const entry = result.get(key);
            const pos = response.positions[key] || [];
            const score = pos.length > 0
                ? pos.reduce((sum, v) => sum + dependents[v], 0)
                : 0;
            if (score > entry["$"]) {
                entry["#"] = index1;
                entry["$"] = score;
            }
        }
        for (let index2 = 0; index2 < arr.length; index2++) {
            if (arr[index2] !== 0 && arr[index2] !== null && arr[index2] !== undefined) {
                if (dependents[index2] === 4294967295) {
                    console.warn(`Dependents overflow at row ${index2}`);
                } else {
                    dependents[index2]++;
                }
            }
        }
    }
    return Object.fromEntries(result);
}

// export default function createCycleBreakRule(array) {
//     let result = {}, set = [];
//     const arrayx = switchColumnsToRows(array);
//     const dependents = Array(array.length).fill(0);
//     arrayx.forEach((arr, index1) => {


//         const response = watchClassGroup(set, arr)
//         set = response.mergedSet

//         arr.forEach(key => {
//             if (key !== 0) {
//                 if (!result[key]) {
//                     result[key] = { "#": 0, "$": 0 };
//                 }
//                 const score = response.positions[key].reduce((A, V) => A + dependents[V], 0);
//                 if (score > result[key]["$"]) {
//                     result[key]["#"] = index1;
//                     result[key]["$"] = score;
//                 }
//             } 
//         });

//         arr.forEach((key, index2) => {
//             if (key !== 0) dependents[index2]++;
//         });
//     })
//     return result;
// }
// Test Functions
// function testSwitchColumnsToRows() {
//     const input = [
//         [0, 0, 1, 2, 3, 4, 0],
//         [0, 0, 1, 5, 3, 2, 6],
//         [7, 8, 1, 0, 0, 2, 6]
//     ];
//     const result = switchColumnsToRows(input);
//     console.log("Test 1 - Switch Columns to Rows:");
//     result.forEach(row => console.log(row.map(cell => cell.toString().padEnd(2)).join(' ')));
//     console.log("---");
// }

// function testSuperImposition() {
//     const arr1 = [1, 2, 3, 4];
//     const arr2 = [3, 4, 3, 6];
//     const result = watchClassGroup(arr1, arr2);
//     console.log("Test 2 - SuperImposition:");
//     console.log(result);
//     console.log("---");
// }

// function testCreateCycleBreakRule() {
//     const input = [
//         [0, 0, 1, 2, 3, 4, 0],
//         [0, 0, 1, 5, 3, 2, 6],
//         [7, 8, 1, 0, 0, 2, 6],
//         [7, 9, 1, 0, 0, 0, 6],
//         [10, 5, 1, 0, 0, 0, 0]
//     ];
//     console.log("Test 3 - Original Cycle Break Rule:");
//     console.log(createCycleBreakRule(input));
//     console.log("---");
// }

// function testComplexCycleBreakRule() {
//     const input = [
//         [0, 1, 2, 3, 4, 5, 0],
//         [6, 1, 7, 2, 8, 3, 9],
//         [0, 10, 2, 1, 4, 11, 12],
//         [13, 14, 1, 15, 2, 0, 0]
//     ];
//     console.log("Test 4 - Complex Cycle Break Rule:");
//     console.log(createCycleBreakRule(input));
//     console.log("---");
// }

// // Run all tests
// testSwitchColumnsToRows();
// testSuperImposition();
// testCreateCycleBreakRule();
// testComplexCycleBreakRule();
