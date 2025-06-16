function pad2DArrayWithZeros(array, frontPad = false, targetWidth = null) {
  if (!Array.isArray(array) || array.length === 0) return [];

  const maxWidth =
    targetWidth !== null
      ? targetWidth
      : Math.max(...array.map((row) => (Array.isArray(row) ? row.length : 0)));

  if (maxWidth === 0) return [];

  const paddedArray = new Array(array.length);

  for (let i = 0; i < array.length; i++) {
    const row = Array.isArray(array[i]) ? array[i] : [];
    const rowLength = row.length;
    const width =
      targetWidth !== null && targetWidth > rowLength ? targetWidth : maxWidth;

    paddedArray[i] = new Array(width);

    if (frontPad && width > rowLength) {
      const zerosNeeded = width - rowLength;
      for (let j = 0; j < width; j++) {
        paddedArray[i][j] = j < zerosNeeded ? 0 : row[j - zerosNeeded];
      }
    } else {
      for (let j = 0; j < width; j++) {
        paddedArray[i][j] = j < rowLength ? row[j] : 0;
      }
    }
  }

  return paddedArray;
}

function array2DTo3D(array, padWithZero = true) {
  if (!Array.isArray(array) || array.length === 0) return [[]];

  // const numRows = array.length;
  // const numCols = Math.max(...array.map(row => row.length || 0));

  // if (numCols === 0) return [[]];

  // const result = new Array(numRows);
  // for (let i = 0; i < numRows; i++) {
  //     result[i] = new Array(numCols);
  //     for (let j = 0; j < numCols; j++) {
  //         const value = array[i][j];
  //         if (value !== undefined) {
  //             result[i][j] = [value];
  //         } else {
  //             result[i][j] = padWithZero ? [0] : [];
  //         }
  //     }
  // }
  const result = array.map((arr) => arr.map((value) => [value]));
  return result;
}
// console.log(array2DTo3D([[1, 2], [3], [4, 5, 6]]))
function array3DTo2D(array) {
  if (!Array.isArray(array) || array.length === 0) return [];
  if (array.length === 1 && (!Array.isArray(array[0]) || array[0].length === 0))
    return [];

  // const numRows = array.length;
  // const numCols = Math.max(...array.map(layer => Array.isArray(layer) ? layer.length : 0));
  // if (numCols === 0) return [];

  // const result = new Array(numRows);
  // for (let i = 0; i < numRows; i++) {
  //     if (!Array.isArray(array[i])) {
  //         result[i] = new Array(numCols).fill(0);
  //         continue;
  //     }
  //     result[i] = new Array(numCols);
  //     for (let j = 0; j < numCols; j++) {
  //         const subArray = Array.isArray(array[i][j]) ? array[i][j] : [];
  //         result[i][j] = subArray.length > 0 ? subArray[0] : 0;
  //     }
  // }

  const result = array.map((arr) => arr.flat());
  return result;
}
// console.log(array3DTo2D([[[1], [2], []], [[3], [], []], [[4], [5], [6]]]))
function switchColumnsToRows(array) {
  if (!array || array.length === 0) return [];

  const numRows = array.length;
  const numCols = Math.max(...array.map((row) => row.length));
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
// console.log(switchColumnsToRows([[1, 2], [3], [4, 5, 6]]))
function zeroArray(length) {
  return Array(length).fill(0);
}

export default function createDependencyTable(input) {
  let X = Math.max(...input.map((arr) => arr.length));

  let table = array2DTo3D(input);
  let padArrY = pad2DArrayWithZeros(array3DTo2D(table), true),
    padArrX = switchColumnsToRows(padArrY);

  for (let I = 0; I < X; I++) {
    input.forEach((A, I) => {
      if (A.length !== 0) {
        if (I === 0) A.shift();
        else {
          const V = A.shift();
          padArrX.forEach((arr, J) => {
            arr.forEach((val, K) => {
              if (val[J] === V) {
                table[J][K].unshift(...zeroArray(I));
              }
            });
          });
        }
      }
    });
  }
  return table;
}

const input = [
  [1, 2, 3],
  [1, 5, 3],
  [7, 8],
  [7, 9, 1],
  [10, 5, 1],
  [5, 1, 10],
];
// const output =
// [
//     [[0,   0,   1], [2], [3]],
//     [[0,   0,   1], [5], [3]],
//     [[7], [8]],
//     [[7], [9], [1]],
//     [[10],[5], [1]],
//     [[0,   5], [1], [10]]
// ]
// // [
// //     [1, 2, 3, 4],
// //     [1, 5, 3, 2, 6],
// //     [7, 8, 1, 2, 6],
// //     [7, 9, 1, 6],
// //     [10, 5, 1],
// //     [5, 1, 10]
// // ]
console.log(createDependencyTable(input));

// // Output results
// console.log('Numeric Arrays:');
// console.log(result.numericArrays);
// console.log('\nReference Set:');
// console.log(result.referenceSet);

// function transformToTable(arrays) {
//     if (arrays.length === 0) return [];

//     const TARGET_WIDTH = 7;
//     const rowPrecedences = arrays.map(array => {
//         const precedence = new Map();
//         for (let i = 0; i < array.length - 1; i++) {
//             const from = array[i];
//             const to = array[i + 1];
//             if (!precedence.has(from)) precedence.set(from, new Set());
//             precedence.get(from).add(to);
//         }
//         return precedence;
//     });

//     const table = arrays.map(() => Array(TARGET_WIDTH).fill(0));
//     const baseColumnMap = new Map([[1, 2], [6, 6]]); // Base anchors

//     arrays.forEach((array, rowIndex) => {
//         const columnMap = new Map(baseColumnMap); // Reset per row with anchors
//         const usedColumns = new Set([2, 6]); // Reserve c2 and c6
//         let lastCol = -1;

//         array.forEach((element) => {
//             let col = columnMap.get(element);

//             if (col === undefined) {
//                 col = lastCol + 1;
//                 while (usedColumns.has(col) && col < TARGET_WIDTH) {
//                     col++;
//                 }
//                 if (col >= TARGET_WIDTH) {
//                     col = lastCol + 1; // Recompute if out of bounds
//                 }
//                 columnMap.set(element, col);
//             }

//             // Ensure order by shifting if necessary
//             if (col <= lastCol) {
//                 col = lastCol + 1;
//                 while (usedColumns.has(col) && col < TARGET_WIDTH) {
//                     col++;
//                 }
//                 columnMap.set(element, col);
//             }

//             if (col < TARGET_WIDTH) {
//                 table[rowIndex][col] = element;
//                 usedColumns.add(col);
//                 lastCol = col;
//             }
//         });
//     });

//     return table;
// }

// Test function
// function runTest() {
//     const input = [
//         [1, 2, 3, 4],
//         [1, 5, 3, 2, 6],
//         [7, 8, 1, 2, 6],
//         [7, 9, 1, 6],
//         [10, 5, 1]
//     ];

//     const result = transformToTable(input);

//     console.log("Test Result:");
//     result.forEach(row => {
//         console.log(row.map(cell => cell.toString().padEnd(2)).join(' '));
//     });

//     return result;
// }

// // Run the test
// runTest();

// // ---
// [
//     [1, 2, 3, 4],
//     [1, 5, 3, 2, 6],
//     [7, 8, 1, 2, 6],
//     [7, 9, 1, 6],
//     [10, 5, 1]
// ]
// // AFTER TRANSFORMATION
// [
//     [0,  0,  1,  2,  3,  4,  0],
//     [0,  0,  1,  5,  3,  2,  6],
//     [7,  8,  1,  0,  0,  2,  6],
//     [7,  9,  1,  0,  0,  0,  6],
//     [10, 5,  1,  0,  0,  0,  0]
// ]

// Test the function
// const input = [
//     [1, 2, 3, 4],
//     [1, 5, 3, 2, 6],
//     [7, 8, 1, 2, 6],
//     [7, 9, 1, 6],
//     [10, 5, 1]
// ];

// const result = appendZeros(input);

// // Output results
// console.log('Arrays with appended zeros:');
// console.log(result);
