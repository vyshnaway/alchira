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

func MacroSketcherArray(regs macro.REG, index int, method E_Method) macro.REG {
	data := action.Index_Fetch(index)
	regs.Used[regs.Index] = true

	for i, content := range regs.Array {
		context2 := *data.Context
		context2.Content = content
		context2.Midway = content
		regs.Array[i] = Rider(&context2, method, regs.Used).Scribed
	}
	return regs
}
