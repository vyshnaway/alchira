package utils

import (
	"fmt"
)

func main() {
	// --- Test isInString ---
	fmt.Println("--- Testing isInString ---")
	jsCode := `const a = "hello"; const b = 'world'; const c = ` + "`template literal`" + `; // comment`
	fmt.Printf("Is index 10 in string ('hello'): %t\n", isInString(jsCode, 10))                       // Inside "hello"
	fmt.Printf("Is index 25 in string ('world'): %t\n", isInString(jsCode, 25))                       // Inside 'world'
	fmt.Printf("Is index 45 in string (`template literal`): %t\n", isInString(jsCode, 45))            // Inside `template literal`
	fmt.Printf("Is index 55 in string (after literal, before comment): %t\n", isInString(jsCode, 55)) // Outside
	fmt.Printf("Is index 65 in string (inside comment): %t\n", isInString(jsCode, 65))                // Outside
	fmt.Println()

	// --- Test stripComments ---
	fmt.Println("--- Testing stripComments (Script) ---")
	jsContent := `
	// This is a single-line comment
	const myVar = "value with // inside string"; /* This is a multi-line comment */
	/* Another
	   multi-line
	   comment */
	const anotherVar = ` + "`template with /* comment */ inside`" + `;
	<!-- HTML comment in JS -->
	function test() {
		// More comments
		console.log("Hello"); // Inline comment
	}
	`
	strippedJs := stripComments(jsContent)
	fmt.Printf("Original JS:\n%s\nStripped JS:\n%s\n", jsContent, strippedJs)
	fmt.Println()

	// // --- Test JSONC ---
	// fmt.Println("--- Testing JSONC ---")
	// jsoncContent := `
	// {

	// .item {
	// 	display: flex;
	// }
	// `
	// strippedCss := UncommentUtil.Css(cssContent)
	// fmt.Printf("Original CSS:\n%s\nStripped CSS:\n%s\n", cssContent, strippedCss)
	// fmt.Println()

	// --- Test minifyCssAggressive ---
	fmt.Println("--- Testing minifyCssAggressive ---")
	cssAggressiveContent := `
	.button {
		padding: 10px 20px 10px 20px;
		margin: 0px;
		background-color: rgb(255, 0, 0);
		color: #ffffff;
		border: 1px solid #cccccc;
		font-size: 16px !important;
	}
	.header {
		font-weight: bold;
		line-height: 1.5em;
		box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1);
	}
	`
	minifiedAggressive := MinifyUtil.Strict(cssAggressiveContent)
	fmt.Printf("Original CSS:\n%s\nMinified Aggressive CSS:\n%s\n", cssAggressiveContent, minifiedAggressive)
	fmt.Println()

	// --- Test minifyCssLite ---
	fmt.Println("--- Testing minifyCssLite ---")
	cssLiteContent := `
	.card {
		  background :   #f0f0f0 ;
		padding: 10px   ;
		border-radius: 5px;
	}
	`
	minifiedLite := MinifyUtil.Lite(cssLiteContent)
	fmt.Printf("Original CSS:\n%s\nMinified Lite CSS:\n%s\n", cssLiteContent, minifiedLite)
	fmt.Println()
}
