import fn from "./block.js";
const string = `
prop1: val1;
prop3: val3;
.22 2% {
    prop4 : hinokin;
    props4 : hinokins4;
}
@applay hg;
    &.22f 2% {
    }
    &.22f 2% {
        prop4 : hinokin;
        props4 : hinokins4;
    }
&:media gh {
    prop4 : 'hinokin';
    prop43 : 'hinokin';
    @applay hg;
};
@adds asd;
@bind asd;
* dfd +67u <od;
< dfd +67u >df *uu;
df <67, >78; 
@:hover {
    prop4 : 'hinokin';
    prop43 : 'hinokin';
    @applay hg;
a b csd;
};+;>;<;
a b csd;
gha b csd;
--fd: df;
`;
console.log(fn(string));
// function testDeepMerge() {
//     // Helper function to compare objects
//     const assertEqual = (actual, expected, testName) => {
//         const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
//         console.log(`${testName}: ${isEqual ? 'PASSED' : 'FAILED'}`);
//         if (!isEqual) {
//             console.log(`  Expected: ${JSON.stringify(expected)}`);
//             console.log(`  Got: ${JSON.stringify(actual)}`);
//         }
//     };
//     // Test 1: Basic merge with simple values
//     const test1Target = { a: 1, b: 2 };
//     const test1Source = { b: 3, c: 4 };
//     const test1Result = deepMerge(test1Target, test1Source);
//     assertEqual(test1Result, { a: 1, b: 3, c: 4 }, "Test 1 - Basic merge");
//     // Test 2: Merge with nested objects (includeInnerObjects = true)
//     const test2Target = { a: { x: 1, y: 2 }, b: 2 };
//     const test2Source = { a: { y: 3, z: 4 }, c: 5 };
//     const test2Result = deepMerge(test2Target, test2Source);
//     assertEqual(test2Result, { a: { x: 1, y: 3, z: 4 }, b: 2, c: 5 }, "Test 2 - Nested object merge");
//     // Test 3: Merge with undefined values in source
//     const test3Target = { a: 1, b: 2 };
//     const test3Source = { b: undefined, c: 3 };
//     const test3Result = deepMerge(test3Target, test3Source);
//     assertEqual(test3Result, { a: 1, b: 2, c: 3 }, "Test 3 - Undefined values ignored");
//     // Test 4: Merge with includeInnerObjects = false
//     const test4Target = { a: { x: 1, y: 2 }, b: 2 };
//     const test4Source = { a: { y: 3, z: 4 }, c: 5 };
//     const test4Result = deepMerge(test4Target, test4Source, false);
//     assertEqual(test4Result, { a: { y: 3, z: 4 }, b: 2, c: 5 }, "Test 4 - No inner object merge");
//     // Test 5: Source is not an object
//     const test5Target = { a: 1, b: 2 };
//     const test5Result = deepMerge(test5Target, null);
//     assertEqual(test5Result, { a: 1, b: 2 }, "Test 5 - Non-object source");
//     // Test 6: Merge with arrays (should overwrite, not merge)
//     const test6Target = { a: [1, 2], b: 2 };
//     const test6Source = { a: [3, 4], c: 5 };
//     const test6Result = deepMerge(test6Target, test6Source);
//     assertEqual(test6Result, { a: [3, 4], b: 2, c: 5 }, "Test 6 - Array overwrite");
//     console.log("All tests completed!");
// }
// // Run the tests
// testDeepMerge();
//# sourceMappingURL=block.test.js.map