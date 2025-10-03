package compose

import (
	_cache_ "main/cache"
	_types_ "main/types"
	_utils_ "main/utils"
	_strings_ "strings"
)

func artifact_Partial(object map[string]any, minify bool) []string {
	stylesheet := []string{}
	tab := "  "
	if minify {
		tab = ""
	}

	for key, val := range object {
		switch val_typed := val.(type) {
		case map[string]any:
			if len(val_typed) > 1 {
				stylesheet = append(stylesheet, key)
				stylesheet = append(stylesheet, "{")
				for _, line := range artifact_Partial(val_typed, minify) {
					stylesheet = append(stylesheet, tab+line)
				}
				stylesheet = append(stylesheet, "}")
			}
		case string:
			if key[0] == '@' {
				stylesheet = append(stylesheet, key+";")
			} else {
				stylesheet = append(stylesheet, key+": "+val_typed+";")
			}
		}
	}

	return stylesheet
}

func Artifact(index int) _types_.Style_ExportStyle {

	element := ""
	innertext := ""
	symclass := ""
	stylesheet := [][2]string{}
	attributes := [][2]string{}
	styleobject := map[string]any{}

	if style := _cache_.Index_Fetch(index); _strings_.Contains(style.SymClass, "$$$") && style != nil {
		for k, v := range style.StyleObject {
			styleobject[k] = v
			if v_mod, v_ok := v.(map[string]any); v_ok {
				stylesheet = append(stylesheet, [2]string{k, _strings_.Join(artifact_Partial(v_mod, true), "")})
			}
		}

		if len(style.SnippetStaple) > 0 {
			element = "staple"
			innertext = style.SnippetStaple
		} else if len(style.Metadata.Summon) > 0 {
			element = "summon"
			innertext = style.Metadata.Summon
		} else {
			innertext = _strings_.Join(artifact_Partial(styleobject, true), "")
			element = "style"
		}

		if _strings_.Contains(style.Definent, "$$$") {
			symclass = style.Definent
		} else {
			symclass = "$---" + _utils_.String_EnCounter(style.Index)
		}
		for k, v := range style.Metadata.Attributes {
			attributes = append(attributes, [2]string{k, _utils_.Code_Minify(v)})
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
