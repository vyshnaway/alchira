package console

import (
	S "main/package/console"
)

func Report(heading string, targets []string, report string) string {
	targetlist := []string{}
	for _, target := range targets {
		targetlist = append(targetlist, "Watching: "+target)
	}
	if heading != "" {
		heading = S.MAKE(
			S.Tag.H2(heading, S.Preset.None, S.Style.AS_Bold),
			targetlist,
			S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Tertiary},
		)
	}
	return S.MAKE(
		heading,
		[]string{
			report,
			S.Tag.H4("Press Ctrl+C to stop watching.", S.Preset.Failed, S.Style.AS_Bold),
		},
	)
}
