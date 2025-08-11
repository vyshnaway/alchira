import Fn from "./3.array";

console.log(Fn.longestSubChain([1, 2, 3, 4, 5], [2, 3, 4]));
console.log(Fn.longestSubChain([1, 3, 2, 4, 5, 6], [3, 1, 4, 2, 5]));
console.log(Fn.longestSubChain([10, 20, 30, 40], [20, 10, 30, 40]));
console.log(Fn.longestSubChain([7, 8, 9, 10], [10, 9, 8, 7]));
console.log(Fn.longestSubChain([1, 2, 3, 4, 5], [5, 4, 3, 2, 1]));

// EXCEPTIONS
console.log(Fn.longestSubChain([1, 2, 3, 4], [5, 6, 7, 8]));
console.log(Fn.longestSubChain([1, 3, 5, 7, 9], [2, 4, 6, 8, 10]));
console.log(Fn.longestSubChain([], [1, 2, 3]));
console.log(Fn.longestSubChain([1, 2, 3], []));
console.log(Fn.longestSubChain([], []));
