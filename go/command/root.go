package cmd

import (
	_fmt_ "fmt"
	_action_ "main/action"
	_cache_ "main/cache"
	_craft_ "main/craft"
	_fileman_ "main/package/fileman"
	S "main/shell/core"
	S_make "main/int/shell"
	S_play "main/package/shell/play"
	_utils_ "main/package/utils"
	_os_ "os"
	_slices_ "slices"
	_strings_ "strings"
	_sync_ "sync"
)

func main() {

	exposedCommands := []string{}
	for k := range _cache_.Root.Commands {
		exposedCommands = append(exposedCommands, k)
	}

	command := ""
	if len(_os_.Args) > 1 {
		command = _os_.Args[1]
	}
	argument := ""
	if _slices_.Contains(exposedCommands, command) {
		if len(_os_.Args) > 2 {
			argument = _os_.Args[2]
		}
	} else {
		command = ""
	}

	workpath := "."
	workPackagePath := "package.json"
	rootpath, _ := _fileman_.Path_FromRoot(".")
	rootPackagePath, _ := _fileman_.Path_FromRoot("package.json")

	rootPackageData, rootPackageErr := _fileman_.Read_Json(rootPackagePath, false)
	if rootPackageErr != nil {
		_fmt_.Println("Bad root package.json file.")
		_os_.Exit(1)
	}
	rootPackageData_ := rootPackageData.(map[string]any)
	_cache_.Root.Name = _utils_.String_Fallback(rootPackageData_["name"], _cache_.Root.Name)
	_cache_.Root.Version = _utils_.String_Fallback(rootPackageData_["version"], _cache_.Root.Version)

	projectname := "-"
	projectversion := "0.0.0"
	if workPackageData, workPackageErr := _fileman_.Read_Json(workPackagePath, false); workPackageErr == nil {
		workPackageData_ := workPackageData.(map[string]any)
		if val, ok := workPackageData_["name"].(string); ok && val != "" {
			projectname = val
		}
		if val, ok := workPackageData_["version"].(string); ok && val != "" {
			projectversion = val
		}
	}

	_action_.Setup_Environment(rootpath, workpath)

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
			exitcode = exec(corecaps + " : Debug " + flagmode)
		}
	case "preview":
		{
			exitcode = exec(corecaps + " : Preview " + flagmode)
		}
	case "publish":
		{
			exitcode = exec(corecaps + " : " + "Publishing for Production")
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

	_os_.Exit(exitcode)
}
