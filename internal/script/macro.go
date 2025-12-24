package script

import (
	"main/internal/action"
	"main/internal/macro"
	"main/models"
	"maps"
	"math"
	"strings"
)

const ()

func Macro_Builder(
	commands []string,
	method E_Method,
	context *models.File_Stash,
	appendstack map[int]bool,
) string {

	Stack := macro.NewAst()
	subappendstack := make(map[int]bool, len(appendstack))
	maps.Copy(subappendstack, appendstack)

	for _, cmd := range commands {
		T := Stack.Tokenize(cmd, true)
		if T.OpRefer.Type == macro.E_Op_Invalid {
			continue
		}

		helper := []string{}
		var register *macro.REG
		if reg, ok := Stack.Register.Get(T.Register); ok {
			register = reg
		}

		if reg, ok := Stack.Register.Get(T.Helper); ok {
			helper = append(helper, reg.Array...)
		} else if refer := action.Index_Finder(T.Helper, context.Cache.LocalMap); refer.Index > 0 {
			s := SketchCompiler(refer.Index, method, subappendstack)
			helper = append(helper, s)
		} else {
			helper = append(helper, T.Helper)
		}

		switch T.OpRefer.Type {
		case macro.E_Op_Instances:
			Stack.RegSet(0, T.Register, helper)
		case macro.E_Op_Modifier:
			Stack.RegSet(0, T.Register, T.OpRefer.Modifier(register.Array, helper, T.Arguments))
		case macro.E_Op_Replace:
			hl := len(helper)
			rl := len(register.Array)
			itr := int(math.Max(float64(hl), float64(rl)))
			outs := make([]string, itr)

			i := 0
			for i < itr {
				hi := itr % hl
				ri := itr % rl
				outs[i] = strings.Replace(register.Array[ri], T.Operand, helper[hi], T.OpRefer.Instance)
				i++
			}
			Stack.RegSet(0, T.Register, outs)
		}
	}

	var compose strings.Builder

	if Stack.Render.Index > 0 {
		for _, v := range Stack.Render.Array {
			compose.WriteString(v)
		}
	} else {
		for _, v := range Stack.Render.Array {
			compose.WriteString(v)
		}
	}

	return compose.String()
}

func Marcro_Reader(
	lines []string,
) map[string]bool {
	symlinks := map[string]bool{}
	ast := macro.NewAst()
	for _, line := range lines {
		if tkn := ast.Tokenize(line, false); tkn.OpRefer.Type != macro.E_Op_Invalid && len(tkn.Register) > 0 {
			symlinks[tkn.Register] = true
		}
	}

	return symlinks
}
