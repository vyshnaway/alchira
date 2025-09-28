function createScoreTable(input) {
  const result = {};
  const inputx = input.reduce((AC, A) => {
    AC.push([...A].reverse());
    return AC;
  }, []);

  const result1 = {};
  input.forEach((A) => {
    A.forEach((V, I) => {
      if (result1[V] === undefined) result1[V] = 0; // Initialize to 0
      result1[V] += I; // Add column index
    });
  });

  const result2 = {};
  inputx.forEach((A) => {
    A.forEach((V, I) => {
      if (result2[V] === undefined) result2[V] = 0; // Initialize to 0
      result2[V] += I; // Add column index
    });
  });

  let least = 0;
  Object.keys(result1).forEach((key) => {
    result[key] = result1[key] - result2[key];
    if (least > result[key]) least = result[key];
  });

  Object.keys(result).forEach((key) => {
    result[key] = result[key] - least;
  });

  console.log(result1);
  console.log(result2);

  return result;
}

function createScoreGroup(input) {
  return Object.entries(input).reduce((A, [K, V]) => {
    if (A[V] === undefined) A[V] = [];
    A[V].push(K * 1);
    return A;
  }, {});
}

let input1 = [
  [1, 2, 3, 4],
  [1, 5, 3, 2, 6],
  [7, 8, 1, 2, 6],
  [7, 9, 1, 6],
  [10, 5, 1],
];

const scoreTable = createScoreTable(input1);
const scoreGroup = createScoreGroup(scoreTable);

console.log(scoreTable);
console.log(scoreGroup);
console.log(Object.values(scoreGroup).flat());
// [1, 2, 3, 4] => [[1,2], [1,3], [1.4], [2,3], [2, 4], [3,4]]
