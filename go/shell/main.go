package shell

import (
	_strings_ "strings"
)

// tMain_ListDeployment struct to represent the list deployment tuple
type MakeList struct {
	TypeFunc func([]string, int, []string, ...string) []string
	Intent   int
	Preset   []string
	Styles   []string
}

// MAKE constructs output from heading, contents, and deployments
func MAKE(heading string, contents []string, deployments ...MakeList) string {
	modContents := make([]string, len(contents))
	copy(modContents, contents)
	for _, dep := range deployments {
		modContents = dep.TypeFunc(modContents, dep.Intent, dep.Preset, dep.Styles...)
	}
	if len(contents) > 0 {
		modContents = append(modContents, Format("", Preset.None))
	}
	outList := []string{}
	if len(heading) > 0 {
		outList = append(outList, Format(heading, Preset.None, Style.AS_Bold))
	}
	outList = append(outList, modContents...)
	return _strings_.Join(outList, "\n")
}

func TASK(str string, rowShift int) {
	if Canvas.Config.TaskActive && Canvas.Config.PostActive {
		var b _strings_.Builder
		b.WriteString(Format(">>>", Preset.Primary, Style.AS_Bold))
		b.WriteString(Canvas.Tab)
		b.WriteString(Format(str+".", Preset.Tertiary, Style.AS_Bold, Style.AS_Italic))
		b.WriteString(tag_Br(1, Preset.None))
		render_Write(b.String(), util_AbsRowShift(rowShift))
	}
}

func STEP(str string, rowShift int) {
	if Canvas.Config.TaskActive && Canvas.Config.PostActive {
		var b _strings_.Builder
		b.WriteString(Format(">>>", Preset.Primary, Style.AS_Rare))
		b.WriteString(Canvas.Tab)
		b.WriteString(Format(str+" ...", Preset.Tertiary, Style.AS_Italic))
		render_Write(b.String(), util_AbsRowShift(rowShift))
	}
}
