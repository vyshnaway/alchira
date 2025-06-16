export default function organizeMaps(originalArray, indexOrder) {
  const len = originalArray.length;

  // Use TypedArray for sortedArray when possible (faster and less memory)
  const sortedArray = originalArray.every((item) => typeof item === "number")
    ? new Float64Array(len)
    : new Array(len);

  // Single object with minimal footprint
  const result = { mapping: Object.create(null), sortedArray };

  // Single pass with minimal operations
  for (let i = 0; i < len; i++) {
    const value = originalArray[i];
    const index = indexOrder[i];
    result.mapping[value] = index;
    sortedArray[index] = value;
  }

  // Optimized sorting based on size and type
  if (len <= 8) {
    // Insertion sort for small arrays - minimal memory overhead
    for (let i = 1; i < len; i++) {
      const current = sortedArray[i];
      let j = i - 1;
      while (
        j >= 0 &&
        (sortedArray[j] === undefined ||
          (sortedArray[j] > current && current !== undefined))
      ) {
        sortedArray[j + 1] = sortedArray[j];
        j--;
      }
      sortedArray[j + 1] = current;
    }
  } else {
    // Custom quicksort for larger arrays - in-place, no extra memory
    const quickSort = (arr, low, high) => {
      if (low < high) {
        let pivot = arr[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
          if (arr[j] === undefined) continue;
          if (pivot === undefined || arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
        }

        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        const pi = i + 1;

        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
      }
    };
    quickSort(sortedArray, 0, len - 1);
  }

  // Trim undefined elements in-place
  let finalLength = len;
  while (finalLength > 0 && sortedArray[finalLength - 1] === undefined) {
    finalLength--;
  }

  // Convert TypedArray to regular array only if needed
  result.sortedArray =
    finalLength < len
      ? sortedArray.slice(0, finalLength) instanceof Float64Array
        ? Array.from(sortedArray.slice(0, finalLength))
        : sortedArray.slice(0, finalLength)
      : sortedArray instanceof Float64Array
        ? Array.from(sortedArray)
        : sortedArray;

  return result;
}

// // Test Function (unchanged from previous)
// function testIndexMap() {
//     const tests = [
//         { description: "Basic numbers", input: { originalArray: [1, 2, 3], indexOrder: [0, 1, 2] }, expected: { mapping: { "1": 0, "2": 1, "3": 2 }, sortedArray: [1, 2, 3] } },
//         { description: "Reordered numbers", input: { originalArray: [3, 1, 2], indexOrder: [2, 0, 1] }, expected: { mapping: { "3": 2, "1": 0, "2": 1 }, sortedArray: [1, 2, 3] } },
//         { description: "Strings", input: { originalArray: ["c", "a", "b"], indexOrder: [2, 0, 1] }, expected: { mapping: { "c": 2, "a": 0, "b": 1 }, sortedArray: ["a", "b", "c"] } },
//         { description: "With gaps", input: { originalArray: [5, 3, 1], indexOrder: [4, 2, 0] }, expected: { mapping: { "5": 4, "3": 2, "1": 0 }, sortedArray: [1, 3, 5] } },
//         { description: "Empty", input: { originalArray: [], indexOrder: [] }, expected: { mapping: {}, sortedArray: [] } }
//     ];

//     let passed = 0, failed = 0;
//     console.log("Running indexMap tests...\n");

//     tests.forEach((test, index) => {
//         const result = organizeMaps(test.input.originalArray, test.input.indexOrder);
//         const isEqual = JSON.stringify(result) === JSON.stringify(test.expected);
//         console.log(`Test ${index + 1}: ${test.description}`);
//         console.log(`Input: originalArray=${JSON.stringify(test.input.originalArray)}, indexOrder=${JSON.stringify(test.input.indexOrder)}`);
//         console.log(`Expected: ${JSON.stringify(test.expected)}`);
//         console.log(`Got: ${JSON.stringify(result)}`);
//         console.log(`Status: ${isEqual ? 'PASSED' : 'FAILED'}`);
//         console.log("------------------------");
//         if (isEqual) passed++; else failed++;
//     });

//     console.log(`\nTest Summary:`);
//     console.log(`Passed: ${passed}`);
//     console.log(`Failed: ${failed}`);
//     console.log(`Total: ${passed + failed}`);
// }

// // Run the tests
// testIndexMap();
