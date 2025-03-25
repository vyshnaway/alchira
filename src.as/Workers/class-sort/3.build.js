export default function optimalOrder(sequences, weighted = true, A = 0, B = 0, expression = () => 1) {
    // Step 1: Collect unique nodes and map to indices
    const nodeSet = new Set();
    for (const seq of sequences) {
        for (const node of seq) nodeSet.add(node);
    }
    const V = nodeSet.size;
    if (V < 2) return { result: sequences[0] || [], score: 0 };

    const nodes = Array.from(nodeSet).sort((a, b) => a - b); // Sorted node list
    const nodeToIndex = new Map(nodes.map((node, idx) => [node, idx])); // O(V)

    // Step 2: Build matrix and compute DModulus on the fly
    const matrix = Array.from({ length: V }, () => new Uint32Array(V)); // O(V²) space
    const DModulus = new Float32Array(V); // Initialize DModulus
    const nodePairs = [];

    for (const seq of sequences) {
        if (seq.length < 2) continue;
        const indices = seq.map(node => nodeToIndex.get(node)); // O(seq.length)
        for (let i = 0; i < indices.length - 1; i++) {
            for (let j = i + 1; j < indices.length; j++) {
                const u = indices[i], v = indices[j];
                if (weighted) {
                    matrix[u][v] += 1;
                    DModulus[u] += 1; // Increment DModulus for each occurrence
                } else {
                    if (matrix[u][v] === 0) {
                        matrix[u][v] = 1;
                        DModulus[u] += 1; // Increment DModulus only once per unique pair
                    }
                }
                nodePairs.push([nodes[u], nodes[v]]); // Store original nodes
            }
        }
    }

    // Step 3: Compute permutation P (sort by DModulus ascending)
    const P = Array.from({ length: V }, (_, i) => i).sort((a, b) => DModulus[a] - DModulus[b]);

    // Step 4: Compute distribution
    const step = V > 1 ? (B - A) / (V - 1) : 0;
    const dist = new Float32Array(V);
    for (let j = 0; j < V; j++) dist[j] = expression(A + j * step);

    // Step 5: Compute DRefer (weighted sums)
    const DRefer = new Float32Array(V);
    for (let i = 0; i < V; i++) {
        let sum = 0;
        for (let j = 0; j < V; j++) sum += matrix[i][P[j]] * dist[j];
        DRefer[i] = sum;
    }

    // Step 6: Compute permutation Q (sort by DRefer descending)
    const Q = Array.from({ length: V }, (_, i) => i).sort((a, b) => DRefer[b] - DRefer[a]);

    // Step 7: Build result sequence
    const result = Q.map(i => nodes[i]);

    // Step 8: Compute score
    const score = benchmarkSequence(result, nodePairs);

    return { result, score };
}

// Helper function to compute the score
function benchmarkSequence(sequence, pairs) {
    const firstIndex = new Map();
    for (let i = 0; i < sequence.length; i++) {
        if (!firstIndex.has(sequence[i])) firstIndex.set(sequence[i], i);
    }

    let count = 0;
    for (const [A, B] of pairs) {
        const indexA = firstIndex.get(A) ?? Infinity;
        const indexB = firstIndex.get(B) ?? Infinity;
        if (indexA < indexB) count++;
    }
    return pairs.length ? count / pairs.length : 0;
}