package handle

import (
	"fmt"
	"main/configs"
	"main/internal/action"
	"main/internal/script"
	"main/internal/style"
	"main/models"
	"main/package/css"
	"main/package/reader"
	"main/package/utils"
	"main/service/compiler"
	"maps"
	"slices"
	"strings"
	"time"
)

type T_Component_return struct {
	Attributes map[string]string `json:"attributes"`
	Sketch     string            `json:"sketch"`
	Stitch     string            `json:"stitch"`
	Symclass   string            `json:"symclass"`
	Rootcss    string            `json:"rootcss"`
	Compcss    string            `json:"compcss"`
	Timestamp  int64             `json:"timestamp"`
	Configs    map[string]any    `json:"configs"`
}

var Sandbox_View_Component = new(T_Component_return)

func Sandbox_Load(filepath, symclass string) (response any) {
	Manifest_Local(filepath, symclass)
	return Sandbox_View_Component
}

func Sandbox_Save(index int) (response any) {
	var stitchsheet, stylesheet strings.Builder
	data := action.Index_Fetch(index)
	if data == nil {
		return nil
	}

	sketch := data.SrcData.Metadata.SketchSnippet
	clontext := *data.Context
	clontext.Midway = sketch
	attachIndex := map[int]bool{}
	classBlocks := css.NewBlock(4, 4)

	orderedlist := []string{}
	var Builder strings.Builder
	attributes := map[string]string{}
	for k, v := range data.SrcData.Attributes {
		value_Parse_return := script.Value_ClassFilter(v, slices.Contains(clontext.WatchAttrs, k))
		orderedlist = append(orderedlist, value_Parse_return.OrderedClasses...)
	}
	orderedlist = utils.Array_Setback(orderedlist)
	orderedMapping := script.Value_EvaluateIndexTraces(script.E_Method_DebugHash, "", orderedlist, clontext.Cache.LocalMap)

	for k, v := range data.SrcData.Attributes {
		scribes, appends := script.Value_Builder(
			v, script.E_Method_DebugHash,
			&clontext, reader.New(v),
			slices.Contains(clontext.WatchAttrs, k),
			orderedMapping, map[int]bool{},
		)

		attributes[k] = scribes
		for _, vv := range appends {
			Builder.WriteString(vv)
			Builder.WriteRune('\n')
		}
	}

	Builder.WriteString(strings.TrimSpace(script.Rider(&clontext, script.E_Method_DebugHash, map[int]bool{}).Scribed))
	sketch = Builder.String()

	FinalClassMap := []models.Style_ClassIndexTrace{
		{ClassName: "_", ClassIndex: data.SrcData.Index},
	}
	appendmap := map[int]bool{}
	for c, i := range configs.Style.Classlist_Append {
		appendmap[i] = true
		FinalClassMap = append(FinalClassMap, models.Style_ClassIndexTrace{ClassName: c, ClassIndex: i})
	}
	for c, i := range configs.Style.Classlist_Scattered {
		FinalClassMap = append(FinalClassMap, models.Style_ClassIndexTrace{ClassName: c, ClassIndex: i})
	}
	for _, i := range configs.Style.Classlist_Ordered {
		FinalClassMap = append(FinalClassMap, i...)
	}
	for c, i := range configs.Style.Classlist_Final {
		FinalClassMap = append(FinalClassMap, models.Style_ClassIndexTrace{ClassName: c, ClassIndex: i})
	}

	for _, i := range FinalClassMap {
		if !appendmap[i.ClassIndex] {
			attachIndex[i.ClassIndex] = true
		}
		data := action.Index_Fetch(i.ClassIndex)
		maps.Copy(attachIndex, style.ResolveDependints(data))

		classBlocks.SetBlock(compiler.FmtClassForCss(i.ClassName), data.SrcData.NativeRawStyle)
	}
	stylesheet.WriteString(css.Render_Switched(classBlocks, true))

	stylesheet.WriteString(css.Render_Vendored(data.SrcData.NativeAttachStyle, true))
	for i := range attachIndex {
		ref := action.Index_Fetch(i)
		stylesheet.WriteString(css.Render_Vendored(ref.SrcData.NativeAttachStyle, true))
		stitchsheet.WriteString(ref.SrcData.NativeStitch)
	}

	Sandbox_View_Component = &T_Component_return{
		Attributes: attributes,
		Sketch:     sketch,
		Stitch:     fmt.Sprint(configs.Saved.Tweaks["stitch-prefix"], stitchsheet.String(), configs.Saved.Tweaks["stitch-suffix"]),
		Symclass:   data.SrcData.SymClass,
		Rootcss:    configs.Delta.IndexBuild,
		Compcss:    stylesheet.String(),
		Timestamp:  time.Now().UnixNano(),
		Configs:    configs.Saved.Sandbox,
	}

	return Sandbox_View_Component
}

// var sandbox_View_ComponentLast = new(T_Component_return)

// func SandboxDataDiffered() bool {
// 	now := Sandbox_View_Component
// 	last := sandbox_View_ComponentLast
// 	sandbox_View_ComponentLast = Sandbox_View_Component
// 	differed := false

// 	if now.Timestamp == last.Timestamp {
// 		return false
// 	}

// 	if now.Symclass != last.Symclass {
// 		return true
// 	}
// 	if now.Sketch != last.Sketch {
// 		return true
// 	}
// 	if now.Stitch != last.Stitch {
// 		return true
// 	}
// 	if now.Compcss != last.Compcss {
// 		return true
// 	}
// 	if now.Rootcss != last.Rootcss {
// 		return true
// 	}
// 	if last.Attributes != nil && now.Attributes != nil && len(now.Attributes) == len(last.Attributes) {
// 		for k, vc := range now.Attributes {
// 			if vl, ok := last.Attributes[k]; !ok || vl != vc {
// 				return true
// 			}
// 		}
// 	} else {
// 		return true
// 	}

// 	return differed
// }
