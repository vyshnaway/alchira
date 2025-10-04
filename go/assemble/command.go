package assemble

import (
	_action_ "main/action"
	_cache_ "main/cache"
	_craft_ "main/craft"
	_fileman_ "main/fileman"
	S "main/shell"
	_utils_ "main/utils"
	X "main/xhell"
	_strings_ "strings"
	_sync_ "sync"
)

func Commander(
	command string,
	argument string,
	projectname string,
	projectversion string,
) {
	_cache_.Static.Command = command
	_cache_.Static.Argument = argument
	_cache_.Static.VERBOSE = command == "debug"
	_cache_.Static.WATCH = (command == "debug" || command == "preview") && (argument == "-w")
	_cache_.Static.ProjectName = _utils_.String_Filter(projectname, []rune{}, []rune{}, []rune{})
	_cache_.Static.ProjectVersion = projectversion

	S.Canvas.Initialize(!_cache_.Static.WATCH || command == "install", true, 2)
	core_at_version := _strings_.ToUpper(_cache_.Root.Name) + " @ " + _cache_.Root.Version

	var flagmode string
	if _cache_.Static.WATCH {
		flagmode = "Watch"
	} else {
		flagmode = "Build"
	}

	switch _cache_.Static.Command {
	case "version":
		{
			S.Post(core_at_version)
		}
	case "init":
		{
			var wg _sync_.WaitGroup
			wg.Add(2)
			go func() { _action_.Fetch_Docs(); wg.Done() }()
			go func() { S.Animate.Title(core_at_version+" : Initialize", 1000, 1); wg.Done() }()
			wg.Wait()
			status, setup_report := _action_.Verify_Setup()
			switch status {
			case _action_.Verify_Setup_Status_Uninitialized:
				_action_.Initialize()
			case _action_.Verify_Setup_Status_Initialized:
				S.Post(setup_report)
			case _action_.Verify_Setup_Status_Verified:
				report, _ := _action_.Verify_Configs(true)
				S.Post(report)
			}
		}
	case "debug":
		{
			orchestrate(core_at_version + " : Debug " + flagmode)
		}
	case "preview":
		{
			orchestrate(core_at_version + " : Preview " + flagmode)
		}
	case "publish":
		{
			orchestrate(core_at_version + " : " + "Publishing for Production")
		}
	case "install":
		{
			S.Post(S.Tag.H3("Installing Artifacts", S.Preset.Primary, S.Style.AS_Bold))
			setup_status, setup_report := _action_.Verify_Setup()

			switch setup_status {
			case _action_.Verify_Setup_Status_Uninitialized:
				S.Post(setup_report)
			case _action_.Verify_Setup_Status_Initialized:
				fallthrough
			case _action_.Verify_Setup_Status_Verified:
				if config_message, config_ok := _action_.Verify_Configs(true); !config_ok {
					S.Post(config_message)
				} else {
					if update_ok, update_message, update_files := _craft_.Artifact_Update(); update_ok {
						S.Post(update_message)
						_fileman_.Write_Bulk(update_files)
						S.Post(S.Tag.H4("Artifacts Updated", S.Preset.Success, S.Style.AS_Bold))
					} else {
						S.Post(S.Tag.H4("Artifacts not updated due to pending errors on dryrun.", S.Preset.Failed, S.Style.AS_Bold))
					}
				}
			}
		}
	default:
		{
			_action_.Fetch_Docs()

			S.Post(S.MAKE(
				S.Tag.H1(core_at_version, S.Preset.Title),
				[]string{_strings_.Trim(_cache_.Sync_References["alerts"].Content, "\t\r\n ")},
			))

			S.Post(S.MAKE("", []string{
				X.List_Record("Available Commands", _cache_.Root.Commands),
				X.List_Record("Agreements", func() map[string]string {
					res := map[string]string{}
					for _, data := range _cache_.Sync_Agreements {
						res[data.Title] = data.Path
					}
					return res
				}()),
				X.List_Record("References", func() map[string]string {
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
}
