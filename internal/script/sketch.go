package script

import (
	"fmt"
	"main/internal/action"
	"main/internal/macro"
	"maps"
	"strings"
)

func SketchBuilder(index int, method E_Method, appendstack map[int]bool) string {
	subappendstack := make(map[int]bool, len(appendstack))
	maps.Copy(subappendstack, appendstack)
	subappendstack[index] = true

	data := action.Index_Fetch(index)
	context := *data.Context
	resoled := ApplyCommand(data.SrcData.Metadata.SketchSnippet, data.SrcData.Metadata.Macros, true, false, false)
	context.Content = resoled
	context.Midway = resoled

	result := Rider(&context, method, subappendstack).Scribed
	return ApplyCommand(result, data.SrcData.Metadata.Macros, false, true, true)
}

func MacroSketcher(content string, index int, method E_Method, appendstack map[int]bool) string {
	data := action.Index_Fetch(index)
	subappendstack := make(map[int]bool, len(appendstack))
	maps.Copy(subappendstack, appendstack)

	context2 := *data.Context
	resoled := ApplyCommand(content, data.SrcData.Metadata.Macros, false, true, true)
	context2.Content = resoled
	context2.Midway = resoled

	return Rider(&context2, method, subappendstack).Scribed
}

func ApplyCommand(content string, macros []string, preInject, inject, postInject bool) string {
	fmt.Println(content)
	for _, mac := range macros {

		if len(mac) < 2 {
			continue
		}
		op := mac[0]

		if (op == '<' && preInject) ||
			(op == '=' && inject) ||
			(op == '>' && postInject) {
			T := macro.Tokenizer(mac[1:])

			if T.Sym[0] == '|' {
				if mod := macro.Modifiers[T.Sym]; mod != nil {
					content = mod(T.Sym[1:], []string{T.Raw}, []string{})[0]
				}
			} else if len(T.Sym) > 0 && len(T.Raw) > 0 {
				content = strings.ReplaceAll(content, T.Sym, T.Raw)
			}
		}

		fmt.Println("---")
		fmt.Println(mac)
		fmt.Println("---")
		fmt.Println(content)
	}
	fmt.Println("------")

	return content
}
