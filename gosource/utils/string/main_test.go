package utils

import (
	"fmt"
)

func main() {
	util := Util{}

	// Example usage of Normalize
	normalizedString := util.Normalize("Hello World! 123.", []rune{'!'}, []rune{'.'}, []rune{'o'})
	fmt.Printf("Normalized string: %s\n", normalizedString) // Expected: Hell\o_W\orl_d!-123-

	// Example usage of Minify
	minifiedString := util.Minify("  Hello   World!\n\tThis is a test.  ")
	fmt.Printf("Minified string: '%s'\n", minifiedString) // Expected: 'Hello World! This is a test.'

	// Example usage of ZeroBreaks
	breaks := util.ZeroBreaks("apple,banana new line\norange", []rune{' ', ',', '\n'})
	fmt.Printf("ZeroBreaks result: %v\n", breaks) // Expected: [apple banana new line orange]

	// Example usage of EnCounter
	encoded := util.EnCounter(12345)
	fmt.Printf("Encoded number: %s\n", encoded) // Output will vary based on 'digits' and 'base'

	// Example usage of StringMem
	mem := util.StringMem("This is a test string to calculate its memory usage.")
	fmt.Printf("String memory: %.2f KB\n", mem) // Expected: 0.05 KB
}