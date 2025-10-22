package main

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	S "main/package/console"
	Sp "main/package/console/play"
	_fileman "main/package/fileman"
	O "main/package/object"
	_util "main/package/utils"
	_compiler "main/service/compiler"
	_server "main/service/server"
	_os "os"
	_slice "slices"
	_strconv "strconv"
	_string "strings"
	_sync "sync"
)

func main() {
	defaultPort := 0

	exposedCommands := []string{}
	for k := range _config.Root.Commands {
		exposedCommands = append(exposedCommands, k)
	}

	command := ""
	if len(_os.Args) > 1 {
		command = _os.Args[1]
	}

	argone := ""
	// arguments := []string{}
	if _slice.Contains(exposedCommands, command) {
		if len(_os.Args) > 2 {
			argone = _os.Args[2]
			// arguments = _os.Args[2:]
		}
	} else {
		command = ""
	}

	workpath := "."
	workPackagePath := "package.json"
	rootpath, _ := _fileman.Path_FromRoot(".")
	rootPackagePath, _ := _fileman.Path_FromRoot("package.json")

	rootPackageData, rootPackageErr := _fileman.Read_Json(rootPackagePath, false)
	if rootPackageErr != nil {
		_fmt.Println("Bad root package.json file.")
		_os.Exit(1)
	}
	rootPackageData_ := rootPackageData.(map[string]any)
	_config.Root.Name = _util.String_Fallback(rootPackageData_["name"], _config.Root.Name)
	_config.Root.Version = _util.String_Fallback(rootPackageData_["version"], _config.Root.Version)

	projectname := "-"
	projectversion := "0.0.0"
	if workPackageData, workPackageErr := _fileman.Read_Json(workPackagePath, false); workPackageErr == nil {
		workPackageData_ := workPackageData.(map[string]any)
		if val, ok := workPackageData_["name"].(string); ok && val != "" {
			projectname = val
		}
		if val, ok := workPackageData_["version"].(string); ok && val != "" {
			projectversion = val
		}
	}

	_action.Setup_Environment(rootpath, workpath)
	corecaps := _string.ToUpper(_config.Root.Name)

	_config.Static.Command = command
	_config.Static.Argument = argone
	_config.Static.DEBUG = command == "debug"
	_config.Static.MINIFY = !_config.Static.DEBUG
	_config.Static.DRYRUN = command == "server"
	_config.Static.WATCH = ((command == "debug" || command == "preview") && argone == "-w") || command == "server"
	_config.Static.ProjectName = _util.String_Filter(projectname, []rune{}, []rune{}, []rune{})
	_config.Static.ProjectVersion = projectversion

	S.Canvas.Initialize(!_config.Static.WATCH &&
		_slice.Contains([]string{
			"debug",
			"preview",
			"publish",
			"init",
			"install",
		}, command),
		true,
		2,
	)

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
			var wg _sync.WaitGroup
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
			exitcode = _compiler.Execute(corecaps + " : Debug " + flagmode)
		}
	case "preview":
		{
			exitcode = _compiler.Execute(corecaps + " : Preview " + flagmode)
		}
	case "publish":
		{
			exitcode = _compiler.Execute(corecaps + " : " + "Publishing for Production")
		}
	case "server":
		{
			if val, err := _strconv.Atoi(argone); err == nil {
				defaultPort = val
			}
			_server.Connect(defaultPort)
		}
	case "install":
		{
			S.Post(S.Tag.H3("Installing Artifacts", S.Preset.Primary, S.Style.AS_Bold))
			S.Post("\n")
			setup_report, setup_status := _action.Verify_Setup()

			switch setup_status {
			case _action.Verify_Setup_Status_Uninitialized:
				S.Post(setup_report)
			case _action.Verify_Setup_Status_Initialized:
				exitcode = 1
				fallthrough
			case _action.Verify_Setup_Status_Verified:
				if config_message, config_ok := _action.Verify_Configs(true); config_ok {
					update_ok, update_message, update_files := _compiler.Artifact_Install()
					if update_ok {
						_fileman.Write_Bulk(update_files)
						S.Post(S.Tag.H4("Artifacts Updated", S.Preset.Success, S.Style.AS_Bold))
					} else {
						S.Post(S.Tag.H4("Artifacts not updated due to pending errors on dryrun.", S.Preset.Failed, S.Style.AS_Bold))
						S.Post(update_message)
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
				S.Tag.H1(corecaps+" @ v"+_config.Root.Version, S.Preset.Title, S.Style.AS_Bold),
				[]string{_string.Trim(_config.Sync_References["alerts"].Content, "\t\r\n ")},
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
				S.Tag.H4("For more information visit : "+_config.Root.Url.Site, S.Preset.Tertiary, S.Style.AS_Bold),
			}))
		}
	}

	_os.Exit(exitcode)
}
