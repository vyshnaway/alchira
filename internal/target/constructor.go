package target

import (
	_config "main/configs"
	"main/internal/action"
	_style "main/internal/style"
	_model "main/models"
	"main/package/css"
	_fileman "main/package/fileman"
	"main/package/utils"
	_map "maps"
	_slice "slices"
)

type Class struct {
	Source           string
	Target           string
	Stylesheet       string
	SourceStylesheet string
	TargetStylesheet string

	Label              string
	Extensions         []string
	ExtnsProps         map[string][]string
	StylesheetContext  *_model.File_Stash
	StylesheetBlockSeq *css.T_BlockSeq
	FileCache          map[string]*_model.File_Stash
}

func New(storage _model.Config_ProxyStorage, label string) *Class {
	storage.Extensions[_config.Root.Extension] = []string{}

	stylesheetContext := action.Store(
		action.Store_FileGroup_Target,
		storage.Stylesheet,
		storage.StylesheetContent,
		storage.Target,
		storage.Source,
		utils.String_EnCounter(0),
	)
	res := _style.Cssfile_String(storage.StylesheetContent, `APPENDIX : `+storage.Stylesheet+" | ")
	stylesheetContext.StyleData.Attachments = res.Attachments

	var This = Class{
		Source:             storage.Source,
		Target:             storage.Target,
		Stylesheet:         storage.Stylesheet,
		StylesheetBlockSeq: res.Result,
		StylesheetContext:  stylesheetContext,
		SourceStylesheet:   _fileman.Path_Join(storage.Source, storage.Stylesheet),
		TargetStylesheet:   _fileman.Path_Join(storage.Target, storage.Stylesheet),
		Label:              label,
		Extensions:         _slice.Collect(_map.Keys(storage.Extensions)),
		ExtnsProps:         storage.Extensions,
		FileCache:          map[string]*_model.File_Stash{},
	}

	index := 1
	for filepath, filecontent := range storage.Filepath_to_Content {
		This.Savefile(filepath, filecontent, index)
		index++
	}

	return &This
}
