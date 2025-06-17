import object from "./2.object.js";

function testobjectswitch() {
	// Test Case 1: Basic object switching (unchanged)
	const test1 = {
		a: { x: 1, y: 2 },
		b: { x: 3, y: 4 },
	};
	const result1 = object.switch(test1);
	console.log("Test 1 - Basic object switching:");
	console.log("Input:", JSON.stringify(test1, " ", 2));
	console.log("Output:", JSON.stringify(result1, " ", 2));
	console.log('Expected: {"x":{"a":1,"b":3},"y":{"a":2,"b":4}}');
	// console.log("Pass:", JSON.stringify(result1, ' ', 2) === '{"x":{"a":1,"b":3},"y":{"a":2,"b":4}}');
	console.log("---");

	// Test Case 2: Second-order nesting (object in object)
	const test2 = {
		a: { x: { p: 1, q: 2 }, y: 3 },
		b: { x: { p: 4, q: 5 }, y: 6 },
	};
	const result2 = object.switch(test2);
	console.log("Test 2 - Second-order nesting:");
	console.log("Input:", JSON.stringify(test2, " ", 2));
	console.log("Output:", JSON.stringify(result2, " ", 2));
	console.log(
		'Expected: {"x":{"a":{"p":1,"q":2},"b":{"p":4,"q":5}},"y":{"a":3,"b":6}}',
	);
	// console.log("Pass:", JSON.stringify(result2, ' ', 2) === '{"x":{"a":{"p":1,"q":2},"b":{"p":4,"q":5}},"y":{"a":3,"b":6}}');
	console.log("---");

	// Test Case 3: Third-order nesting (object in object in object)
	const test3 = {
		a: { x: { p: { m: 1 }, q: 2 }, y: 3 },
		b: { x: { p: { m: 4 }, q: 5 }, y: 6 },
	};
	const result3 = object.switch(test3);
	console.log("Test 3 - Third-order nesting:");
	console.log("Input:", JSON.stringify(test3, " ", 2));
	console.log("Output:", JSON.stringify(result3, " ", 2));
	console.log(
		'Expected: {"x":{"a":{"p":{"m":1},"q":2},"b":{"p":{"m":4},"q":5}},"y":{"a":3,"b":6}}',
	);
	// console.log("Pass:", JSON.stringify(result3, ' ', 2) === '{"x":{"a":{"p":{"m":1},"q":2},"b":{"p":{"m":4},"q":5}},"y":{"a":3,"b":6}}');
	console.log("---");

	// Test Case 4: Fourth-order nesting (object in object in object in object)
	const test4 = {
		a: { x: { p: { m: { n: 1 } }, q: 2 }, y: 3 },
		b: { x: { p: { m: { n: 4 } }, q: 5 }, y: 6 },
	};
	const result4 = object.switch(test4);
	console.log("Test 4 - Fourth-order nesting:");
	console.log("Input:", JSON.stringify(test4, " ", 2));
	console.log("Output:", JSON.stringify(result4, " ", 2));
	console.log(
		'Expected: {"x":{"a":{"p":{"m":{"n":1}},"q":2},"b":{"p":{"m":{"n":4}},"q":5}},"y":{"a":3,"b":6}}',
	);
	// console.log("Pass:", JSON.stringify(result4, ' ', 2) === '{"x":{"a":{"p":{"m":{"n":1}},"q":2},"b":{"p":{"m":{"n":4}},"q":5}},"y":{"a":3,"b":6}}');
	console.log("---");

	// Test Case 5: Arrays up to fourth order
	const test5 = {
		a: { x: [1, [2, [3, [4]]]], y: 5 },
		b: { x: [6, [7, [8, [9]]]], y: 10 },
	};
	const result5 = object.switch(test5);
	console.log("Test 5 - Arrays up to fourth order:");
	console.log("Input:", JSON.stringify(test5, " ", 2));
	console.log("Output:", JSON.stringify(result5, " ", 2));
	console.log(
		'Expected: {"x":{"a":[1,[2,[3,[4]]]],"b":[6,[7,[8,[9]]]]},"y":{"a":5,"b":10}}',
	);
	// console.log("Pass:", JSON.stringify(result5, ' ', 2) === '{"x":{"a":[1,[2,[3,[4]]]],"b":[6,[7,[8,[9]]]]},"y":{"a":5,"b":10}}');
	console.log("---");

	// Test Case 6: Mixed objects and arrays up to fourth order
	const test6 = {
		a: { x: { p: [1, { q: { r: 2 } }], s: 3 }, y: 4 },
		b: { x: { p: [5, { q: { r: 6 } }], s: 7 }, y: 8 },
	};
	const result6 = object.switch(test6);
	console.log("Test 6 - Mixed objects and arrays up to fourth order:");
	console.log("Input:", JSON.stringify(test6, " ", 2));
	console.log("Output:", JSON.stringify(result6, " ", 2));
	console.log(
		'Expected: {"x":{"a":{"p":[1,{"q":{"r":2}}],"s":3},"b":{"p":[5,{"q":{"r":6}}],"s":7}},"y":{"a":4,"b":8}}',
	);
	// console.log("Pass:", JSON.stringify(result6, ' ', 2) === '{"x":{"a":{"p":[1,{"q":{"r":2}}],"s":3},"b":{"p":[5,{"q":{"r":6}}],"s":7}},"y":{"a":4,"b":8}}');
	console.log("---");
}

// // Run the tests
testobjectswitch();

// Test function
function testobjectextract() {
	// Test case 1: Simple objects
	const test1A = { a: 1, b: { c: 2 } };
	const test1B = { b: { c: 2 }, d: 3 };
	console.log("Test 1 - Simple objects:");
	console.log(object.extract(test1A, test1B));

	// Test case 2: Arrays
	const test2A = [{ x: 1 }, { y: 2 }];
	const test2B = [{ x: 1 }, { z: 3 }];
	console.log("\nTest 2 - Arrays:");
	console.log(object.extract(test2A, test2B));

	// Test case 3: Deep nested objects
	const test3A = {
		level1: {
			level2: {
				a: 1,
				b: [2, 6],
			},
			c: 3,
		},
	};
	const test3B = {
		level1: {
			level2: {
				a: 1,
				b: [2],
				d: 4,
			},
		},
	};
	console.log("\nTest 3 - Deep nested:");
	console.log(JSON.stringify(object.extract(test3A, test3B), null, 2));

	// Test case 4: Selective operations
	console.log("\nTest 4 - Selective operations:");
	console.log(object.extract(test1A, test1B, true, false, false, false, false));
}

// Run the tests
// testobjectextract();

// Test function
function testMergeObjects() {
	const testData = [
		{
			name: "John",
			details: {
				hobbies: ["reading", "gaming"],
				scores: [90, 85],
			},
			tags: ["user", "active"],
		},
		{
			name: "Johnny",
			details: {
				hobbies: ["swimming"],
				scores: [95],
			},
			tags: ["member"],
		},
	];

	console.log("Test 1: Default behavior (no array merge, non-aggressive)");
	console.log(JSON.stringify(object.merge(testData), null, 2));
	// Expected: keeps first arrays, only adds new properties

	console.log("\nTest 2: Aggressive merge, no array merge");
	console.log(JSON.stringify(object.merge(testData, true), null, 2));
	// Expected: replaces arrays completely with last value

	console.log("\nTest 3: Array merge enabled, non-aggressive");
	console.log(JSON.stringify(object.merge(testData, false, true), null, 2));
	// Expected: concatenates arrays, keeps first values for conflicts

	console.log("\nTest 4: Array merge enabled, aggressive");
	console.log(JSON.stringify(object.merge(testData, true, true), null, 2));
	// Expected: concatenates arrays, uses last values for conflicts

	// Additional edge case
	const edgeCase = [
		{
			mixed: [1, 2, { a: 1 }],
			nested: { arr: [1, 2] },
		},
		{
			mixed: [3, { b: 2 }],
			nested: { arr: [3] },
		},
	];

	console.log("\nTest 5: Edge case with array merge");
	console.log(JSON.stringify(object.merge(edgeCase, false, true), null, 2));
}

// Run the tests
// testMergeObjects();
