package script

import (
	"main/internal/action"
	"main/models"
	"maps"
)

func SketchBuilder(index int, method E_Method, appendstack map[int]bool) string {
	subappendstack := make(map[int]bool, len(appendstack))
	maps.Copy(subappendstack, appendstack)
	subappendstack[index] = true

	ref := action.Index_Fetch(index)
	context := *ref.Context
	context.Content = ref.SrcData.Metadata.SketchSnippet
	context.Midway = ref.SrcData.Metadata.SketchSnippet

	return Rider(&context, method, subappendstack).Scribed
}

func MacroSketcher(content string, context *models.File_Stash, method E_Method, appendstack map[int]bool) string {
	subappendstack := make(map[int]bool, len(appendstack))
	maps.Copy(subappendstack, appendstack)

	context2 := *context
	context2.Content = content
	context2.Midway = content

	return Rider(&context2, method, subappendstack).Scribed
}
