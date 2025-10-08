package assemble

import (
	_action_ "main/action"
	_cache_ "main/cache"
	_craft_ "main/craft"
	_fileman_ "main/fileman"
	S "main/shell/core"
	S_make "main/shell/make"
	S_play "main/shell/play"
	_utils_ "main/utils"
	_strings_ "strings"
	_sync_ "sync"
)

func Commander(
	command string,
	argument string,
	projectname string,
	projectversion string,
) (Exitcode int) {
	_cache_.Static.Command = command
	_cache_.Static.Argument = argument
	_cache_.Static.MINIFY = command != "debug"
	_cache_.Static.WATCH = (command == "debug" || command == "preview") && (argument == "-w")
	_cache_.Static.ProjectName = _utils_.String_Filter(projectname, []rune{}, []rune{}, []rune{})
	_cache_.Static.ProjectVersion = projectversion

	S.Canvas.Initialize(!_cache_.Static.WATCH || command == "install", true, 2)
	corecaps := _strings_.ToUpper(_cache_.Root.Name)

	var flagmode string
	exitcode := 0
	if _cache_.Static.WATCH {
		flagmode = "Watch"
	} else {
		flagmode = "Build"
	}

	switch _cache_.Static.Command {
	case "init":
		{
			var wg _sync_.WaitGroup
			wg.Add(2)
			go func() { _action_.Sync_RootDocs(); wg.Done() }()
			go func() { S_play.Title(corecaps+" : Initialize", 1000, 1); wg.Done() }()
			wg.Wait()
			status, setup_report := _action_.Verify_Setup()
			switch status {
			case _action_.Verify_Setup_Status_Uninitialized:
				_action_.Initialize()
				exitcode = 1
			case _action_.Verify_Setup_Status_Initialized:
				S.Post(setup_report)
				exitcode = 1
			case _action_.Verify_Setup_Status_Verified:
				report, _ := _action_.Verify_Configs(true)
				S.Post(report)
			}
		}
	case "debug":
		{
			exitcode = orchestrate(corecaps + " : Debug " + flagmode)
		}
	case "preview":
		{
			exitcode = orchestrate(corecaps + " : Preview " + flagmode)
		}
	case "publish":
		{
			exitcode = orchestrate(corecaps + " : " + "Publishing for Production")
		}
	case "install":
		{
			S.Post(S.Tag.H3("Installing Artifacts", S.Preset.Primary, S.Style.AS_Bold))
			setup_status, setup_report := _action_.Verify_Setup()

			switch setup_status {
			case _action_.Verify_Setup_Status_Uninitialized:
				S.Post(setup_report)
			case _action_.Verify_Setup_Status_Initialized:
				exitcode = 1
				fallthrough
			case _action_.Verify_Setup_Status_Verified:
				if config_message, config_ok := _action_.Verify_Configs(true); config_ok {
					if update_ok, update_message, update_files := _craft_.Artifact_Update(); update_ok {
						S.Post(update_message)
						_fileman_.Write_Bulk(update_files)
						S.Post(S.Tag.H4("Artifacts Updated", S.Preset.Success, S.Style.AS_Bold))
					} else {
						S.Post(S.Tag.H4("Artifacts not updated due to pending errors on dryrun.", S.Preset.Failed, S.Style.AS_Bold))
						exitcode = 1
					}
				} else {
					S.Post(config_message)
					exitcode = 1
				}
			}
		}
	default:
		{
			_action_.Sync_RootDocs()

			S.Post(S.MAKE(
				S.Tag.H1(corecaps, S.Preset.Title),
				[]string{_strings_.Trim(_cache_.Sync_References["alerts"].Content, "\t\r\n ")},
			))

			S.Post(S.MAKE("", []string{
				S_make.List_Record("Available Commands", _cache_.Root.Commands),
				S_make.List_Record("Agreements", func() map[string]string {
					res := map[string]string{}
					for _, data := range _cache_.Sync_Agreements {
						res[data.Title] = data.Path
					}
					return res
				}()),
				S_make.List_Record("References", func() map[string]string {
					res := map[string]string{}
					for _, data := range _cache_.Sync_References {
						res[data.Title] = data.Path
					}
					return res
				}()),
				S.Tag.H4("For more information visit : "+_cache_.Root.Url.Site, S.Preset.Tertiary),
			}))
		}
	}

	return exitcode
}
