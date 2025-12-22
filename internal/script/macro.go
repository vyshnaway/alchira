package script

import (
	"fmt"
	"main/configs"
	"main/internal/action"
	"main/internal/macro"
	"main/models"
	"main/package/object"
	"maps"
	"strings"
)

func Macro_Builder(
	commands []string,
	method E_Method,
	fileData *models.File_Stash,
	appendstack map[int]bool,
) string {
	var register = object.New[string, string](4)

	stack := macro.NewAst()
	subappendstack := make(map[int]bool, len(appendstack))
	maps.Copy(subappendstack, appendstack)

	for _, cmd := range commands {
		T, K := stack.Tokenize(cmd, true)
		if !K {
			continue
		}

		if T.Instance == 0 {

		} else {
			res := action.Index_Finder(T.Argument, fileData.Cache.LocalMap)

		}
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
			macrostack = append(macrostack, &stack{index: res.Index, cycle: T.Int, macro: submacros, value: val})
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
			symlinks[tkn.Argument] = true
		}
	}

	return symlinks
}
