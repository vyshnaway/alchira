package handle

import (
	"main/configs"
	"main/internal/action"
	"main/internal/script"
	"main/models"
	"main/package/css"
	"main/package/utils"
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

var Sandbox_View_Last = new(T_Component_return)

func Sandbox_Load(filepath, symclass string) (response any) {
	Manifest_Local(filepath, symclass)
	return Sandbox_View_Last
}

func Sandbox_Index(index int) (response any) {
	var staplesheet, stylesheet strings.Builder
	data := action.Index_Fetch(index)
	if data == nil {
		return nil
	}

	summon := data.SrcData.Metadata.SummonSnippet
	clontext := *data.Context
	clontext.Midway = summon
	attachments := map[int]*models.Style_ClassData{}
	attributes := data.SrcData.Attributes
	classBlocks := css.NewBlock(4, 4)
	configs.Style.Publish_RigidTracks = [][]models.Style_ClassIndexTrace{{
		models.Style_ClassIndexTrace{ClassName: "._", ClassIndex: data.SrcData.Index},
	}}

	summon = script.Rider(&clontext, script.E_Action_DebugHash).Scribed

	for _, i := range utils.Array_FlattenOnce(configs.Style.Publish_RigidTracks) {
		data := action.Index_Fetch(i.ClassIndex).SrcData
		attachments[i.ClassIndex] = data
		for a := range data.Attachments {
			if found := action.Index_Finder(a, clontext.Style.LocalMap); found.Index > 0 {
				attachments[found.Index] = found.Data.SrcData
			}
		}
		classBlocks.SetBlock(i.ClassName, data.NativeRawStyle)
	}
	stylesheet.WriteString(css.Render_Switched(classBlocks, true))

	stylesheet.WriteString(css.Render_Vendored(data.SrcData.NativeAttachStyle, true))
	for _, data := range attachments {
		stylesheet.WriteString(css.Render_Vendored(data.NativeAttachStyle, true))
		staplesheet.WriteString(data.NativeStaple)
	}

	Sandbox_View_Last = &T_Component_return{
		Attributes: attributes,
		Summon:     summon,
		Staple:     staplesheet.String(),
		Symclass:   data.SrcData.SymClass,
		Rootcss:    configs.Delta.IndexBuild,
		Compcss:    stylesheet.String(),
	}

	return Sandbox_View_Last
}
