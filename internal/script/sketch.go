package script

import (
	"main/internal/action"
	"main/internal/macro"
	"maps"
)

func MacroSketchByArray(regs *macro.REG, index int, method E_Method) *macro.REG {
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

// func ApplyModifier(tokens) []string {
// 	if modifier, ok := macro.Modifiers[T.Modify]; ok {
// 		if reg, exist := Stack.Register.Get(T.Register); exist {
// 			uses := []string{}
// 			if subreg, exist := Stack.Register.Get(T.Target); exist && (len(T.Target) > 0) {
// 				subsubappendstack := make(map[int]bool, len(subappendstack))
// 				maps.Copy(subsubappendstack, subsubappendstack)
// 				uses = MacroSketchByArray(subreg, subreg.Index, method).Array
// 			}
// 			Stack.Render.Array = modifier(reg.Array, uses, T.Arguments)
// 		}
// 	}
// }