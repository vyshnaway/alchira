function createSortedRankArray(input) {
  // Use object instead of Map for faster property access
  const rankGroups = {};
  let totalLength = 0;

  // Single pass to group and count - O(n)
  // Avoid Object.hasOwnProperty and Map overhead
  for (const key in input) {
    const rank = input[key].Rank;
    const numKey = Number(key);
    if (rankGroups[rank]) {
      rankGroups[rank].push(numKey);
      totalLength++;
    } else {
      rankGroups[rank] = [numKey];
      totalLength = totalLength + 1; // Avoid ++ for micro-optimization
    }
  }

  // Pre-allocate result array with exact size
  const result = new Array(totalLength);

  // Use object keys directly instead of Map entries
  const ranks = Object.keys(rankGroups);

  // Faster numeric sort with inline comparison
  ranks.sort((a, b) => a - b); // a-b is faster than Number(a)-Number(b)

  // Single pass to fill result array - O(n)
  let index = 0;
  for (let i = 0, len = ranks.length; i < len; i++) {
    const rank = ranks[i];
    const keys = rankGroups[rank];
    // Unroll small array copies
    switch (keys.length) {
      case 1:
        result[index] = keys[0];
        index++;
        break;
      case 2:
        result[index] = keys[0];
        result[index + 1] = keys[1];
        index += 2;
        break;
      case 3:
        result[index] = keys[0];
        result[index + 1] = keys[1];
        result[index + 2] = keys[2];
        index += 3;
        break;
      default:
        // Use typed array copy for larger groups
        for (let j = 0, kLen = keys.length; j < kLen; j++) {
          result[index++] = keys[j];
        }
    }
  }

  return result;
}

// // Benchmark code (same as before, modified to use new function)
// function generateTestData(size) {
//     const data = {};
//     for (let i = 1; i <= size; i++) {
//         const rank = Math.floor(Math.random() * 100) + 1;
//         data[i] = { Rank: rank, name: `Item${i}`, value: i * 100, active: i % 2 === 0 };
//     }
//     return data;
// }

// function runBenchmark() {
//     const sizes = [100, 1000, 10000, 1000000];
//     const results = {};

//     sizes.forEach(size => {
//         const testData = generateTestData(size);
//         createSortedRankArray(testData); // Warm-up
//         const startTime = performance.now();
//         createSortedRankArray(testData);
//         const endTime = performance.now();
//         results[size] = (endTime - startTime).toFixed(2);
//     });

//     console.log('Optimized Benchmark Results (milliseconds):');
//     console.table(results);
// }

// runBenchmark();

// // Test data
const testObject = {
  1: { Rank: 10, name: "Alpha", value: 100, active: true },
  2: { Rank: 20, name: "Beta", value: 200, active: false },
  3: { Rank: 10, name: "Gamma", value: 300, active: true },
  4: { Rank: 30, name: "Delta", value: 400, active: false },
  5: { Rank: 20, name: "Epsilon", value: 500, active: true },
  6: { Rank: 10, name: "Zeta", value: 600, active: false },
  "007": { Rank: 30, name: "Eta", value: 700, active: true },
  8.5: { Rank: 40, name: "Theta", value: 850, active: false },
};

// Run the test with createTable
const testResult = createSortedRankArray(testObject);
console.log("Input object:", testObject);
console.log("Output array:", testResult);
