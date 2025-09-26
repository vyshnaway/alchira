package style

import (
	_cache_ "main/cache"
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
	scanned := block_Parse(_utils_.Code_Uncomment(content, false, true, false), true)
	styles := [][2]any{}
	for _, kv := range scanned.XatProps {
		styles = append(styles, [2]any{kv[0], kv[1]})
	}

	variables := map[string]string{}
	attachments := []string{}
	for _, kv := range scanned.XallBlocks {
		key := kv[0]
		value := kv[1]
		result := parse_CssSnippet(value, initial, key, true, verbose)
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
	MetadataCollection _types_.File_SymclassMetadataMap
	SelectorList       []string
}

func Cssfile_Collection(files *[]_types_.File_Stash, forArtifact bool, verbose bool) cssfile_Collection_return {
	selectorList := []string{}
	selectors := map[string]int{}
	indexMetaCollection := _types_.File_SymclassMetadataMap{}
	var IndexMap map[string]int
	if forArtifact {
		IndexMap = _cache_.Style.Artifact_Index
	} else {
		IndexMap = _cache_.Style.Library__Index
	}

	for _, file := range *files {
		// 		{ classFront, filePath, debugclassFront, content, manifesting: manifest } = source;
		for _, so := range block_Parse(_utils_.Code_Uncomment(file.Content, false, true, false), true).XallBlocks {
			selector := so[0]
			value := so[1]

			declaration := file.SourcePath
			classname := file.ClassFront + _utils_.String_Filter(selector, []rune{}, []rune{'\\', '.'}, []rune{})

			index := 0
			if v, ok := IndexMap[classname]; ok {
				index += v
			}
			if v, ok := selectors[classname]; ok {
				index += v
			}

			if index > 0 {
				classdata := _cache_.Index_Fetch(index)
				classdata.Metadata.Declarations = append(classdata.Metadata.Declarations, declaration)
			} else {
				stylescanned := parse_CssSnippet(
					value,
					string(file.Manifest.Lookup.Type)+" : "+file.FilePath+" |",
					selector,
					false,
					verbose,
				)
				attachments := stylescanned.Attachments

				object := map[string]map[string]any{}
				for k, v := range stylescanned.Result {
					v_typed, v_ok := v.(map[string]any)
					if v_ok {
						object[k] = v_typed
					} else {
						object[""] = stylescanned.Result
					}
				}

				artifact := _cache_.Static.Archive.Name
				if forArtifact {
					artifact = file.Artifact
					for i, v := range attachments {
						attachments[i] = file.ClassFront + v
					}
				}

				skeleton := map[string]any{}
				for k, v := range object {
					s := _utils_.Map_Skeleton(v)
					if len(s) > 0 {
						skeleton[k] = s
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
						Skeleton:     skeleton,
						Declarations: []string{declaration},
						Summon:       "",
						Attributes:   map[string]string{},
					},
					StyleObject:   object,
					Attachments:   attachments,
					DebugClass:    file.DebugFront + "_" + _utils_.String_Filter(classname, []rune{}, []rune{}, []rune{'$', '/'}),
					Declarations:  []string{declaration},
					SnippetStaple: "",
					SnippetStyle:  map[string]any{selector: object[""]},
				}
				index := _cache_.Index_Declare(classdata)
				file.StyleData.UsedIndexes = append(file.StyleData.UsedIndexes, index)
				selectors[classname] = index
				indexMetaCollection[classname] = &classdata.Metadata
				selectorList = append(selectorList, classname)
			}
		}
	}

	for k, v := range selectors {
		IndexMap[k] = v
	}

	return cssfile_Collection_return{
		MetadataCollection: indexMetaCollection,
		SelectorList:       selectorList,
	}
}
