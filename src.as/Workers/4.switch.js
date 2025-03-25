export default function objectSwitch(srcObject) {
    if (!srcObject || typeof srcObject !== 'object') {
        return {};
    }

    const output = {};

    for (const outerKey in srcObject) {
        if (srcObject.hasOwnProperty(outerKey) && outerKey[0] !== '+') {
            const innerObject = srcObject[outerKey];

            if (typeof innerObject === 'object' && innerObject !== null) {
                for (const innerKey in innerObject) {
                    if (innerObject.hasOwnProperty(innerKey)) {
                        output[innerKey] = output[innerKey] || {};
                        output[innerKey][outerKey] = innerObject[innerKey];
                    }
                }
            }
        }
    }

    return output;
}

// function testObjectSwitch() {
//     // Test Case 1: Basic object switching (unchanged)
//     const test1 = {
//         a: { x: 1, y: 2 },
//         b: { x: 3, y: 4 }
//     };
//     const result1 = objectSwitch(test1);
//     console.log("Test 1 - Basic object switching:");
//     console.log("Input:", JSON.stringify(test1, ' ', 2));
//     console.log("Output:", JSON.stringify(result1, ' ', 2));
//     console.log("Expected: {\"x\":{\"a\":1,\"b\":3},\"y\":{\"a\":2,\"b\":4}}");
//     console.log("Pass:", JSON.stringify(result1, ' ', 2) === '{"x":{"a":1,"b":3},"y":{"a":2,"b":4}}');
//     console.log("---");

//     // Test Case 2: Second-order nesting (object in object)
//     const test2 = {
//         a: { x: { p: 1, q: 2 }, y: 3 },
//         b: { x: { p: 4, q: 5 }, y: 6 }
//     };
//     const result2 = objectSwitch(test2);
//     console.log("Test 2 - Second-order nesting:");
//     console.log("Input:", JSON.stringify(test2, ' ', 2));
//     console.log("Output:", JSON.stringify(result2, ' ', 2));
//     console.log("Expected: {\"x\":{\"a\":{\"p\":1,\"q\":2},\"b\":{\"p\":4,\"q\":5}},\"y\":{\"a\":3,\"b\":6}}");
//     console.log("Pass:", JSON.stringify(result2, ' ', 2) === '{"x":{"a":{"p":1,"q":2},"b":{"p":4,"q":5}},"y":{"a":3,"b":6}}');
//     console.log("---");

//     // Test Case 3: Third-order nesting (object in object in object)
//     const test3 = {
//         a: { x: { p: { m: 1 }, q: 2 }, y: 3 },
//         b: { x: { p: { m: 4 }, q: 5 }, y: 6 }
//     };
//     const result3 = objectSwitch(test3);
//     console.log("Test 3 - Third-order nesting:");
//     console.log("Input:", JSON.stringify(test3, ' ', 2));
//     console.log("Output:", JSON.stringify(result3, ' ', 2));
//     console.log("Expected: {\"x\":{\"a\":{\"p\":{\"m\":1},\"q\":2},\"b\":{\"p\":{\"m\":4},\"q\":5}},\"y\":{\"a\":3,\"b\":6}}");
//     console.log("Pass:", JSON.stringify(result3, ' ', 2) === '{"x":{"a":{"p":{"m":1},"q":2},"b":{"p":{"m":4},"q":5}},"y":{"a":3,"b":6}}');
//     console.log("---");

//     // Test Case 4: Fourth-order nesting (object in object in object in object)
//     const test4 = {
//         a: { x: { p: { m: { n: 1 } }, q: 2 }, y: 3 },
//         b: { x: { p: { m: { n: 4 } }, q: 5 }, y: 6 }
//     };
//     const result4 = objectSwitch(test4);
//     console.log("Test 4 - Fourth-order nesting:");
//     console.log("Input:", JSON.stringify(test4, ' ', 2));
//     console.log("Output:", JSON.stringify(result4, ' ', 2));
//     console.log("Expected: {\"x\":{\"a\":{\"p\":{\"m\":{\"n\":1}},\"q\":2},\"b\":{\"p\":{\"m\":{\"n\":4}},\"q\":5}},\"y\":{\"a\":3,\"b\":6}}");
//     console.log("Pass:", JSON.stringify(result4, ' ', 2) === '{"x":{"a":{"p":{"m":{"n":1}},"q":2},"b":{"p":{"m":{"n":4}},"q":5}},"y":{"a":3,"b":6}}');
//     console.log("---");

//     // Test Case 5: Arrays up to fourth order
//     const test5 = {
//         a: { x: [1, [2, [3, [4]]]], y: 5 },
//         b: { x: [6, [7, [8, [9]]]], y: 10 }
//     };
//     const result5 = objectSwitch(test5);
//     console.log("Test 5 - Arrays up to fourth order:");
//     console.log("Input:", JSON.stringify(test5, ' ', 2));
//     console.log("Output:", JSON.stringify(result5, ' ', 2));
//     console.log("Expected: {\"x\":{\"a\":[1,[2,[3,[4]]]],\"b\":[6,[7,[8,[9]]]]},\"y\":{\"a\":5,\"b\":10}}");
//     console.log("Pass:", JSON.stringify(result5, ' ', 2) === '{"x":{"a":[1,[2,[3,[4]]]],"b":[6,[7,[8,[9]]]]},"y":{"a":5,"b":10}}');
//     console.log("---");

//     // Test Case 6: Mixed objects and arrays up to fourth order
//     const test6 = {
//         a: { x: { p: [1, { q: { r: 2 } }], s: 3 }, y: 4 },
//         b: { x: { p: [5, { q: { r: 6 } }], s: 7 }, y: 8 }
//     };
//     const result6 = objectSwitch(test6);
//     console.log("Test 6 - Mixed objects and arrays up to fourth order:");
//     console.log("Input:", JSON.stringify(test6, ' ', 2));
//     console.log("Output:", JSON.stringify(result6, ' ', 2));
//     console.log("Expected: {\"x\":{\"a\":{\"p\":[1,{\"q\":{\"r\":2}}],\"s\":3},\"b\":{\"p\":[5,{\"q\":{\"r\":6}}],\"s\":7}},\"y\":{\"a\":4,\"b\":8}}");
//     console.log("Pass:", JSON.stringify(result6, ' ', 2) === '{"x":{"a":{"p":[1,{"q":{"r":2}}],"s":3},"b":{"p":[5,{"q":{"r":6}}],"s":7}},"y":{"a":4,"b":8}}');
//     console.log("---");
// }

// // Run the tests
// testObjectSwitch();