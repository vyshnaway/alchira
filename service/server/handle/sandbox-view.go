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
	Attributes map[string]string `json:Attributes`
	Summon     string            `json:Summon`
	Staple     string            `json:Staple`
	Symclass   string            `json:Symclass`
	Rootcss    string            `json:Rootcss`
	Compcss    string            `json:Compcss`
}

func Sandbox_View(symclass, filepath string) (response any, broadcast bool) {
	var staplesheet, stylesheet strings.Builder

	context := configs.Style.Filepath_to_Context[filepath]
	if context == nil {
		return nil, false
	}

	ref := action.Index_Finder(symclass, context.StyleData.LocalMap)
	if ref.Index == 0 {
		return nil, false
	}

	summon := ref.Data.SrcData.SummonSnippet
	clontext := *context
	clontext.Midway = summon
	attachments := map[int]*models.Style_ClassData{}
	attributes := map[string]string{}
	classBlocks := css.NewBlock(4, 4)
	configs.Style.PublishIndexMap = [][]models.Style_ClassIndexTrace{}

	summon = script.Rider(&clontext, script.E_Action_SandBox).Scribed

	classBlocks.SetBlock("._", ref.Data.SrcData.NativeRawStyle)
	for _, i := range utils.Array_FlattenOnce(configs.Style.PublishIndexMap) {
		data := action.Index_Fetch(i.ClassIndex).SrcData
		attachments[i.ClassIndex] = data
		for a := range data.Attachments {
			if found := action.Index_Finder(a, context.StyleData.LocalMap); found.Index > 0 {
				attachments[found.Index] = found.Data.SrcData
			}
		}
		classBlocks.SetBlock(i.ClassName, data.NativeRawStyle)
	}
	stylesheet.WriteString(css.Render_Switched(classBlocks, false))

	stylesheet.WriteString(css.Render_Vendored(ref.Data.SrcData.NativeAttachStyle, true))
	for _, data := range attachments {
		stylesheet.WriteString(css.Render_Vendored(data.NativeAttachStyle, true))
		staplesheet.WriteString(data.NativeStaple)
	}

	return &T_Component_return{
		Attributes: attributes,
		Summon:     summon,
		Staple:     staplesheet.String(),
		Symclass:   symclass,
		Rootcss:    configs.Delta.IndexBuild,
		Compcss:    stylesheet.String(),
	}, true
}
