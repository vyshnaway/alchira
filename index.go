package main

import (
	_fmt "fmt"
	_log "log"
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
	_http "net/http"
	_ "net/http/pprof"
	_os "os"
	_filepath "path/filepath"
	_slice "slices"
	_strconv "strconv"
	_string "strings"
	_sync "sync"
)

func Path_FromPackage(elem ...string) (string, error) {
	filename, err := _os.Executable()

	if err != nil {
		return "", _fmt.Errorf("failed to get current file path for root calculation")
	}
	root := _filepath.Join(_filepath.Dir(filename), "..", "..")
	joined := _filepath.Join(root, _filepath.Join(elem...))
	return joined, nil
}

// Path_FromSource joins the given path elements to the calculated root directory.
func Path_FromSource(elem ...string) (string, error) {
	filename, err := _os.Executable()

	if err != nil {
		return "", _fmt.Errorf("failed to get current file path for root calculation")
	}
	root := _filepath.Join(_filepath.Dir(filename), "..")
	joined := _filepath.Join(root, _filepath.Join(elem...))
	return joined, nil
}

func main() {
	exposedCommands := []string{}
	for k := range _config.Root.Commands {
		exposedCommands = append(exposedCommands, k)
	}

	command := ""
	if len(_os.Args) > 1 {
		command = _os.Args[1]
	}

	argone := ""
	if _slice.Contains(exposedCommands, command) {
		if len(_os.Args) > 2 {
			argone = _os.Args[2]
		}
	} else {
		command = ""
	}

	workpath := "."
	sourcedir, _ := Path_FromSource()
	packagedir, _ := Path_FromPackage()
	workPackagePath := "package.json"
	rootPackagePath, _ := Path_FromPackage("package.json")

	rootPackageData, rootPackageErr := _fileman.Read_Json(rootPackagePath, false)
	if rootPackageErr == nil {
		rootPackageData_ := rootPackageData.(map[string]any)
		_config.Root.Name = _util.String_Fallback(rootPackageData_["name"], _config.Root.Name)
		_config.Root.Version = _util.String_Fallback(rootPackageData_["version"], _config.Root.Version)
	} else {
		_fmt.Println("Error Json: " + rootPackagePath)
	}

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

	_action.Setup_Environment(packagedir, sourcedir, workpath)
	corecaps := _string.ToUpper(_config.Root.Name)

	_config.Static.Command = command
	_config.Static.Argument = argone
	_config.Static.ProjectVersion = projectversion
	_config.Static.ProjectName = _util.String_Filter(projectname, []rune{}, []rune{}, []rune{})

	_config.Static.DEBUG = command == "debug"
	_config.Static.IAMAI = command == "iamai"
	_config.Static.WATCH = command == "server" || ((command == "debug" || command == "preview") && argone == "-w")
	_config.Static.SERVER = command == "server"
	_config.Static.MINIFY = !_config.Static.DEBUG
	_config.Static.PREVIEW = command == "preview"

	S.Canvas.Initialize(
		!_config.Static.WATCH && _slice.Contains([]string{"debug", "preview", "publish", "init", "install"}, command),
		true, 2,
	)

	exitcode := 0
	var flagmode = "Build"
	if _config.Static.WATCH {
		flagmode = "Watch"
	}

	_config.Reset(false)
	if _fileman.Path_IfDir(_config.Root_Scaffold["source"].Path) {
		pprof, e := _server.RequestAvailablePort(0)
		if e == nil {
			go func() {
				_log.Println(_http.ListenAndServe(_fmt.Sprint("localhost:", pprof), nil))
			}()
			S.Post(S.Tag.H2(_fmt.Sprint("[DEV] | Pprof Port: ", pprof), S.Preset.Tertiary))
		}
	}
	concurrent := false

	switch _config.Static.Command {
	case "init":
		{
			var wg _sync.WaitGroup
			wg.Add(2)
			go func() { _action.Sync_RootDocs(); wg.Done() }()
			go func() { Sp.Title(corecaps+" : Initialize", 1000, 1); wg.Done() }()
			wg.Wait()
			setup_report, setup_status := _action.Verify_Setup(concurrent)
			switch setup_status {
			case _action.Verify_Setup_Status_Uninitialized:
				_action.Initialize(concurrent)
				exitcode = 1
			case _action.Verify_Setup_Status_Initialized:
				S.Post(setup_report)
				exitcode = 1
			case _action.Verify_Setup_Status_Verified:
				report, _ := _action.Verify_Configs(true, concurrent)
				S.Post(report)
			}
		}
	case "debug":
		{
			exitcode = _compiler.Execute(corecaps+" : Debug "+flagmode, concurrent)
		}
	case "preview":
		{
			exitcode = _compiler.Execute(corecaps+" : Preview "+flagmode, concurrent)
		}
	case "publish":
		{
			exitcode = _compiler.Execute(corecaps+" : "+"Publishing for Production", concurrent)
		}
	case "iamai", "server":
		{
			if _, setup_status := _action.Verify_Setup(concurrent); setup_status == _action.Verify_Setup_Status_Uninitialized {
				exitcode = 0
			} else {
				if command == "iamai" {
					_action.Sync_RootDocs()
					S.Post(_config.Sync_References["agent"].Content)
				}

				if val, err := _strconv.Atoi(argone); err == nil {
					_config.Root.WebsocketPort = val
				}
				_server.Connect(_config.Root.WebsocketPort, concurrent)
			}
		}
	case "install":
		{
			S.Post(S.Tag.H3("Installing Artifacts", S.Preset.Primary, S.Style.AS_Bold))
			S.Post("\n")
			setup_report, setup_status := _action.Verify_Setup(concurrent)

			switch setup_status {
			case _action.Verify_Setup_Status_Uninitialized:
				S.Post(setup_report)
			case _action.Verify_Setup_Status_Initialized:
				exitcode = 1
				fallthrough
			case _action.Verify_Setup_Status_Verified:
				if config_message, config_ok := _action.Verify_Configs(true, concurrent); config_ok {
					update_ok, update_message, update_files := _compiler.Artifact_Install()
					if update_ok {
						_fileman.Write_Bulk(update_files, concurrent)
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
				X.List_Record("Available Commands", O.FromUnorderedMap(_config.Root.Commands)),
				X.List_Record("Agreements", func() *O.T[string, string] {
					res := O.New[string, string](len(_config.Sync_Agreements))
					for _, data := range _config.Sync_Agreements {
						res.Set(data.Title, data.Path)
					}
					return res
				}()),
				X.List_Record("References", func() *O.T[string, string] {
					res := O.New[string, string](len(_config.Sync_References))
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
