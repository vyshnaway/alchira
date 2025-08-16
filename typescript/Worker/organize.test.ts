import organize from "./organize.js";

const testArray = [
    [1, 2, 3],
    [3, 2, 6, 7, 1],
    [8, 2, 4],
    [2, 3, 7, 1],
    [2, 7, 3, 1],
    [2, 7]
];

console.log(organize(testArray, true));


console.log(organize(testArray, false));