package style

import (
	_config "main/configs"
	_action "main/internal/action"
	_css "main/package/css"

	_model "main/models"
	_util "main/package/utils"
	_map "maps"
)

type cssfile_Parse_return struct {
	Result      *_css.T_Block
	Attachments []string
	Variables   map[string]string
}

func Cssfile_Parse(content string, initial string, verbose bool) cssfile_Parse_return {
	scanned := _css.ParsePartial(_util.Code_Uncomment(content, false, true, false))
	result := _css.NewBlock()
	for _, d := range scanned.Directives {
		result.SetProp(d, "")
	}

	variables := map[string]string{}
	attachments := []string{}
	for _, kv := range scanned.All_Blocks {
		key := kv[0]
		val := kv[1]
		res := Parse_CssSnippet(val, initial, key, true, verbose)
		_map.Copy(variables, res.Variables)
		attachments = append(attachments, res.Attachments...)
		result.SetBlock(key, res.Result)
	}

	return cssfile_Parse_return{
		Result:      result,
		Attachments: attachments,
		Variables:   variables,
	}
}

type cssfile_Collection_return struct {
	MetadataCollection _model.File_MetadataMap
	SelectorList       []string
}

func Cssfile_Collection(files []_model.File_Stash, verbose bool) cssfile_Collection_return {
	selectorList := []string{}
	selectors := map[string]int{}
	indexMetaCollection := _model.File_MetadataMap{}

	for _, file := range files {
		for _, so := range _css.ParsePartial(_util.Code_Uncomment(file.Content, false, true, false)).All_Blocks {
			selector := so[0]
			value := so[1]

			declaration := file.SourcePath
			classname := file.ClassFront + _util.String_Filter(selector, []rune{}, []rune{'\\', '.'}, []rune{})

			index := 0
			if v, ok := _config.Style.Library__Index[classname]; ok {
				index = v
			}
			if v, ok := selectors[classname]; ok {
				index = v
			}

			if index > 0 {
				classdata := _action.Index_Fetch(index)
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

				artifact := _config.Archive.Name

				metadata := _model.Style_Metadata{
					Info:         []string{},
					WatchClass:   "",
					Variables:    stylescanned.Variables,
					Skeleton:     object.Skeleton(),
					Declarations: []string{declaration},
					Summon:       "",
					Attributes:   map[string]string{},
				}
				classdata := _model.Style_ClassData{
					Index:         0,
					Artifact:      artifact,
					Definent:      selector,
					SymClass:      classname,
					Metadata:      &metadata,
					StyleObject:   object,
					Attachments:   attachments,
					DebugClass:    file.DebugFront + "_" + _util.String_Filter(classname, []rune{}, []rune{}, []rune{'$', '/'}),
					Declarations:  []string{declaration},
					SnippetStaple: "",
					SnippetStyle: func() *_css.T_Block {
						if k, v := object.GetBlock(""); k {
							return _css.NewBlock().SetBlock(selector, v)
						} else {
							return _css.NewBlock()
						}
					}(),
				}
				index := _action.Index_Declare(classdata)
				file.StyleData.UsedIn = append(file.StyleData.UsedIn, index)
				selectors[classname] = index
				indexMetaCollection[classname] = &metadata
				selectorList = append(selectorList, classname)
			}
		}
	}

	_map.Copy(_config.Style.Library__Index, selectors)

	return cssfile_Collection_return{
		MetadataCollection: indexMetaCollection,
		SelectorList:       selectorList,
	}
}
