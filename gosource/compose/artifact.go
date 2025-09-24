package compose

import (
	_cache_ "main/cache"
	_util_ "main/util"
	"strings"
)

func artifact_Partial(object map[string]any, minify bool)[]string {
	stylesheet := []string{}
	tab := "  "
	if minify {
		tab = ""
	}

	for key, val := range object {
		switch val_typed := val.(type){
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

	return stylesheet;
}


type artifact_return struct {
	Element     string
	SymClass    string
	InnerText   string
	Stylesheet  [][2]string
	Attributes  [][2]string
	Attachments []string
}

func Artifact(index int)artifact_return {
	style := _cache_.Index_Fetch(index)
	isPublic := strings.Contains(style.SymClass, "$$$")
	element := "";

	var innertext string
	if len(style.SnippetStaple) > 0 {
		element = "staple"
		innertext = style.SnippetStaple
	} else if len(style.Metadata.Summon) > 0 {
		element = "summon";
		innertext = style.Metadata.Summon
	} else {
		innertext = strings.Join(artifact_Partial(style.StyleObject, true), "")
		element = "style";
	};

	var symclass string
	if strings.Contains(style.Definent, "$$$") {
		symclass = style.Definent
	} else {
		symclass = "$---"+_util_.String_EnCounter(style.Index)
	} 

	var stylesheet [][2]string
	if isPublic {
		for k, v := range style.StyleObject {
			v_typed, v_ok := v.(map[string]any) 
			if v_ok {
				stylesheet = append(stylesheet, [2]string{k, strings.Join(artifact_Partial(v_typed, true), "")})
			}
		}
	} else {
		stylesheet = [][2]string{{"", ""}}
	}
	
	var attributes = [][2]string{}
	if isPublic {
		for k, v := range style.Metadata.Attributes {
			attributes = append(attributes, [2]string{k, _util_.Code_Minify(v)})
		}
	}

	return artifact_return{
		Element: element,
		SymClass: symclass,
		InnerText: innertext,
		Stylesheet: stylesheet,
		Attributes: attributes,
		Attachments: []string{},
	}
}
