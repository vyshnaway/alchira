package style

import (
	_cache_ "main/cache"
	blockmap "main/class/Blockmap"

	// "main/shell"
	_types_ "main/types"
	_utils_ "main/utils"
	_maps_ "maps"
)

type cssfile_Parse_return struct {
	Result      [][2]any
	Attachments []string
	Variables   map[string]string
}

func Cssfile_Parse(content string, initial string, verbose bool) cssfile_Parse_return {
	scanned := Block_Parse(_utils_.Code_Uncomment(content, false, true, false))
	styles := [][2]any{}
	for _, kv := range scanned.AtProps {
		styles = append(styles, [2]any{kv[0], kv[1]})
	}

	variables := map[string]string{}
	attachments := []string{}
	for _, kv := range scanned.AllBlocks {
		key := kv[0]
		value := kv[1]
		result := Parse_CssSnippet(value, initial, key, true, verbose)
		_maps_.Copy(variables, result.Variables)
		attachments = append(attachments, result.Attachments...)
		styles = append(styles, [2]any{key, result.Result})
	}

	return cssfile_Parse_return{
		Result:      styles,
		Attachments: attachments,
		Variables:   variables,
	}
}

type cssfile_Collection_return struct {
	MetadataCollection _types_.File_MetadataMap
	SelectorList       []string
}

func Cssfile_Collection(files []_types_.File_Stash, forArtifact bool, verbose bool) cssfile_Collection_return {
	selectorList := []string{}
	selectors := map[string]int{}
	indexMetaCollection := _types_.File_MetadataMap{}
	var IndexMap map[string]int

	if forArtifact {
		IndexMap = _cache_.Style.Artifact_Index
	} else {
		IndexMap = _cache_.Style.Library__Index
	}

	for _, file := range files {
		for _, so := range Block_Parse(_utils_.Code_Uncomment(file.Content, false, true, false)).AllBlocks {
			selector := so[0]
			value := so[1]

			declaration := file.SourcePath
			classname := file.ClassFront + _utils_.String_Filter(selector, []rune{}, []rune{'\\', '.'}, []rune{})

			index := 0
			if v, ok := IndexMap[classname]; ok {
				index = v
			}
			if v, ok := selectors[classname]; ok {
				index = v
			}

			if index > 0 {
				classdata := _cache_.Index_Fetch(index)
				classdata.Metadata.Declarations = append(classdata.Metadata.Declarations, declaration)
			} else {
				stylescanned := Parse_CssSnippet(
					value,
					string(file.Manifest.Lookup.Type)+" : "+file.FilePath+" |",
					selector,
					false,
					verbose,
				)
				attachments := stylescanned.Attachments
				object := stylescanned.Result

				artifact := _cache_.Archive.Name
				if forArtifact {
					artifact = file.Artifact
					for i, v := range attachments {
						attachments[i] = file.ClassFront + v
					}
				}

				classdata := _types_.Style_ClassData{
					Index:    0,
					Artifact: artifact,
					Definent: selector,
					SymClass: classname,
					Metadata: _types_.Style_Metadata{
						Info:         []string{},
						WatchClass:   "",
						Variables:    stylescanned.Variables,
						Skeleton:     object.Skeleton(),
						Declarations: []string{declaration},
						Summon:       "",
						Attributes:   map[string]string{},
					},
					StyleObject:   object,
					Attachments:   attachments,
					DebugClass:    file.DebugFront + "_" + _utils_.String_Filter(classname, []rune{}, []rune{}, []rune{'$', '/'}),
					Declarations:  []string{declaration},
					SnippetStaple: "",
					SnippetStyle: func() blockmap.Class {
						var r blockmap.Class
						if k, v := object.GetBlock(""); k {
							r = *v
						} else {
							r = *blockmap.New()
						}
						return *blockmap.New().SetBlock(selector, r)
					}(),
				}
				index := _cache_.Index_Declare(classdata)
				file.StyleData.UsedIn = append(file.StyleData.UsedIn, index)
				selectors[classname] = index
				indexMetaCollection[classname] = &classdata.Metadata
				selectorList = append(selectorList, classname)

				// shell.Render.Raw(classdata)

			}
		}
	}

	_maps_.Copy(IndexMap, selectors)

	return cssfile_Collection_return{
		MetadataCollection: indexMetaCollection,
		SelectorList:       selectorList,
	}
}
