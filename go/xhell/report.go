package xhell

import (
	S "main/shell"
)

func Report(heading string, targets []string, report string, footer []string) {
	targetlist := []string{}
	for _, target := range targets {
		targetlist = append(targetlist, "Watching: "+target)
	}
	S.Render.Write(S.MAKE(
		"",
		[]string{
			S.MAKE(
				S.Tag.H1(heading, S.Preset.Primary),
				targetlist,
				S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Primary},
			),
			report,
			S.MAKE(
				S.Tag.H5("Press Ctrl+C to stop watching.", S.Preset.Failed),
				footer,
				S.MakeList{TypeFunc: S.List.Catalog, Intent: 0, Preset: S.Preset.Tertiary},
			),
		},
	), 0)
}
