package actions

import (
	"main/configs"
	"main/internal/action"
)

func Template(symclass, filepath string)string {

	context := configs.Style.Filepath_to_Context[filepath]
	if context == nil {
		return ""
	}

	ref := action.Index_Find(symclass, context.StyleData.LocalMap)
	if ref.Index == 0 {
		return ""
	}

	return ref.Data.SrcData.SummonSnippet
}
