async function dependencyCompromise(arr) {
    const nodeToIndex = Object.create(null);
    let nodeCount = 0;

    // First pass: Map unique nodes to indices
    for (const deps of arr) {
        for (const node of deps) {
            if (!(node in nodeToIndex)) {
                nodeToIndex[node] = nodeCount++;
            }
        }
    }

    // Initialize graph and degree arrays
    const graph = Array.from({ length: nodeCount }, () => []);
    const inDegree = new Uint32Array(nodeCount);
    const outDegree = new Uint32Array(nodeCount);

    // Build the graph
    for (const deps of arr) {
        for (let i = 0; i < deps.length - 1; i++) {
            const from = nodeToIndex[deps[i]];
            const to = nodeToIndex[deps[i + 1]];
            if (from !== to) {
                graph[from].push(to);
                inDegree[to]++;
                outDegree[from]++;
            }
        }
    }

    // Attempt topological sort
    const queue = new Uint32Array(nodeCount);
    let queueHead = 0, queueTail = 0;
    const result = new Uint32Array(nodeCount);
    let resultIdx = 0;

    for (let i = 0; i < nodeCount; i++) {
        if (!inDegree[i]) queue[queueTail++] = i;
    }

    while (queueHead < queueTail) {
        const current = queue[queueHead++];
        result[resultIdx++] = current;
        for (const next of graph[current]) {
            if (!--inDegree[next]) queue[queueTail++] = next;
        }
    }

    // If no cycle, return the result
    if (resultIdx === nodeCount) {
        return Array.from(result, idx => Object.keys(nodeToIndex)[idx]);
    }

    // console.log("Cycle detected, resolving with backtracking dependency prioritization...");

    // Calculate backtracking dependencies for each node in each dependency list
    const backtrackingDeps = Object.create(null);
    for (let row = 0; row < arr.length; row++) {
        const deps = arr[row];
        for (let pos = 0; pos < deps.length; pos++) {
            const node = deps[pos];
            const idx = nodeToIndex[node];
            if (!backtrackingDeps[node]) {
                backtrackingDeps[node] = [];
            }
            // Count backtracking dependencies (nodes before this one in the chain)
            const backDeps = pos; // Number of nodes before this one in the current row
            backtrackingDeps[node].push({ row, pos, count: backDeps });
        }
    }

    // Build a new graph prioritizing nodes with higher backtracking dependencies
    const newGraph = Array.from({ length: nodeCount }, () => []);
    const newInDegree = new Uint32Array(nodeCount);

    for (const deps of arr) {
        for (let i = 0; i < deps.length - 1; i++) {
            const fromNode = deps[i];
            const toNode = deps[i + 1];
            const from = nodeToIndex[fromNode];
            const to = nodeToIndex[toNode];
            if (from === to) continue;

            // Check if this edge should be included based on backtracking priority
            const fromEntries = backtrackingDeps[fromNode] || [];
            const toEntries = backtrackingDeps[toNode] || [];
            let fromMax = Math.max(...fromEntries.map(e => e.count), 0);
            let toMax = Math.max(...toEntries.map(e => e.count), 0);

            // If equal backtracking dependencies, prioritize earlier row
            if (fromMax === toMax) {
                const fromMinRow = Math.min(...fromEntries.map(e => e.row), Infinity);
                const toMinRow = Math.min(...toEntries.map(e => e.row), Infinity);
                if (fromMinRow > toMinRow) continue; // Skip if 'from' appears later
            } else if (fromMax > toMax) {
                continue; // Skip this edge if 'from' has more backtracking deps
            }

            newGraph[from].push(to);
            newInDegree[to]++;
        }
    }

    // Final topological sort with the resolved graph
    const finalQueue = new Uint32Array(nodeCount);
    let finalHead = 0, finalTail = 0;
    const finalResult = new Uint32Array(nodeCount);
    let finalIdx = 0;

    for (let i = 0; i < nodeCount; i++) {
        if (!newInDegree[i]) finalQueue[finalTail++] = i;
    }

    while (finalHead < finalTail) {
        const current = finalQueue[finalHead++];
        finalResult[finalIdx++] = current;
        for (const next of newGraph[current]) {
            if (!--newInDegree[next]) finalQueue[finalTail++] = next;
        }
    }

    // if (finalIdx !== nodeCount) {
    //     throw new Error("Unable to resolve all cycles");
    // }
    const keys = Array.from(finalResult, idx => Object.keys(nodeToIndex)[idx]);
    return keys.reduce((obj, value, index) => { obj[value] = index; return obj; }, {});
}

async function generateAlphabetArrays(combinationLength = 1, subArrays = 20, maxItems = 5) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const result = [];
    let totalItems = 0;

    while (totalItems < subArrays) {
        // Generate all possible combinations of specified length for this subarray
        let availableCombinations = [];

        // Function to generate combinations recursively
        function generateCombinations(current, remainingLength) {
            if (remainingLength === 0) {
                availableCombinations.push(current);
                return;
            }
            for (let i = 0; i < alphabet.length; i++) {
                generateCombinations(current + alphabet[i], remainingLength - 1);
            }
        }

        // Generate initial set of combinations
        generateCombinations('', combinationLength);

        // Max length is min of 5 or remaining items needed
        const maxPossibleLength = Math.min(maxItems, subArrays - totalItems);
        // Random length between 1 and maxPossibleLength
        const subArrayLength = Math.floor(Math.random() * maxPossibleLength) + 1;

        const subArray = [];
        for (let i = 0; i < subArrayLength; i++) {
            // Get random index from available combinations
            const randomIndex = Math.floor(Math.random() * availableCombinations.length);
            // Add combination to subarray and remove it from available combinations
            subArray.push(availableCombinations[randomIndex]);
            availableCombinations.splice(randomIndex, 1);
        }

        result.push(subArray);
        totalItems += subArrayLength;
    }

    return result;
}

const alphabetArrays = await generateAlphabetArrays();
const order = await dependencyCompromise(alphabetArrays)
// console.log(order)
console.log(await dependencyCompromise(alphabetArrays))

// Test the function
const input = [
    ['a', 'g', 'h', 'd'],
    ['a', 'k', 'h', 'g', 'v'],
    ['m', 'n', 'a', 'g', 'v'],
    ['m', 'u', 'a', 'v'],
    ['y', 'k', 'a']
];
console.log(await dependencyCompromise(input));

// --- 

// Output: ['m', 'y', 'n', 'u', 'k', 'a', 'h', 'd', 'g', 'v']

// Implimentation table
// --------------------
// c1  c2  c3  c4  c5  c6  c7 
//         'a' 'g' 'h' 'd'
//         'a' 'k' 'h' 'g' 'v'
// 'm' 'n' 'a'         'g' 'v'
// 'm' 'u' 'a'             'v'
// 'y' 'k' 'a'

// do this method to handle and compromise cycle error and avoiding throwing the error,
// When there's a conflict or cycle, prioritize the instance with higher backtracking dependencies in backtraking-chain. If equal, choose the first occurrence (earlier row).
// In case of cycle error, consider this operation to break the cycle, in c4 g only has 1 dependency, but in c6, g has a total of 5 dependencies in backtraking-chains, hence it should be prioritized to break the cycle, in case of conflict on same number of backtraking dependencies in backtraking-chain, choose first.
// Also refer 'k', where both in c2 and c4, has one backtraking dependency, then choose 'k' of c2 

// handle all the edge cases, and error chances

// Exepct Output: ['m', 'y', 'n', 'u', 'k', 'a', 'h', 'd', 'g', 'v']