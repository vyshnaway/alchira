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

		var register *macro.REG
		if reg, ok := Stack.Register.Get(T.Register); ok {
			register = reg
		}

		index := 0
		helper := []string{}
		if reg, ok := Stack.Register.Get(T.Helper); ok {
			helper = append(helper, reg.Array...)
		} else if refer := action.Index_Finder(T.Helper, context.Cache.LocalMap); refer.Index > 0 {
			index = refer.Index
			s := SketchCompiler(refer.Index, method, subappendstack)
			helper = append(helper, s)
		} else {
			helper = append(helper, T.Helper)
		}

		switch T.OpRefer.Type {
		case macro.E_Op_Instances:
			instances := []string{}
			for range T.OpRefer.Instance {
				instances = append(instances, helper...)
			}
			Stack.RegSet(index, T.Register, instances)
		case macro.E_Op_Modifier:
			Stack.RegSet(index, T.Register, T.OpRefer.Modifier(register.Array, helper, T.Arguments))
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
			Stack.RegSet(index, T.Register, outs)
		}
	}

	return Stack.Render()
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
