package handle

import (
	"main/configs"
	"main/internal/action"
)

func Symclass_Summon(symclass, filepath string) string {

	context := configs.Style.Filepath_to_Context[filepath]
	if context == nil {
		return ""
	}

	ref := action.Index_Finder(symclass, context.StyleData.LocalMap)
	if ref.Index == 0 {
		return ""
	}

	return ref.Data.SrcData.Metadata.SummonSnippet
}
