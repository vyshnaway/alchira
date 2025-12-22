package macro_test

import (
	"main/internal/macro"
	"main/package/console"
	"testing"
)

func Test_Ast(t *testing.T) {
	lines := []string{
		"$Key = $asdf",
		"$Key = 3*asdf{{replace}}",
		"$Key | 3*asdf{{replace}}",
		"$Key | {{replace}}*asdfs",
		"$Key | {{replace}}=asdfs",
		"$Key | Modifier:args",
		"= 3*asdf",
		"| {replace}=asdf",
		"| Modifier:args",
	}

	ast_0 := macro.NewAst()
	// ast_1 := macro.NewAst()
	for _, l := range lines {
		ast_0.Tokenize(l, true)
		// ast_1.Tokenize(l, true)
	}

	console.Render.Raw(ast_0)
	// console.Render.Raw(ast_1)
}
