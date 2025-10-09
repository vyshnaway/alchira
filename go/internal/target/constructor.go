package target

import (
	_config "main/configs"
	_fileman "main/package/fileman"
	_model "main/models"
	_map "maps"
	_slice "slices"
)

type Class struct {
	Source            string
	Target            string
	Stylesheet        string
	SourceStylesheet  string
	TargetStylesheet  string
	StylesheetContent string

	Label      string
	Extensions []string
	ExtnsProps map[string][]string
	FileCache  map[string]_model.File_Stash
}

func New(storage _model.Config_ProxyStorage, label string) Class {
	storage.Extensions[_config.Root.Extension] = []string{}

	var This = Class{
		Source:            storage.Source,
		Target:            storage.Target,
		Stylesheet:        storage.Stylesheet,
		SourceStylesheet:  _fileman.Path_Join(storage.Source, storage.Stylesheet),
		TargetStylesheet:  _fileman.Path_Join(storage.Target, storage.Stylesheet),
		StylesheetContent: storage.StylesheetContent,
		Label:             label,
		Extensions:        _slice.Collect(_map.Keys(storage.Extensions)),
		ExtnsProps:        storage.Extensions,
		FileCache:         map[string]_model.File_Stash{},
	}

	index := 1
	for filepath, filecontent := range storage.Filepath_to_Content {
		This.Savefile(filepath, filecontent, index)
		index++
	}

	return This
}
