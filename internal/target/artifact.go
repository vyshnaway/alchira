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
	stylesheet := map[string]string{}
	attributes := map[string]string{}

	if style := _action.Index_Fetch(index); style != nil {
		if len(style.SrcData.NativeStaple) > 0 {
			element = "staple"
			innertext = style.SrcData.NativeStaple
		} else if len(style.SrcData.Metadata.SummonSnippet) > 0 {
			element = "summon"
			innertext = style.SrcData.Metadata.SummonSnippet
		} else {
			element = "style"
			innertext = style.SrcData.NativeAttachStyle.Format(true)
		}

		if _string.Contains(style.SrcData.Definent, "$$$") {
			symclass = style.SrcData.Definent
		} else {
			symclass = "$---" + _util.String_EnCounter(style.SrcData.Index)
		}

		isPublic := _string.Contains(style.SrcData.SymClass, "$$$")
		if isPublic {
			for k, v := range style.SrcData.Attributes {
				attributes[k] = _util.Code_Minify(v)
			}
		}

		style.SrcData.ExportRawStyle.BlockRange(func(k string, v *_css.T_Block) {
			stylesheet[k] = v.Format(true)
		})

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

			for _, a := range _action.Index_Fetch(pubindex).SrcData.Attachments {
				if found := _action.Index_Find(a, file.StyleData.LocalClasses); found.Index > 0 {
					subexporting := Artifact(found.Index)
					exporting.Attachments = append(exporting.Attachments, subexporting.SymClass)
					exports[subexporting.SymClass] = subexporting
				}
			}
			exports[exporting.SymClass] = exporting
		}
	}

	return exports
}
