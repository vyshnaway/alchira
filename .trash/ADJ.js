function createWeightedAdjacencyMatrix(sequences) {
  // Step 1: Initialize data structures
  const nodeSet = new Set(); // Unique nodes
  const nodePairs = new Set(); // Unique pairs as strings for efficiency

  // Step 2: Collect nodes and pairs in one pass
  for (const seq of sequences) {
    if (seq.length < 2) continue; // Skip sequences with fewer than 2 elements
    for (let i = 0; i < seq.length - 1; i++) {
      const from = seq[i];
      nodeSet.add(from);
      for (let j = i + 1; j < seq.length; j++) {
        const to = seq[j];
        nodeSet.add(to);
        nodePairs.add(`${from},${to}`); // Store as string to ensure uniqueness
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
        matrix[u][v] += 1; // Increment weight
      }
    }
  }

  // Step 6: Convert nodePairs back to array format
  const formattedNodePairs = new Set(
    Array.from(nodePairs).map((pair) => pair.split(",").map(Number)),
  );

  return { matrix, nodes, nodePairs: formattedNodePairs };
}

function generateArrayFromExpression(A, N, B, expression) {
  // Validate inputs
  // if (!Number.isInteger(A) || !Number.isInteger(B) || typeof expression !== 'function' || !Number.isInteger(N)) {
  //     throw new Error("A and B must be integers, expression must be a function, and n must be an integer");
  // }
  // if (A > B) {
  //     throw new Error("A must be less than or equal to B");
  // }
  // if (N < 1) {
  //     throw new Error("n must be at least 1");
  // }

  // Handle special case: n = 1
  if (N === 1) {
    return [expression(A)]; // Only one element, use A (could use B, but A is start)
  }

  // Calculate step size to get n elements from A to B
  const step = (B - A) / (N - 1);

  // Generate the array
  const result = [];
  for (let i = 0; i < N; i++) {
    const x = A + i * step;
    result.push(expression(x));
  }

  return result;
}
function scalarMultiplyAndSumArrays(array1, array2) {
  if (array1.length !== array2.length) {
    throw new Error("Arrays must be of the same length");
  }
  return array1.reduce(
    (accumulator, value, index) => (accumulator += value * array2[index]),
    0,
  );
}
function applyDistributionToArray(array, A, N, B, expression) {
  const distribution = generateArrayFromExpression(A, N, B, expression);
  return array.map((arr) => scalarMultiplyAndSumArrays(arr, distribution));
}

function sortByRefernce(arrayA, referB) {
  if (arrayA.length !== referB.length) {
    throw new Error("Both arrays must be of the same length");
  }
  const combined = arrayA.map((value, index) => ({
    value,
    key: referB[index],
  }));
  combined.sort((a, b) => b.key - a.key);
  return combined.map((item) => item.value);
}
function bechmarkSequence(sequence, pairs) {
  let count = 0;
  for (const [a, b] of pairs) {
    let foundB = false;
    let aAfterB = false;
    for (let i = 0; i < sequence.length; i++) {
      if (sequence[i] === b) foundB = true;
      if (foundB && sequence[i] === a) {
        aAfterB = true;
        break;
      }
    }
    if (!aAfterB) count++;
  }
  return count / pairs.length;
}

function transformMatrixToBottomLeft(matrix, nodes) {
  const V = matrix.length;

  // Step 1: Compute incoming and outgoing weights
  const outWeights = Array(V).fill(0);
  const inWeights = Array(V).fill(0);
  for (let i = 0; i < V; i++) {
    for (let j = 0; j < V; j++) {
      outWeights[i] += matrix[i][j]; // Sum of row
      inWeights[j] += matrix[i][j]; // Sum of column
    }
  }

  // Step 2: Compute scores and pair with nodes
  const nodeScores = nodes.map((node, idx) => ({
    node,
    idx,
    score: inWeights[idx] - outWeights[idx], // High inWeights -> low index, high outWeights -> high index
  }));

  // Sort nodes by score ascending
  nodeScores.sort((a, b) => a.score - b.score);

  // Step 3: Create new node order and index mapping
  const newOrder = nodeScores.map((item) => item.idx);
  const newNodes = nodeScores.map((item) => item.node);
  const indexMap = new Map(newOrder.map((oldIdx, newIdx) => [oldIdx, newIdx]));

  // Step 4: Permute the matrix
  const transformed = Array.from({ length: V }, () => Array(V).fill(0));
  for (let i = 0; i < V; i++) {
    for (let j = 0; j < V; j++) {
      const newI = indexMap.get(i);
      const newJ = indexMap.get(j);
      transformed[newI][newJ] = matrix[i][j];
    }
  }

  return { matrix: transformed, nodes: newNodes };
}

function printMatrix(nodes, matrix) {
  console.log("Weighted Adjacency Matrix:");
  console.log("   " + nodes.map((n) => String(n).padStart(2, " ")).join(" "));
  nodes.forEach((node, i) => {
    console.log(
      String(node).padStart(2, " ") +
        " " +
        matrix[i].map((val) => String(val).padStart(2, " ")).join(" "),
    );
  });
}
function execute(sequences, A, B, expression) {
  const { matrix, nodes, nodePairs } = createWeightedAdjacencyMatrix(sequences);
  // const newMatrix = transformMatrixToBottomLeft(nodes, matrix)
  const distResult = applyDistributionToArray(
    matrix,
    A,
    nodes.length,
    B,
    expression,
  );
  const result = sortByRefernce(nodes, distResult);
  const score =
    bechmarkSequence(result, Array.from(nodePairs)) / nodePairs.size;
  printMatrix(nodes, matrix);
  console.log(nodes);
  // console.log(distResult)
  // console.log(nodePairs)
  return { result, score };
}

// Test the function
// const sequences = [
//     [1, 2, 3],
//     [1, 5, 3],
//     [7, 8],
//     [7, 9, 1],
//     [10, 5, 1],
//     [5, 1, 10]
// ];

function generate2dIntegerArray(size) {
  // Initialize a 20x20 array with random integers between 0 and 9
  const matrix = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => Math.floor(Math.random() * 10)),
  );

  return matrix;
}
const sequences = generate2dIntegerArray(10);
console.table(sequences);
console.log(execute(sequences, 1, 1.5, expression.identity));
