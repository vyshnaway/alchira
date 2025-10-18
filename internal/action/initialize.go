package action

import (
	_config "main/configs"
	X "main/internal/console"
	S "main/package/console"
	_fileman "main/package/fileman"
	O "main/package/object"
)

func Initialize() {
	S.STEP("Cloning blueprint to Project", 1)
	S.TASK("Initialized setup.", 1)

	err1 := _fileman.Clone_Safe(_config.Sync_Scaffold["blueprint"].Path, _config.Path_Folder["blueprint"].Path, []string{})
	err2 := _fileman.Clone_Safe(_config.Sync_Scaffold["libraries"].Path, _config.Path_Folder["libraries"].Path, []string{})

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
				S.Format(_config.Path_Json["configure"].Path, S.Preset.Primary, S.Style.AS_Bold) +
				" according to the requirements of your project.",
			"Execute " +
				S.Format("\"init\"", S.Preset.Primary, S.Style.AS_Bold) +
				" again to generate the necessary configuration folders.",
			"During execution " +
				S.Format("{target}", S.Preset.Primary, S.Style.AS_Bold) +
				" folder will be cloned from " +
				S.Format("{source}", S.Preset.Primary, S.Style.AS_Bold) +
				" folder.",
			"This folder will act as proxy for " + _config.Root.Name + ".",
			"In the " +
				S.Format("{target}/{stylesheet}", S.Preset.Primary, S.Style.AS_Bold) +
				", content from " +
				S.Format("{target}/{stylesheet}", S.Preset.Primary, S.Style.AS_Bold) +
				" will be appended.",
		},
	))

	S.Post(X.List_Record("Available Commands", O.FromMap(_config.Root.Commands)))

	if len(_config.Root.Version) > 0 && _config.Root.Version[0] == '0' {
		S.Post(
			X.List_Steps("Publish command instructions.",
				[]string{"This command is not released."},
			))
	} else {
		S.Post(X.List_Steps("Publish command instructions.", []string{
			"Create a new project and use its access key. For action visit " +
				S.Format(_config.Root.Url.Console, S.Preset.Primary, S.Style.AS_Bold),
			"If using in CI/CD workflow, it is suggested to use " +
				S.Format("{bin} publish {key}", S.Preset.Primary, S.Style.AS_Bold),
		}))
	}

	S.Post(S.Tag.H4("Initialized setup", S.Preset.Success, S.Style.AS_Bold))
}
