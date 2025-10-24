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
	var staple, nativestyle, attachstyle strings.Builder

	if r := action.Index_Find(symclass, context); r.Index > 0 {
		artifact := target.Artifact(r.Index)
		attributes = artifact.Attributes
		summon = r.Data.SrcData.Metadata.SummonSnippet
		staple.WriteString(r.Data.SrcData.NativeStaple)

		block := css.NewBlock()
		block.SetBlock("._", r.Data.SrcData.NativeRawStyle)
		nativestyle.WriteString(css.Render_Switched(block, true))
		attachstyle.WriteString(css.Render_Vendored(r.Data.SrcData.NativeAttachStyle, true))

		for attachment := range r.Data.SrcData.Attachments {
			if found := action.Index_Find(attachment, context); found.Index > 0 {
				attachstyle.WriteString(css.Render_Vendored(found.Data.SrcData.NativeRawStyle, true))
				staple.WriteString(found.Data.SrcData.NativeStaple)
			}
		}
	}

	return T_Component_return{
		Attributes: attributes,
		Summon:     summon,
		Staple:     staple.String(),
		Symclass:   symclass,
		Rootcss:    configs.Delta.IndexBuild,
		Compcss:    nativestyle.String() + attachstyle.String(),
	}
}
