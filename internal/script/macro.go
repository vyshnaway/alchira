package script

import (
	"fmt"
	"main/configs"
	"main/internal/action"
	"main/internal/macro"
	"main/models"
	"maps"
	"strconv"
	"strings"
)

func Macro_Builder(
	commands []string,
	method E_Method,
	fileData *models.File_Stash,
	appendstack map[int]bool,
) string {

	Stack := macro.NewAst()
	subappendstack := make(map[int]bool, len(appendstack))
	maps.Copy(subappendstack, appendstack)

	for _, cmd := range commands {
		T, K := Stack.Tokenize(cmd, true)
		if !K {
			continue
		}

		if T.Mul0Mod1 {
			if T.Instance == 0 {
				if modifier, ok := macro.Modifiers[T.Modify]; ok {
					if reg, exist := Stack.Register.Get(T.Register); exist {
						uses := []string{}
						if subreg, exist := Stack.Register.Get(T.Target); exist && (len(T.Target) > 0) {
							subsubappendstack := make(map[int]bool, len(subappendstack))
							maps.Copy(subsubappendstack, subsubappendstack)
							uses = MacroSketcher(subreg.Array[0], subreg.Index, method, subsubappendstack)
						}
						Stack.Render.Array = modifier(reg.Array, uses, T.Arguments)
					}
				}
			} else if reg, exist := Stack.Register.Get(T.Register); exist {
				instances, _ := strconv.Atoi(T.Target)
				for i, v := range reg.Array {
					reg.Array[i] = strings.Replace(v, T.Modify, T.Arguments, instances)
				}
			}
		} else {
			res := action.Index_Finder(T.Arguments, fileData.Cache.LocalMap)

			// if T.Instance > 0 {
			// } else if {

			// }
			// if T.Instance == 0 && len(T.Register) > 0 {
			// 	Stack.Const.Set(T.Register, T.Operation)
			// }

			val := T.Val

			if res.Index > 0 && T.Int > 0 {
				configs.Style.Sketchpad.Mac[T.Val] = res.Index
				if !appendstack[res.Index] {
					subappendstack[res.Index] = true
					val = res.Data.SrcData.Metadata.SketchSnippet
				}
			} else if T.Int == 0 {
				T.Int = 1
			}

			if len(T.Sym) > 0 {
				var s strings.Builder
				for range T.Int {
					s.WriteString(val)
				}
				superval := s.String()
				for i, m := range macrostack {
					macrostack[i].value = strings.ReplaceAll(m.value, T.Sym, superval)
				}
				register.Set(T.Sym, val)
			} else if len(val) > 0 {
				submacros := []string{}
				if res.Index > 0 {
					submacros = res.Data.SrcData.Metadata.Macros
					val = ApplyCommand(val, submacros, true, false, false)
				}
				macrostack = append(macrostack, &Stack{index: res.Index, cycle: T.Int, macro: submacros, value: val})
			}
		}
	}

	var compose strings.Builder

	for _, m := range macrostack {
		for range m.cycle {
			if m.index == 0 {
				compose.WriteString(m.value)
			} else {
				compose.WriteString(MacroSketcher(m.value, m.index, method, subappendstack))
			}
		}
	}
	fmt.Println("------")

	return compose.String()
}

func Marcro_Reader(
	lines []string,
) map[string]bool {
	symlinks := map[string]bool{}
	ast := macro.NewAst()
	for _, line := range lines {
		if tkn, ok := ast.Tokenize(line, false); ok && tkn.Instance > 0 {
			symlinks[tkn.Arguments] = true
		}
	}

	return symlinks
}
