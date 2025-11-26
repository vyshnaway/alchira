package handle

import (
	"main/configs"
	"main/internal/action"
	"main/internal/script"
	"main/internal/style"
	"main/models"
	"main/package/css"
	"main/service/compiler"
	"maps"
	"strings"
	"time"
)

type T_Component_return struct {
	Attributes map[string]string `json:"attributes"`
	Summon     string            `json:"summon"`
	Staple     string            `json:"staple"`
	Symclass   string            `json:"symclass"`
	Rootcss    string            `json:"rootcss"`
	Compcss    string            `json:"compcss"`
	Timestamp  int64             `json:"timestamp"`
}

var Sandbox_View_Component = new(T_Component_return)
var sandbox_View_ComponentLast = new(T_Component_return)

func Sandbox_Load(filepath, symclass string) (response any) {
	Manifest_Local(filepath, symclass)
	return Sandbox_View_Component
}

func Sandbox_Save(index int) (response any) {
	var staplesheet, stylesheet strings.Builder
	data := action.Index_Fetch(index)
	if data == nil {
		return nil
	}

	summon := data.SrcData.Metadata.SummonSnippet
	clontext := *data.Context
	clontext.Midway = summon
	attachIndex := map[int]bool{}
	attributes := data.SrcData.Attributes
	classBlocks := css.NewBlock(4, 4)

	summon = strings.TrimSpace(script.Rider(&clontext, script.E_Method_DebugHash).Scribed)

	FinalClassMap := []models.Style_ClassIndexTrace{
		{ClassName: "_", ClassIndex: data.SrcData.Index},
	}
	for c, i := range configs.Style.Sandbox_Scattered {
		FinalClassMap = append(FinalClassMap, models.Style_ClassIndexTrace{ClassName: c, ClassIndex: i})
	}
	for _, i := range configs.Style.Publish_Ordered {
		FinalClassMap = append(FinalClassMap, i...)
	}
	for c, i := range configs.Style.Sandbox_Final {
		FinalClassMap = append(FinalClassMap, models.Style_ClassIndexTrace{ClassName: c, ClassIndex: i})
	}

	for _, i := range FinalClassMap {
		data := action.Index_Fetch(i.ClassIndex)
		attachIndex[i.ClassIndex] = true
		maps.Copy(attachIndex, style.ResolveDependints(data))

		classBlocks.SetBlock(compiler.FmtClassForCss(i.ClassName), data.SrcData.NativeRawStyle)
	}
	stylesheet.WriteString(css.Render_Switched(classBlocks, true))

	stylesheet.WriteString(css.Render_Vendored(data.SrcData.NativeAttachStyle, true))
	for i := range attachIndex {
		ref := action.Index_Fetch(i)
		stylesheet.WriteString(css.Render_Vendored(ref.SrcData.NativeAttachStyle, true))
		staplesheet.WriteString(ref.SrcData.NativeStaple)
	}

	Sandbox_View_Component = &T_Component_return{
		Attributes: attributes,
		Summon:     summon,
		Staple:     staplesheet.String(),
		Symclass:   data.SrcData.SymClass,
		Rootcss:    configs.Delta.IndexBuild,
		Compcss:    stylesheet.String(),
		Timestamp:  time.Now().UnixNano(),
	}

	return Sandbox_View_Component
}

func SandboxDataDiffered() bool {
	now := Sandbox_View_Component
	last := sandbox_View_ComponentLast
	sandbox_View_ComponentLast = Sandbox_View_Component
	differed := false

	if now.Timestamp == last.Timestamp {
		return false
	}

	if now.Symclass != last.Symclass {
		return true
	}
	if now.Summon != last.Summon {
		return true
	}
	if now.Staple != last.Staple {
		return true
	}
	if now.Compcss != last.Compcss {
		return true
	}
	if now.Rootcss != last.Rootcss {
		return true
	}
	if last.Attributes != nil && now.Attributes != nil && len(now.Attributes) == len(last.Attributes) {
		for k, vc := range now.Attributes {
			if vl, ok := last.Attributes[k]; !ok || vl != vc {
				return true
			}
		}
	} else {
		return true
	}

	return differed
}
