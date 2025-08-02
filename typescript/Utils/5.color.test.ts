import loadColorFallback from "./5.color.js";

// Example Usage:
const testString = `
    This is a test string with various colors:
    rgb(255, 0, 0) - red
    hsl(120, 100%, 50%) - green
    #0000ff - blue
    #f09 - pink
    hwb(240 0% 0% / 0.5) - blue with transparency
    lab(50% 0 0) - middle gray
    lch(70% 30 200) - some LCH color
    oklab(0.7 0.1 0.2 / 0.8) - some Oklab color
    oklch(0.5 0.2 150) - some Oklch color
    Another rgb(0, 128, 255)
    Some text without color.
`;

const converted = loadColorFallback(testString);
console.log("Original String:\n", testString);
console.log("\nConverted Result:\n", converted.result);
console.log("\nScore (number of conversions):", converted.score);

// Test edge cases for regex
const edgeCases = `
    rgb(0.5, 128.9, 254.1)
    hsl(359.9, 0.1%, 99.9%)
    hwb(0.0 0.0% 0.0%)
    lab(100% -128.5 127.5 / 0.7)
    lch(0% 0 -0.1 / 1)
    oklab(0.0 -0.5 0.5 / 0)
    oklch(1.0 0.5 359.9)
    #abc
    #ABCDEF
`;
const convertedEdgeCases = loadColorFallback(edgeCases);
console.log("\nEdge Cases Original:\n", edgeCases);
console.log("\nEdge Cases Converted:\n", convertedEdgeCases.result);
console.log("\nEdge Cases Score:", convertedEdgeCases.score);

// Test with HSL
console.log("Test HSL:");
// Expected output: "expected[#7b220c]: #7B220C"
console.log(loadColorFallback("expected[#7b220c]: hsl(12, 82.20%, 26.50%)"));
// Example: hsl(120, 100%, 50%) is green
console.log(loadColorFallback("My favorite color is hsl(120, 100%, 50%).")); // Expected: "My favorite color is #00FF00."

// Test with HWB
console.log("\nTest HWB:");
// Example: hwb(0 0% 0%) is red
console.log(loadColorFallback("Solid red hwb(0 0% 0%) color.")); // Expected: "Solid red #FF0000 color."
// Example: hwb(240 10% 20%) blueish with some white and black
console.log(loadColorFallback("Dark blue: hwb(240 10% 20%)")); // Expected: "Dark blue: #1A1AF5" (approx)

// Test with LAB
console.log("\nTest LAB:");
// Example: lab(53.2 80.1 67.2) is approximately sRGB red
console.log(loadColorFallback("This is a red lab(53.2 80.1 67.2) sample.")); // Expected: "This is a red #FF0000 sample." (approx)
// Example: lab(0 0 0) is black
console.log(loadColorFallback("Absolute black: lab(0 0 0)")); // Expected: "Absolute black: #000000"

// Test with LCH
console.log("\nTest LCH:");
// Example: lch(53.2 104.6 39.9) is approximately sRGB red
console.log(loadColorFallback("Bright LCH red: lch(53.2 104.6 39.9)")); // Expected: "Bright LCH red: #FF0000" (approx)
// Example: lch(100 0 0) is white
console.log(loadColorFallback("Pure white lch(100 0 0)")); // Expected: "Pure white #FFFFFF"

// Test with OKLAB
console.log("\nTest OKLAB:");
// Example: oklab(0.628 0.225 0.126) is approximately sRGB red
console.log(loadColorFallback("OKLab red: oklab(0.628 0.225 0.126)")); // Expected: "OKLab red: #FF0000" (approx)
// Example: oklab(0 0 0) is black
console.log(loadColorFallback("Another black: oklab(0 0 0)")); // Expected: "Another black: #000000"

// Test with OKLCH
console.log("\nTest OKLCH:");
// Example: oklch(0.628 0.258 29.2) is approximately sRGB red
console.log(loadColorFallback("OKLCH red: oklch(0.628 0.258 29.2)")); // Expected: "OKLCH red: #FF0000" (approx)
// Example: oklch(1 0 0) is white
console.log(loadColorFallback("Pure white OKLCH: oklch(1 0 0)")); // Expected: "Pure white OKLCH: #FFFFFF"

// Test with RGB
console.log("\nTest RGB:");
console.log(loadColorFallback("Color is rgb(255, 0, 0).")); // Expected: "Color is #FF0000."
console.log(loadColorFallback("Background: rgb(0, 128, 255);")); // Expected: "Background: #0080FF;"

// Test with HEX (handled separately in loadColorValues)
console.log("\nTest HEX:");
console.log(loadColorFallback("The old color was #f0f.")); // Expected: "The old color was #FF00FF."
console.log(loadColorFallback("And then #00ff00 and #1a2b3c.")); // Expected: "And then #00FF00 and #1A2B3C."

// Test with multiple colors in one string
console.log("\nTest Multiple Colors:");
console.log(
  loadColorFallback(
    "Primary: rgb(255, 0, 0), Secondary: hsl(240, 100%, 50%), Accent: #00FF00",
  ),
);
// Expected: "Primary: #FF0000, Secondary: #0000FF, Accent: #00FF00"
