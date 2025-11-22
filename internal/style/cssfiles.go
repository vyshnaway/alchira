package style

import (
	_config "main/configs"
	_action "main/internal/action"
	_css "main/package/css"
	O "main/package/object"
	_map "maps"
	_strconv "strconv"

	_model "main/models"
	_util "main/package/utils"
)

type R_Cssfile_Parse struct {
	Result      *_css.T_BlockSeq
	Attachments map[string]bool
	Variables   *O.T[string, string]
}

func Cssfile_String(content string, initial string) R_Cssfile_Parse {
	scanned := _css.ParsePartial(_util.Code_Uncomment(content, false, true, false), 32)
	result := _css.NewBlockSeq(8)
	for _, d := range scanned.Directives {
		result.AddDirective(d.Data[0])
	}

	variables := O.New[string, string](36)
	attachments := make(map[string]bool, 8)
	for _, r := range scanned.All_Blocks {
		key := r.Data[0]
		val := r.Data[1]
		res := Parse_CssSnippet(val, initial, key, true)

		variables.Copy(res.Variables)
		_map.Copy(attachments, res.Attachments)
		result.AddNewBlock(key, res.Result)
	}

	return R_Cssfile_Parse{
		Result:      result,
		Attachments: attachments,
		Variables:   variables,
	}
}

type cssfile_Collection_return struct {
	SelectorMap  _model.Style_ClassIndexMap
	SelectorList []string
}

var initialparse_allocation = 48

func Cssfile_Collection(files []*_model.File_Stash) cssfile_Collection_return {
	selectorList := make([]string, 0, len(files)*initialparse_allocation)
	selectorMap := make(_model.Style_ClassIndexMap, cap(selectorList))

	for _, file := range files {
		for _, raw := range _css.ParsePartial(_util.Code_Uncomment(file.Content, false, true, false), initialparse_allocation).All_Blocks {
			selector := raw.Data[0]
			value := raw.Data[1]

			classname := file.ClassFront + _util.String_Filter(selector, []rune{}, []rune{'\\', '.'}, []rune{})
			declaration := file.SourcePath + ":" + _strconv.Itoa(raw.Start.Row) + ":" + _strconv.Itoa(raw.Start.Col) +
				"::" + _strconv.Itoa(raw.End.Row) + ":" + _strconv.Itoa(raw.End.Col)

			index := 0
			if v, ok := _config.Style.Library__Index[classname]; ok {
				index = v
			}
			if v, ok := selectorMap[classname]; ok {
				index = v
			}

			if index > 0 {
				classdata := _action.Index_Fetch(index)
				classdata.SrcData.Metadata.Declarations = append(classdata.SrcData.Metadata.Declarations, declaration)
			} else {
				stylescanned := Parse_CssSnippet(
					value,
					string(file.Cache.Type)+" : "+file.FilePath+" | ",
					selector,
					false,
				)
				attachments := stylescanned.Attachments
				object := stylescanned.Result
				attach_style := func() *_css.T_Block {
					if i, v := object.GetBlock("[]"); i > -1 {
						temp := _css.NewBlock(4, 2)
						temp.SetBlock(selector, v)
						return temp
					} else {
						return _css.NewBlock(1, 1)
					}
				}()
				artifact := _config.Archive.Name

				vars := stylescanned.Variables.ToMap()
				if len(vars) == 0 {
					vars = nil
				}
				metadata := &_model.Style_Metadata{
					Info:          nil,
					Skeleton:      object.Skeleton(),
					Declarations:  []string{declaration},
					Variables:     vars,
					SummonSnippet: "",
				}

				debugRapidClass := file.DebugFront + "_" + _util.String_Filter(classname, []rune{}, []rune{}, []rune{'$', '/'})
				classdata := &_model.Style_ClassData{
					Attributes:        map[string]string{},
					Index:             0,
					Artifact:          artifact,
					Definent:          selector,
					SymClass:          classname,
					Metadata:          metadata,
					NativeRawStyle:    object,
					ExportRawStyle:    object,
					Attachments:       attachments,
					DebugRapidClass:   debugRapidClass,
					DebugFinalClass:   debugRapidClass + "_Final",
					NativeStaple:      "",
					NativeAttachStyle: attach_style,
					ExportAttachStyle: attach_style,
				}
				index := _action.Index_Declare(&_model.Cache_SymclassData{
					Context: file,
					SrcData: classdata,
				})
				classhash := _util.String_EnCounter(index)
				classdata.RapidClass = RapidClassPrefix + classhash
				classdata.FinalClass = FinalClassPrefix + classhash

				file.Cache.UsedIn = append(file.Cache.UsedIn, index)
				selectorMap[classname] = index
				selectorList = append(selectorList, classname)
			}
		}
	}

	return cssfile_Collection_return{
		SelectorMap:  selectorMap,
		SelectorList: selectorList,
	}
}
