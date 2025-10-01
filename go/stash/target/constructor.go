package stash

import (
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	_types_ "main/types"
	_maps_ "maps"
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
	FileCache  map[string]_types_.File_Stash
}

func New(storage _types_.Config_ProxyStorage, label string) Class {
	storage.Extensions[_cache_.Root.Extension] = []string{}
	extentions := []string{}

	for extention := range _maps_.Keys(storage.Extensions) {
		extentions = append(extentions, extention)
	}

	var This = Class{
		Source:            storage.Source,
		Target:            storage.Target,
		Stylesheet:        storage.Stylesheet,
		SourceStylesheet:  _fileman_.Path_Join(storage.Source, storage.Stylesheet),
		TargetStylesheet:  _fileman_.Path_Join(storage.Target, storage.Stylesheet),
		StylesheetContent: storage.StylesheetContent,
		Label:             label,
		Extensions:        extentions,
		ExtnsProps:        storage.Extensions,
		FileCache:         map[string]_types_.File_Stash{},
	}

	index := 1
	for filepath, filecontent := range storage.Filepath_to_Content {
		This.Savefile(filepath, filecontent, index)
		index++
	}

	return This
}
