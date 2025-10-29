package target

import (
	_action "main/internal/action"
	_model "main/models"
	_css "main/package/css"
	_util "main/package/utils"
	_string "strings"
)

func Artifact(index int) *_model.Style_ExportStyle {
	style := _action.Index_Fetch(index)

	element := ""
	innertext := ""
	symclass := ""
	stylesheet := make(map[string]string, style.SrcData.ExportRawStyle.BlockLen())
	attributes := make(map[string]string, len(style.SrcData.Attributes))

	if len(style.SrcData.ExportStaple) > 0 {
		element = "staple"
		innertext = style.SrcData.ExportStaple
	} else if len(style.SrcData.Metadata.SummonSnippet) > 0 {
		element = "summon"
		innertext = style.SrcData.Metadata.SummonSnippet
	} else {
		element = "style"
		innertext = style.SrcData.ExportAttachStyle.Format(true)
	}

	if _string.Contains(style.SrcData.Definent, "$$$") {
		symclass = style.SrcData.Definent
	} else {
		symclass = "$---" + _util.String_EnCounter(style.SrcData.Index)
	}

	isPublic := _string.Contains(style.SrcData.Definent, "$$$")
	if isPublic {
		for k, v := range style.SrcData.Attributes {
			attributes[k] = _util.Code_Minify(v)
		}
	}

	style.SrcData.ExportRawStyle.BlockRange(func(k string, v *_css.T_Block) {
		stylesheet[k] = v.Format(true)
	})

	return &_model.Style_ExportStyle{
		Element:     element,
		SymClass:    symclass,
		InnerText:   innertext,
		Stylesheet:  stylesheet,
		Attributes:  attributes,
		Attachments: map[string]bool{},
	}
}

func (This *Class) GetArtifacts() map[string]*_model.Style_ExportStyle {
	exports := map[string]*_model.Style_ExportStyle{}

	for _, file := range This.FileCache {
		for _, pubindex := range file.StyleData.PublicMap {
			exporting := Artifact(pubindex)

			for a := range _action.Index_Fetch(pubindex).SrcData.Attachments {
				if found := _action.Index_Find(a, file.StyleData.PublicMap); found.Index > 0 {
					subexporting := Artifact(found.Index)
					exporting.Attachments[subexporting.SymClass] = true
					exports[subexporting.SymClass] = subexporting
				}
			}
			exports[exporting.SymClass] = exporting
		}
	}

	return exports
}
