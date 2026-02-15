package script

import (
	"main/configs"
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

		index := 0
		helper := []string{}
		if reg, ok := Stack.Register.Get(T.Helper); ok && len(T.Helper) > 0 {
			helper = append(helper, reg.Array...)
		} else if refer := action.Index_Finder(T.Helper, context.Cache.LocalMap); refer.Index > 0 {
			if !appendstack[refer.Index] {
				index = refer.Index
				configs.Style.Sketchpad.Mac[T.Helper] = index
				s := SketchCompile(refer.Index, method, subappendstack)
				helper = append(helper, s)
			} else {
				helper = append(helper, "")
			}
		} else {
			helper = append(helper, T.Helper)
		}

		var register *macro.REG
		if reg, ok := Stack.Register.Get(T.Register); ok {
			register = reg
		}

		switch T.OpRefer.Type {

		case macro.E_Op_Instances:
			instances := []string{}
			for range T.OpRefer.Instance {
				instances = append(instances, helper...)
			}
			Stack.RegSet(index, T.Register, instances)

		// TODO: Macro Modifiers to be resolved Later
		// case macro.E_Op_Modifier:
		// 	Stack.RegSet(index, T.Register, T.OpRefer.Modifier(register.Array, helper, T.Arguments))

		case macro.E_Op_Replace:
			hl := len(helper)
			rl := len(register.Array)

			if hl > 0 && rl > 0 {
				itr := int(math.Max(float64(hl), float64(rl)))
				outs := make([]string, itr)
				i := 0
				for i < itr {
					hi := itr % hl
					ri := itr % rl
					outs[i] = strings.ReplaceAll(register.Array[ri], T.Operand, helper[hi])
					i++
				}
				Stack.RegSet(index, T.Register, outs)
			}
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
		if tkn := ast.Tokenize(line, false); tkn.OpRefer.Type != macro.E_Op_Invalid && len(tkn.Helper) > 0 {
			symlinks[tkn.Helper] = true
		}
	}

	return symlinks
}
