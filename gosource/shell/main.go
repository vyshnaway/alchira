package shell

import (
	"strings"

	"main/shell/list"
	"main/shell/render"
	"main/shell/root"
	"main/shell/tag"
)

// task writes a task message to the terminal
func task(s string, rowshift int) {
	canvas := root.Canvas
	if canvas.Config.TaskActive && canvas.Config.PostActive {
		var parts []string
		if rowshift >= 0 {
			parts = append(parts, tag.Br(rowshift, nil))
		}
		parts = append(parts,
			root.Format(">>>", root.Style.AS_Bold),
			canvas.Tab,
			root.Format(s+".", root.Style.AS_Bold, root.Style.AS_Italic),
			tag.Br(1, nil),
		)
		if rowshift < 0 {
			rowshift = -rowshift
		}
		render.Write(strings.Join(parts, ""), rowshift)
	}
}

// step writes a step message to the terminal
func step(s string, rowshift int) {
	canvas := root.Canvas
	if canvas.Config.TaskActive && canvas.Config.PostActive {
		var parts []string
		if rowshift >= 0 {
			parts = append(parts, tag.Br(rowshift, nil))
		}
		parts = append(parts,
			root.Format(">>>", root.Style.AS_Rare),
			canvas.Tab,
			root.Format(s+" ...", root.Style.AS_Italic),
		)
		if rowshift < 0 {
			rowshift = -rowshift
		}
		render.Write(strings.Join(parts, ""), rowshift)
	}
}

// make formats content as a list with headings
func make(heading string, contents []string, listDeployments ...[]interface{}) string {
	if len(contents) > 0 {
		contents = append(contents, root.Format(""))
	}

	result := []string{root.Format(heading, root.Style.AS_Bold)}

	for _, deployment := range listDeployments {
		if len(deployment) < 3 {
			continue
		}

		listType, ok := deployment[0].(list.List)
		if !ok {
			continue
		}

		indent, ok := deployment[1].(int)
		if !ok {
			continue
		}

		preset, ok := deployment[2].([]string)
		if !ok {
			continue
		}

		var styles []string
		if len(deployment) > 3 {
			for _, s := range deployment[3:] {
				if style, ok := s.(string); ok {
					styles = append(styles, style)
				}
			}
		}

		contents = listType(contents, indent, preset, styles...)
	}

	result = append(result, contents...)
	return strings.Join(result, "\n")
}

var MAKE	= make
var POST	= root.Post
var TASK	= task
var STEP	= step

var Tag		= tag.E
var List	= list.E
var Render	= render.E
var Canvas	= root.Canvas
var Preset	= root.Preset
var Style	= root.Style
var Format	= root.Format
