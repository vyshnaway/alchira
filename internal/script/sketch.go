package script

import (
	"main/internal/action"
	"maps"
	"strings"
)

func SketchBuilder(index int, method E_Method, appendstack map[int]bool) string {
	subappendstack := make(map[int]bool, len(appendstack))
	maps.Copy(subappendstack, appendstack)
	subappendstack[index] = true

	data := action.Index_Fetch(index)
	context := *data.Context
	resoled := ResolveHandles(data.SrcData.Metadata.SketchSnippet, data.SrcData.Metadata.Handles, true, false, false)
	context.Content = resoled
	context.Midway = resoled

	result := Rider(&context, method, subappendstack).Scribed
	return ResolveHandles(result, data.SrcData.Metadata.Handles, false, true, true)
}

func MacroSketcher(content string, index int, method E_Method, appendstack map[int]bool) string {
	data := action.Index_Fetch(index)
	subappendstack := make(map[int]bool, len(appendstack))
	maps.Copy(subappendstack, appendstack)

	context2 := *data.Context
	resoled := ResolveHandles(content, data.SrcData.Metadata.Handles, false, true, true)
	context2.Content = resoled
	context2.Midway = resoled

	return Rider(&context2, method, subappendstack).Scribed
}

func ResolveHandles(content string, macros []string, preInject, inject, postInject bool) string {
	for _, mac := range macros {
		if ((mac[0] == '<' && preInject) ||
			(mac[0] == '=' && inject) ||
			(mac[0] == '>' && postInject)) &&
			len(mac) > 1 {
			t, _ := Tokenize(mac[1:])
			if len(t.Sym) > 0 && len(t.Raw) > 0 {
				content = strings.ReplaceAll(content, t.Sym, t.Raw)
			}
		}
	}
	return content
}
