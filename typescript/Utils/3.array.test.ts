import Fn from "./3.array.js";

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


interface TestCase {
    name: string;
    input: {
        array: number[];
        findFromArrays: number[][];
    };
    expected: number[] | null;
    description: string;
}

// Comprehensive test function
function testfindArrSuperParent(): void {
    const testCases: TestCase[] = [
        {
            name: "Basic subsequence match",
            input: {
                array: [1, 2, 3],
                findFromArrays: [[1, 2, 3, 4], [2, 3, 4], [0, 1, 2, 3]]
            },
            expected: [1, 2, 3, 4],
            description: "Should return first array containing [1,2,3] in order"
        },
        {
            name: "Order matters - wrong order",
            input: {
                array: [1, 2, 3],
                findFromArrays: [[3, 2, 1], [2, 1, 3], [1, 2, 3, 4]]
            },
            expected: [1, 2, 3, 4],
            description: "Should skip arrays with wrong order and find correct one"
        },
        {
            name: "Subsequence with gaps",
            input: {
                array: [1, 2, 3],
                findFromArrays: [[0, 1, 9, 2, 8, 3, 7], [1, 3, 2]]
            },
            expected: [0, 1, 9, 2, 8, 3, 7],
            description: "Should find subsequence even with elements in between"
        },
        {
            name: "Duplicate elements in input",
            input: {
                array: [1, 2, 1, 3],
                findFromArrays: [[1, 2, 3, 1], [1, 2, 1, 3, 4], [1, 1, 2, 3]]
            },
            expected: [1, 2, 1, 3, 4],
            description: "Should handle duplicate elements correctly"
        },
        {
            name: "Empty input array",
            input: {
                array: [],
                findFromArrays: [[1, 2], [3, 4], [5, 6]]
            },
            expected: [1, 2],
            description: "Empty array should match first candidate (empty subsequence)"
        },
        {
            name: "No valid subsequence",
            input: {
                array: [1, 2, 3],
                findFromArrays: [[3, 2, 1], [2, 3, 1], [1, 3, 2]]
            },
            expected: null,
            description: "Should return null when no valid subsequence exists"
        },
        {
            name: "Single element arrays",
            input: {
                array: [5],
                findFromArrays: [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
            },
            expected: [4, 5, 6],
            description: "Should work with single element input"
        },
        {
            name: "Exact match",
            input: {
                array: [1, 2, 3],
                findFromArrays: [[4, 5, 6], [1, 2, 3], [7, 8, 9]]
            },
            expected: [1, 2, 3],
            description: "Should work when candidate exactly matches input"
        },
        {
            name: "Multiple valid candidates",
            input: {
                array: [1, 2],
                findFromArrays: [[1, 2, 3], [0, 1, 2], [1, 2, 4, 5]]
            },
            expected: [1, 2, 3],
            description: "Should return first valid candidate when multiple exist"
        },
        {
            name: "Large numbers",
            input: {
                array: [100, 200, 300],
                findFromArrays: [[50, 100, 150, 200, 250, 300, 350], [300, 200, 100]]
            },
            expected: [50, 100, 150, 200, 250, 300, 350],
            description: "Should work with larger numbers"
        },
        {
            name: "Repeated elements in candidate",
            input: {
                array: [1, 2, 3],
                findFromArrays: [[1, 1, 2, 2, 3, 3], [2, 1, 3]]
            },
            expected: [1, 1, 2, 2, 3, 3],
            description: "Should handle repeated elements in candidate arrays"
        },
        {
            name: "Empty candidates array",
            input: {
                array: [1, 2, 3],
                findFromArrays: []
            },
            expected: null,
            description: "Should return null when no candidates provided"
        }
    ];

    console.log("🧪 Running tests for findArrSuperParent...");
    console.log("=" + "=".repeat(60));

    let passed = 0;
    let failed = 0;

    testCases.forEach((testCase, index) => {
        const result = Fn.findArrSuperParent(testCase.input.array, testCase.input.findFromArrays);
        const isEqual = JSON.stringify(result) === JSON.stringify(testCase.expected);

        if (isEqual) {
            console.log(`✅ Test ${index + 1}: ${testCase.name}`);
            console.log(`   Expected: ${JSON.stringify(testCase.expected)}`);
            console.log(`   Got: ${JSON.stringify(result)}`);
            console.log(`   ✓ ${testCase.description}`);
            passed++;
        } else {
            console.log(`❌ Test ${index + 1}: ${testCase.name}`);
            console.log(`   Expected: ${JSON.stringify(testCase.expected)}`);
            console.log(`   Got: ${JSON.stringify(result)}`);
            console.log(`   ✗ ${testCase.description}`);
            failed++;
        }
        console.log("");
    });

    console.log("=" + "=".repeat(60));
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
        console.log("🎉 All tests passed!");
    } else {
        console.log(`⚠️  ${failed} test(s) failed. Please check the implementation.`);
    }
}

// Performance test function
function performanceTest(): void {
    console.log("⚡ Running performance tests...");

    // Generate large test data
    const largeArray = Array.from({ length: 100 }, (_, i) => i);
    const largeCandidates = Array.from({ length: 1000 }, (_, i) =>
        Array.from({ length: 200 }, (_, j) => (i * 200) + j)
    );

    const startTime = performance.now();
    const result = Fn.findArrSuperParent(largeArray, largeCandidates);
    const endTime = performance.now();

    console.log(`⏱️  Performance test completed in ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`📊 Result: ${result ? 'Found superset' : 'No superset found'}`);
}

// Simple quick test function (alternative)
function quickTest(): void {
    console.log("🧪 Quick test of findArrSuperParent function...");

    // Test 1: Basic functionality
    const test1 = Fn.findArrSuperParent([1, 2, 3], [[1, 2, 3, 4], [2, 3], [1, 2, 3]]);
    console.assert(JSON.stringify(test1) === JSON.stringify([1, 2, 3, 4]), "Test 1 failed");
    console.log("✅ Test 1 passed: Basic subsequence");

    // Test 2: Order matters
    const test2 = Fn.findArrSuperParent([1, 2, 3], [[3, 2, 1], [1, 4, 2, 5, 3]]);
    console.assert(JSON.stringify(test2) === JSON.stringify([1, 4, 2, 5, 3]), "Test 2 failed");
    console.log("✅ Test 2 passed: Order preservation");

    // Test 3: No valid subsequence
    const test3 = Fn.findArrSuperParent([1, 2, 3], [[3, 2, 1], [2, 1, 3]]);
    console.assert(test3 === null, "Test 3 failed");
    console.log("✅ Test 3 passed: No valid subsequence");

    console.log("🎉 Quick tests completed!");
}

// Usage examples
function runAllTests(): void {
    console.log("🚀 Starting all tests...\n");

    // Run comprehensive tests
    testfindArrSuperParent();

    console.log("\n");

    // Run performance tests
    performanceTest();

    console.log("\n");

    // Run quick tests
    quickTest();
}

runAllTests();