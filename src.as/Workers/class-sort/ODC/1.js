import H from "../0.help.js"

const expressions = {
    identity: x => x,                    // f(x) = x (linear, slope 1)
    doublePlusOne: x => 2 * x + 1,       // f(x) = 2x + 1 (linear, slope 2)
    square: x => (x >= 0 ? x * x : 0),   // f(x) = x^2 for x >= 0 (increasing, adjusted)
    cube: x => x * x * x,                // f(x) = x^3 (strictly increasing for all x)
    exponential: x => Math.exp(x),       // f(x) = e^x (strictly increasing)
    powerOfTwo: x => Math.pow(2, x),     // f(x) = 2^x (strictly increasing)
    linear: x => 3 * x + 2,              // f(x) = 3x + 2 (linear, slope 3)
    cubicPlusX: x => x * x * x + x,      // f(x) = x^3 + x (strictly increasing, f'(x) = 3x^2 + 1 > 0)
    expPlusLinear: x => Math.exp(x) + x  // f(x) = e^x + x (strictly increasing, f'(x) = e^x + 1 > 0)
}

function applyDistributionToArray(array, A = 0, B = 0, expression = () => 1) {
    // Validate inputs
    const V = array.length;
    if (V === 0 || array.some(subArr => subArr.length !== array[0].length)) {
        throw new Error("Input array must be non-empty and all subarrays must have the same length");
    }

    // Derive N from the length of subarrays
    const N = array[0].length;

    // Handle special case: N = 1
    if (N === 1) {
        const exprA = expression(A);
        return array.map(subArr => subArr[0] * exprA);
    }

    // Precompute the distribution values
    const step = (B - A) / (N - 1);
    const distribution = new Array(N);
    for (let j = 0; j < N; j++) {
        const x = A + j * step;
        distribution[j] = expression(x);
    }

    // Compute result for each subarray using precomputed distribution
    const result = new Array(V);
    for (let i = 0; i < V; i++) {
        let sum = 0;
        for (let j = 0; j < N; j++) {
            sum += array[i][j] * distribution[j];
        }
        result[i] = sum;
    }

    return result;
}
// // Test the function
// const matrix = [
//     [1, 2, 3],
//     [4, 5, 6],
//     [7, 8, 9]
// ];
// const A = 0;
// const B = 2;
// const expression = x => x * x; // Example: x^2

// const result = applyDistributionToArray(matrix, A, B, expression);
// console.log("Input Matrix:");
// matrix.forEach(row => console.log(row));
// console.log("A:", A, "B:", B);
// console.log("Derived N:", matrix[0].length);
// console.log("Expression: x => x * x");
// console.log("Result:", result);

// // Test with a more complex expression
// const complexExpr = x => x*x;
// const resultComplex = applyDistributionToArray(matrix, A, B, complexExpr);
// console.log("\nComplex Expression: x => Math.sin(x) + Math.exp(x)");
// console.log("Result:", resultComplex);


function createAdjacencyMatrix(sequences, weighted) {
    // Step 1: Initialize data structures
    const nodeSet = new Set();       // Unique nodes
    const nodePairs = [];            // Array to preserve all pairs, including duplicates

    // Step 2: Collect nodes and pairs in one pass
    for (const seq of sequences) {
        if (seq.length < 2) continue; // Skip sequences with fewer than 2 elements
        for (let i = 0; i < seq.length - 1; i++) {
            const from = seq[i];
            nodeSet.add(from);
            for (let j = i + 1; j < seq.length; j++) {
                const to = seq[j];
                nodeSet.add(to);
                nodePairs.push([from, to]); // Add every pair, preserving duplicates
            }
        }
    }

    // Step 3: Create node array and mapping
    const nodes = Array.from(nodeSet).sort((a, b) => a - b);
    const V = nodes.length;
    const nodeToIndex = new Map(nodes.map((node, idx) => [node, idx]));

    // Step 4: Initialize matrix
    const matrix = Array.from({ length: V }, () => Array(V).fill(0));

    // Step 5: Populate matrix from sequences directly
    for (const seq of sequences) {
        if (seq.length < 2) continue;
        for (let i = 0; i < seq.length - 1; i++) {
            const u = nodeToIndex.get(seq[i]);
            for (let j = i + 1; j < seq.length; j++) {
                const v = nodeToIndex.get(seq[j]);
                matrix[u][v] = weighted ? matrix[u][v] + 1 : 1;
                // Increment weight
            }
        }
    }

    return { matrix, nodes, nodePairs };
}
// // Test the function
// const sequences = [
//     [1, 2, 3],   // Pairs: [1,2], [1,3], [2,3]
//     [1, 5, 3],   // Pairs: [1,5], [1,3], [5,3]
//     [7, 8],      // Pairs: [7,8]
//     [7, 9, 1]    // Pairs: [7,9], [7,1], [9,1]
// ];

// const { matrix, nodes, nodePairs } = createWeightedAdjacencyMatrix(sequences);

// // Display results
// console.log("Nodes:", nodes);
// console.log("Node Pairs (with duplicates):", nodePairs);
// console.log("Weighted Adjacency Matrix:");
// console.log("   " + nodes.map(n => String(n).padStart(2, ' ')).join(' '));
// nodes.forEach((node, i) => {
//     console.log(String(node).padStart(2, ' ') + " " + matrix[i].map(val => String(val).padStart(2, ' ')).join(' '));
// });


function benchmarkSequence(sequence = [], pairs) {
    // Precompute first occurrence of each element
    const firstIndex = new Map();
    for (let i = 0; i < sequence.length; i++) {
        if (!firstIndex.has(sequence[i])) {
            firstIndex.set(sequence[i], i);
        }
    }

    // Count pairs where A appears before B
    let count = 0;
    for (const [A, B] of pairs) {
        const indexA = firstIndex.get(A) ?? 0; // Default to end if not found
        const indexB = firstIndex.get(B) ?? 0;
        if (indexA < indexB) count++;
    }
    return count / pairs.length;
}
// Test cases
// const sequence = [1, 5, 3, 2];
// const pairs = [[1, 5], [5, 3], [3, 2], [2, 1], [1, 6]];

// const originalScore = (function (sequence, pairs) {
//     let count = 0;
//     for (const [A, B] of pairs) {
//         if (sequence.indexOf(A) < sequence.indexOf(B)) count++;
//     }
//     return count / pairs.length;
// })(sequence, pairs);

// const optimizedScore = benchmarkSequence(sequence, pairs);

// console.log("Sequence:", sequence);
// console.log("Pairs:", pairs);
// console.log("Original Score:", originalScore);
// console.log("Optimized Score:", optimizedScore);
function transpose2DArray(array2D) {
    // Validate input
    if (!Array.isArray(array2D) || array2D.length === 0 || !Array.isArray(array2D[0])) {
        throw new Error("Input must be a non-empty 2D array");
    }
    const rows = array2D.length;
    const cols = array2D[0].length;
    if (array2D.some(row => !Array.isArray(row) || row.length !== cols)) {
        throw new Error("All rows must be arrays of the same length");
    }

    // Create transposed array: cols × rows
    const transposed = Array.from({ length: cols }, () => new Array(rows));

    // Fill transposed array
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            transposed[j][i] = array2D[i][j];
        }
    }

    return transposed;
}

export default function optimalOrder(sequences, weighted = true, A = 0, B = 0, expression = () => 1) {
    const { matrix, nodes, nodePairs } = createAdjacencyMatrix(sequences, weighted);
    const matrixT = transpose2DArray(matrix)
    const DModulus = applyDistributionToArray(matrixT)

    const matrixM = H.sortByReference(matrixT, DModulus, true)
    const matrixMT = transpose2DArray(matrixM)

    const DRefer = applyDistributionToArray(matrixMT, A, B, expression)
    const result = H.sortByReference(nodes, DRefer, false)
    const score = benchmarkSequence(result, Array.from(nodePairs))

    // console.table(matrix)
    // console.table(matrixT)
    // console.log(DModulus)
    // console.table(matrixM)
    // console.table(matrixMT)
    // console.log(DRefer)
    // console.log(result)
    // console.log(score)
    // console.log(nodePairs)

    return { result, score }

}