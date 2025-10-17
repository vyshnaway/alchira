package server

import (
	"main/configs"
	"main/internal/action"
	"main/internal/target"
	"main/models"
	"main/package/css"
	"strings"
)

type T_Component_return struct {
	Attributes map[string]string `json:"attributes"`
	Summon     string            `json:"summon"`
	Staple     string            `json:"staple"`
	Symclass   string            `json:"symclass"`
	Rootcss    string            `json:"rootcss"`
	Compcss    string            `json:"compcss"`
}

func Component(symclass string, context models.Style_ClassIndexMap) T_Component_return {
	summon := ""
	attributes := map[string]string{}
	var staple, stylesymclass, styleattach strings.Builder

	if r := action.Index_Find(symclass, context); r.Index > 0 {
		artifact := target.Artifact(r.Index)
		if artifact.Element == "summon" {
			attributes = artifact.Attributes
			summon = strings.ReplaceAll(r.Data.SrcData.Metadata.SummonSnippet, symclass, "_")
			staple.WriteString(r.Data.SrcData.StapleSnippet)
			styleattach.WriteString(css.Render_Vendored(r.Data.SrcData.StyleSnippet.Flatten(), true))
			stylesymclass.WriteString(css.Render_Vendored(r.Data.SrcData.StyleSnippet.Flatten(), true))

			for _, attachment := range r.Data.SrcData.Attachments {
				if found := action.Index_Find(attachment, context); found.Index > 0 {
					styleattach.WriteString(css.Render_Vendored(found.Data.SrcData.StyleObject.Flatten(), true))
					staple.WriteString(found.Data.SrcData.StapleSnippet)
				}
			}
		}
	}
	
	rootcss := ""
	if REFER.WebviewState["live-preview-option-project-index"] == true {
		rootcss = configs.Delta.IndexBuild
	}

	return T_Component_return{
		Attributes: attributes,
		Summon:     summon,
		Staple:     staple.String(),
		Symclass:   symclass,
		Rootcss:    rootcss,
		Compcss:    stylesymclass.String() + styleattach.String(),
	}
}
