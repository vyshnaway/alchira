package macro_test

import (
	"main/internal/macro"
	"testing"
)

func Test_Ast(t *testing.T) {
	lines := []string{
		"$Key = ~",
		"$Key = ~$asdf",
		"$Key = 3 ~ $asdf | as",
		// "$Key = 3*asdf{{replace}}",
		// "$Key | 3*asdf{{replace}}",
		// "$Key | {{replace}}*asdfs",
		// "$Key | {{replace}}=asdfs",
		// "$Key | Modifier/Assist:args",
		// "= 3*asdf",
		// "| {replace} / 3 = asdf",
		// "| Modifier / $Key : args",
		"k = 0 ~ $ | a, b, c",
	}

	ast_0 := macro.NewAst()
	// ast_1 := macro.NewAst()
	for _, l := range lines {
		ast_0.Tokenize(l, true)
		// ast_1.Tokenize(l, false)
	}

	// console.Render.Raw(ast_1)
}

// "< $Key = 3*asdf{{replace}}",
// "< $Key | 3*asdf{{replace}}",
// "| $Key | {{replace}}*asdfs",
// "= $Key = {{replace}}=asdfs",
// "| $Key | Modifier/Assist:args",
// "| = 3*asdf",
// "> {replace} / 3 = asdf",
// "> Modifier / $Key : args",
