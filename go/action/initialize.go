package action

import (
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	S "main/shell"
	X "main/xhell"
)

func Initialize() {
	S.TASK("Initializing setup.", 0)
	S.TASK("Cloning scaffold to Project", 1)

	err1 := _fileman_.Clone_Safe(_cache_.Path["blueprint"]["scaffold"].Path, _cache_.Path["folder"]["scaffold"].Path, []string{})
	err2 := _fileman_.Clone_Safe(_cache_.Path["blueprint"]["libraries"].Path, _cache_.Path["folder"]["libraries"].Path, []string{})

	if err1 != nil {
		S.Post(S.MAKE(
			S.Tag.H4("Initialization failed.", S.Preset.Failed, S.Style.AS_Bold),
			[]string{err1.Error()},
			S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Failed},
		))
		return
	}
	if err2 != nil {
		S.Post(S.MAKE(
			S.Tag.H4("Initialization failed.", S.Preset.Failed, S.Style.AS_Bold),
			[]string{err2.Error()},
			S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Failed},
		))
		return
	}

	S.Post(X.List_Steps(
		"Next Steps",
		[]string{
			"Modify " +
				S.Format(_cache_.Path["json"]["configure"].Path, S.Preset.Primary, S.Style.AS_Bold) +
				" according to the requirements of your project.",
			"Execute " +
				S.Format("\"init\"", S.Preset.Primary, S.Style.AS_Bold) +
				" again to generate the necessary configuration folders.",
			"During execution " +
				S.Format("{target}", S.Preset.Primary, S.Style.AS_Bold) +
				" folder will be cloned from " +
				S.Format("{source}", S.Preset.Primary, S.Style.AS_Bold) +
				" folder.",
			"This folder will act as proxy for " + _cache_.Root.Name + ".",
			"In the " +
				S.Format("{target}/{stylesheet}", S.Preset.Primary, S.Style.AS_Bold) +
				", content from " +
				S.Format("{target}/{stylesheet}", S.Preset.Primary, S.Style.AS_Bold) +
				" will be appended.",
		},
	))

	S.Post(X.List_Record("Available Commands", _cache_.Root.Commands))

	S.Post(X.List_Steps(
		"Publish command instructions.",
		func() []string {
			if _cache_.Archive.Version[0] == '0' {
				return []string{"This command is not released."}
			} else {
				return []string{
					"Create a new project and use its access key. For action visit " +
						S.Format(_cache_.Root.Url.Console, S.Preset.Primary, S.Style.AS_Bold),
					"If using in CI/CD workflow, it is suggested to use " +
						S.Format("{bin} publish {key}", S.Preset.Primary, S.Style.AS_Bold),
				}
			}
		}(),
	))

	Fetch_Docs()
	S.Post(S.Tag.H4("Initialized setup", S.Preset.Success, S.Style.AS_Bold))
}
