package handle

import (
	"main/configs"
	"main/internal/action"
	"main/internal/script"
	"main/models"
	"main/package/css"
	"main/package/reader"
	"main/package/utils"
	"main/service/compiler"
	"slices"
	"strings"
	"time"
)

type T_Component_return struct {
	Attributes map[string]string `json:"attributes"`
	Sketch     string            `json:"sketch"`
	Depend     string            `json:"stitch"`
	Symlink    string            `json:"symlink"`
	Rootcss    string            `json:"rootcss"`
	Compcss    string            `json:"compcss"`
	Timestamp  int64             `json:"timestamp"`
	Configs    map[string]any    `json:"configs"`
}

var Sandbox_View_Component = new(T_Component_return)

func Sandbox_Load(filepath, symlink string) (response any) {
	Manifest_Local(filepath, symlink)
	return Sandbox_View_Component
}

func Sandbox_Save(index int) (response any) {
	var stylesheet strings.Builder
	data := action.Index_Fetch(index)
	if data == nil {
		return nil
	}

	sketch := data.SrcData.Metadata.SketchSnippet
	clontext := *data.Context
	clontext.Midway = sketch
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
		scribes := script.Value_Builder(
			v, script.E_Method_DebugHash,
			&clontext, reader.New(v),
			slices.Contains(clontext.WatchAttrs, k),
			orderedMapping,
		)

		attributes[k] = scribes
	}

	Builder.WriteString(script.SketchCompiler(index, script.E_Method_DebugHash, map[int]bool{}))
	sketch = Builder.String()

	FinalClassMap := []models.Style_ClassIndexTrace{
		{ClassName: "_", ClassIndex: data.SrcData.Index},
	}

	for c, i := range configs.Style.Sketchpad.Low {
		FinalClassMap = append(FinalClassMap, models.Style_ClassIndexTrace{ClassName: c, ClassIndex: i})
	}
	for _, i := range configs.Style.Sketchpad.Mid {
		FinalClassMap = append(FinalClassMap, i...)
	}
	for c, i := range configs.Style.Sketchpad.Top {
		FinalClassMap = append(FinalClassMap, models.Style_ClassIndexTrace{ClassName: c, ClassIndex: i})
	}
	for _, i := range FinalClassMap {
		data := action.Index_Fetch(i.ClassIndex)
		classBlocks.SetBlock(compiler.FmtClassForCss(i.ClassName), data.SrcData.NativeRawStyle)
	}
	stylesheet.WriteString(css.Render_Switched(classBlocks, true))
	stylesheet.WriteString(css.Render_Vendored(data.SrcData.NativeAttachStyle, true))

	styleDeps, sketchDeps := compiler.GetDependentsForSketchpad()
	stylesheet.WriteString(styleDeps)

	Sandbox_View_Component = &T_Component_return{
		Attributes: attributes,
		Sketch:     sketch,
		Depend:     sketchDeps,
		Symlink:    data.SrcData.Symlink,
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

// 	if now.Symlink != last.Symlink {
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
