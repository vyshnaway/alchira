package console

import (
	S "main/package/console"
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
				S.Tag.H2(heading, S.Preset.None),
				targetlist,
				S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Tertiary},
			),
			report,
			S.MAKE(
				S.Tag.H4("Press Ctrl+C to stop watching.", S.Preset.Failed),
				footer,
				S.MakeList{TypeFunc: S.List.Catalog, Intent: 0, Preset: S.Preset.Tertiary},
			),
		},
	), 0)
}
