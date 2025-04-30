import Utils from "../Utils/index.js";

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
function optimalOrder(sequences, weighted = true, A = 0, B = 0, expression = () => 1) {
    const nodeSet = new Set();
    for (const seq of sequences) {
        for (const node of seq) nodeSet.add(node);
    }
    const V = nodeSet.size;
    if (V < 2) return { result: sequences[0] || [], score: 0 };

    const nodes = Array.from(nodeSet).sort((a, b) => a - b);
    const nodeToIndex = new Map(nodes.map((node, idx) => [node, idx]));

    const matrix = Array.from({ length: V }, () => new Uint32Array(V));
    const DModulus = new Float32Array(V);
    const nodePairs = [];

    for (const seq of sequences) {
        if (seq.length < 2) continue;
        const indices = seq.map(node => nodeToIndex.get(node));
        for (let i = 0; i < indices.length - 1; i++) {
            for (let j = i + 1; j < indices.length; j++) {
                const u = indices[i], v = indices[j];
                if (weighted) {
                    matrix[u][v] += 1;
                    DModulus[u] += 1;
                } else {
                    if (matrix[u][v] === 0) {
                        matrix[u][v] = 1;
                        DModulus[u] += 1;
                    }
                }
                nodePairs.push([nodes[u], nodes[v]]);
            }
        }
    }

    const P = Array.from({ length: V }, (_, i) => i).sort((a, b) => DModulus[a] - DModulus[b]);
    const step = V > 1 ? (B - A) / (V - 1) : 0;
    const dist = new Float32Array(V);
    for (let j = 0; j < V; j++) dist[j] = expression(A + j * step);

    const DRefer = new Float32Array(V);
    for (let i = 0; i < V; i++) {
        let sum = 0;
        for (let j = 0; j < V; j++) sum += matrix[i][P[j]] * dist[j];
        DRefer[i] = sum;
    }

    const Q = Array.from({ length: V }, (_, i) => i).sort((a, b) => DRefer[b] - DRefer[a]);
    const result = Q.map(i => nodes[i]);
    const score = benchmarkSequence(result, nodePairs);
    return { status: true, result, score }
}

export default function (arrays = [], CMD, KEY) {
    if (CMD === "build") {
        const response = optimalOrder(arrays);
        return response;
    } else {
        return {
            status: true,
            result: Utils.array.setback(arrays.flat())
        };
    }
}