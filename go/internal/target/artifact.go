package target

import (
	_action "main/internal/action"
	_model "main/models"
	_types_ "main/models"
	_css "main/package/css"
	_util "main/package/utils"
	_string "strings"
)

func Artifact(index int) _types_.Style_ExportStyle {

	element := ""
	innertext := ""
	symclass := ""
	stylesheet := [][2]string{}
	attributes := [][2]string{}

	if style := _action.Index_Fetch(index); style != nil && _string.Contains(style.SymClass, "$$$") {
		blockseq := _css.NewBlockSeq()
		style.StyleObject.BlockRange(func(k string, v *_css.T_Block) {
			blockseq.AddNewBlock(k, v)
			v.BlockRange(func(k string, v *_css.T_Block) {
				stylesheet = append(stylesheet, [2]string{k, v.Format(true)})
			})
		})

		if len(style.StapleSnippet) > 0 {
			element = "staple"
			innertext = style.StapleSnippet
		} else if len(style.Metadata.Summon) > 0 {
			element = "summon"
			innertext = style.Metadata.Summon
		} else {
			innertext = style.StyleSnippet.Format(true)
			element = "style"
		}

		if _string.Contains(style.Definent, "$$$") {
			symclass = style.Definent
		} else {
			symclass = "$---" + _util.String_EnCounter(style.Index)
		}
		for k, v := range style.Metadata.Attributes {
			attributes = append(attributes, [2]string{k, _util.Code_Minify(v)})
		}
	}

	return _types_.Style_ExportStyle{
		Element:     element,
		SymClass:    symclass,
		InnerText:   innertext,
		Stylesheet:  stylesheet,
		Attributes:  attributes,
		Attachments: []string{},
	}
}

func (This *Class) GetArtifacts() map[string]_model.Style_ExportStyle {
	exports := map[string]_model.Style_ExportStyle{}

	for _, file := range This.FileCache {
		for _, pubindex := range file.StyleData.PublicClasses {
			exporting := Artifact(pubindex)
			exports[exporting.SymClass] = exporting

			for _, a := range _action.Index_Fetch(pubindex).Attachments {
				if found := _action.Index_Find(a, file.StyleData.LocalClasses); found.Index > 0 {
					subexporting := Artifact(found.Index)
					exporting.Attachments = append(exporting.Attachments, subexporting.SymClass)
					exports[subexporting.SymClass] = subexporting
				}
			}
		}
	}

	return exports
}
