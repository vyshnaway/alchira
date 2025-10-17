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
			summon = strings.ReplaceAll(r.Data.Metadata.SummonSnippet, symclass, "_")
			staple.WriteString(r.Data.StapleSnippet)
			styleattach.WriteString(css.Render_Vendored(r.Data.StyleSnippet.Flatten(), true))
			stylesymclass.WriteString(css.Render_Vendored(r.Data.StyleSnippet.Flatten(), true))

			for _, attachment := range r.Data.Attachments {
				if found := action.Index_Find(attachment, context); found.Index > 0 {
					styleattach.WriteString(css.Render_Vendored(found.Data.StyleObject.Flatten(), true))
					staple.WriteString(found.Data.StapleSnippet)
				}
			}
		}
	}

	return T_Component_return{
		Attributes: attributes,
		Summon:     summon,
		Staple:     staple.String(),
		Rootcss:    configs.Delta.IndexBuild,
		Compcss:    stylesymclass.String() + styleattach.String(),
	}
}
