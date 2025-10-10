package main

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	S "main/package/console"
	Sp "main/package/console/play"
	_fileman_ "main/package/fileman"
	O "main/package/object"
	_utils_ "main/package/utils"
	_service "main/service"
	_os_ "os"
	_slices_ "slices"
	_strings_ "strings"
	_sync_ "sync"
)

func main() {

	exposedCommands := []string{}
	for k := range _config.Root.Commands {
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
		_fmt.Println("Bad root package.json file.")
		_os_.Exit(1)
	}
	rootPackageData_ := rootPackageData.(map[string]any)
	_config.Root.Name = _utils_.String_Fallback(rootPackageData_["name"], _config.Root.Name)
	_config.Root.Version = _utils_.String_Fallback(rootPackageData_["version"], _config.Root.Version)

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

	_action.Setup_Environment(rootpath, workpath)

	_config.Static.Command = command
	_config.Static.Argument = argument
	_config.Static.DEBUG = command == "debug"
	_config.Static.MINIFY = !_config.Static.DEBUG
	_config.Static.WATCH = (command == "debug" || command == "preview") && (argument == "-w")
	_config.Static.ProjectName = _utils_.String_Filter(projectname, []rune{}, []rune{}, []rune{})
	_config.Static.ProjectVersion = projectversion

	S.Canvas.Initialize(!_config.Static.WATCH || command == "install", true, 2)
	corecaps := _strings_.ToUpper(_config.Root.Name)

	var flagmode string
	exitcode := 0
	if _config.Static.WATCH {
		flagmode = "Watch"
	} else {
		flagmode = "Build"
	}

	switch _config.Static.Command {
	case "init":
		{
			var wg _sync_.WaitGroup
			wg.Add(2)
			go func() { _action.Sync_RootDocs(); wg.Done() }()
			go func() { Sp.Title(corecaps+" : Initialize", 1000, 1); wg.Done() }()
			wg.Wait()
			setup_report, setup_status := _action.Verify_Setup()
			switch setup_status {
			case _action.Verify_Setup_Status_Uninitialized:
				_action.Initialize()
				exitcode = 1
			case _action.Verify_Setup_Status_Initialized:
				S.Post(setup_report)
				exitcode = 1
			case _action.Verify_Setup_Status_Verified:
				report, _ := _action.Verify_Configs(true)
				S.Post(report)
			}
		}
	case "debug":
		{
			exitcode = _service.Execute(corecaps + " : Debug " + flagmode)
		}
	case "preview":
		{
			exitcode = _service.Execute(corecaps + " : Preview " + flagmode)
		}
	case "publish":
		{
			exitcode = _service.Execute(corecaps + " : " + "Publishing for Production")
		}
	case "install":
		{
			S.Post(S.Tag.H3("Installing Artifacts", S.Preset.Primary, S.Style.AS_Bold))
			setup_report, setup_status := _action.Verify_Setup()

			switch setup_status {
			case _action.Verify_Setup_Status_Uninitialized:
				S.Post(setup_report)
			case _action.Verify_Setup_Status_Initialized:
				exitcode = 1
				fallthrough
			case _action.Verify_Setup_Status_Verified:
				if config_message, config_ok := _action.Verify_Configs(true); config_ok {
					if update_ok, update_message, update_files := _service.Artifact_Update(); update_ok {
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
			_action.Sync_RootDocs()

			S.Post(S.MAKE(
				S.Tag.H1(corecaps, S.Preset.Title),
				[]string{_strings_.Trim(_config.Sync_References["alerts"].Content, "\t\r\n ")},
			))

			S.Post(S.MAKE("", []string{
				X.List_Record("Available Commands", O.FromMap(_config.Root.Commands)),
				X.List_Record("Agreements", func() *O.T[string, string] {
					res := O.New[string, string]()
					for _, data := range _config.Sync_Agreements {
						res.Set(data.Title, data.Path)
					}
					return res
				}()),
				X.List_Record("References", func() *O.T[string, string] {
					res := O.New[string, string]()
					for _, data := range _config.Sync_References {
						res.Set(data.Title, data.Path)
					}
					return res
				}()),
				S.Tag.H4("For more information visit : "+_config.Root.Url.Site, S.Preset.Tertiary),
			}))
		}
	}

	_os_.Exit(exitcode)
}
