function optimalDependencyCompromise(arr) {
    const nodeToIndex = Object.create(null);
    let nodeCount = 0;

    // Map unique nodes to indices
    for (const deps of arr) {
        for (const node of deps) {
            if (!(node in nodeToIndex)) {
                nodeToIndex[node] = nodeCount++;
            }
        }
    }

    // Build initial graph 
    const graph = Array.from({ length: nodeCount }, () => new Set());
    const inDegree = new Uint32Array(nodeCount);

    for (const deps of arr) {
        for (let i = 0; i < deps.length - 1; i++) {
            const from = nodeToIndex[deps[i]];
            const to = nodeToIndex[deps[i + 1]];
            if (from !== to && !graph[from].has(to)) {
                graph[from].add(to);
                inDegree[to]++;
            }
        }
    }

    // Store dependency info (row, pos, backtracking count)
    const depInfo = Object.create(null);
    for (let row = 0; row < arr.length; row++) {
        const deps = arr[row];
        for (let pos = 0; pos < deps.length; pos++) {
            const node = deps[pos];
            if (!depInfo[node]) depInfo[node] = [];
            depInfo[node].push({ row, pos, backCount: pos });
        }
    }

    // Try topological sort
    const queue = [];
    for (let i = 0; i < nodeCount; i++) {
        if (inDegree[i] === 0) queue.push(i);
    }

    const result = [];
    const visited = new Set();

    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        result.push(current);

        for (const next of graph[current]) {
            inDegree[next]--;
            if (inDegree[next] === 0) queue.push(next);
        }
    }

    if (result.length === nodeCount) {
        return Array.from(result, idx => Object.keys(nodeToIndex)[idx]);
    }

    // Resolve cycles with backtracking priority
    const newGraph = Array.from({ length: nodeCount }, () => new Set());
    const newInDegree = new Uint32Array(nodeCount);

    for (const deps of arr) {
        for (let i = 0; i < deps.length - 1; i++) {
            const fromNode = deps[i];
            const toNode = deps[i + 1];
            const from = nodeToIndex[fromNode];
            const to = nodeToIndex[toNode];
            if (from === to) continue;

            const fromInfo = depInfo[fromNode];
            const toInfo = depInfo[toNode];

            // Max backtracking dependencies
            const fromMaxBack = Math.max(...fromInfo.map(e => e.backCount), 0);
            const toMaxBack = Math.max(...toInfo.map(e => e.backCount), 0);

            // Earliest row if backtracking is equal
            const fromEarliestRow = Math.min(...fromInfo.map(e => e.row));
            const toEarliestRow = Math.min(...toInfo.map(e => e.row));

            // Add edge unless it violates backtracking priority
            if (fromMaxBack > toMaxBack) continue; // Skip if 'from' has more backdeps
            if (fromMaxBack === toMaxBack && fromEarliestRow > toEarliestRow) continue; // Skip if equal backdeps but 'to' is earlier

            if (!newGraph[to].has(from)) { // Prevent reverse edges
                newGraph[from].add(to);
                newInDegree[to]++;
            }
        }
    }

    // Final topological sort with priority queue
    const finalQueue = [];
    const finalResult = [];
    const finalVisited = new Set();

    // Initialize queue with nodes having no incoming edges
    const nodes = Object.keys(nodeToIndex).map(node => ({
        node,
        idx: nodeToIndex[node],
        backCount: Math.max(...depInfo[node].map(e => e.backCount), 0),
        row: Math.min(...depInfo[node].map(e => e.row))
    }));
    nodes.sort((a, b) => a.row - b.row || a.backCount - b.backCount);

    for (const { idx } of nodes) {
        if (newInDegree[idx] === 0) finalQueue.push(idx);
    }

    while (finalQueue.length > 0) {
        const current = finalQueue.shift();
        if (finalVisited.has(current)) continue;
        finalVisited.add(current);
        finalResult.push(current);

        const nextNodes = Array.from(newGraph[current]);
        for (const next of nextNodes) {
            newInDegree[next]--;
            if (newInDegree[next] === 0) {
                finalQueue.push(next);
            }
        }

        // Sort queue by earliest row and lowest backCount
        finalQueue.sort((a, b) => {
            const aNode = Object.keys(nodeToIndex)[a];
            const bNode = Object.keys(nodeToIndex)[b];
            const aRow = Math.min(...depInfo[aNode].map(e => e.row));
            const bRow = Math.min(...depInfo[bNode].map(e => e.row));
            const aBack = Math.max(...depInfo[aNode].map(e => e.backCount), 0);
            const bBack = Math.max(...depInfo[bNode].map(e => e.backCount), 0);
            return aRow - bRow || aBack - bBack;
        });
    }

    if (finalResult.length !== nodeCount) {
        throw new Error("Unable to resolve all dependencies");
    }

    return Array.from(finalResult, idx => Object.keys(nodeToIndex)[idx]);
}

const input = [
    ['a', 'g', 'h', 'd'],
    ['a', 'k', 'h', 'g', 'v'],
    ['m', 'n', 'a', 'g', 'v'],
    ['m', 'u', 'a', 'v'],
    ['y', 'k', 'a']
];

console.log(optimalDependencyCompromise(input));