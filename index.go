package main

import (
	"encoding/json"
	_fmt "fmt"
	_log "log"
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	"main/models"
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

	var rootData models.Package_Json
	if str, err := _fileman.Read_File(rootPackagePath, false); err == nil {
		if json.Unmarshal([]byte(str), &rootData) == nil {
			_config.Root.Name = _string.TrimSpace(_util.String_Fallback(rootData.Name, _config.Root.Name))
			_config.Root.Version = _string.TrimSpace(_util.String_Fallback(rootData.Version, _config.Root.Version))
		}
	}

	if _action.Setup_Environment(packagedir, sourcedir, workpath, rootData.Flavour) {
		_config.Root.Flavour.Name = _string.TrimSpace(_util.String_Fallback(rootData.Flavour.Name))
		_config.Root.Flavour.Version = _string.TrimSpace(_util.String_Fallback(rootData.Flavour.Version))
	}

	var workData models.Package_Json
	if str, err := _fileman.Read_File(workPackagePath, false); err == nil {
		if json.Unmarshal([]byte(str), &workData) == nil {
			projectname := _util.String_Fallback(workData.Name, _config.Static.ProjectVersion)
			projectversion := _util.String_Fallback(workData.Version, _config.Static.ProjectName)
			_config.Static.ProjectVersion = projectversion
			_config.Static.ProjectName = _util.String_Filter(projectname, []rune{}, []rune{}, []rune{})
		}
	}

	packagecaps := _string.ToUpper(_config.Root.Name)
	flavourcaps := _string.ToUpper(_config.Root.Flavour.Name)
	
	_config.Static.Command = command
	_config.Static.Argument = argone

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
	if _fileman.Path_IfFile(_config.Root_Navigate["index"].Path) {
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
	case "void":

	case "init":
		{
			var wg _sync.WaitGroup
			wg.Add(2)
			go func() { _action.Sync_RootDocs(); wg.Done() }()
			go func() { Sp.Title(packagecaps+" : Initialize", 1000, 1); wg.Done() }()
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
			exitcode = _compiler.Execute(packagecaps+" : Debug "+flagmode, concurrent)
		}
	case "preview":
		{
			exitcode = _compiler.Execute(packagecaps+" : Preview "+flagmode, concurrent)
		}
	case "publish":
		{
			exitcode = _compiler.Execute(packagecaps+" : "+"Publishing for Production", concurrent)
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
			title := packagecaps + " @ v" + _config.Root.Version
			if len(flavourcaps) > 0 {
				title += " | " + flavourcaps
				if len(rootData.Flavour.Version) > 0 {
					title += " @ " + rootData.Flavour.Version
				}
			}

			S.Post(S.MAKE(S.Tag.H2(title, S.Preset.Title, S.Style.AS_Bold),
				[]string{
					_string.Trim(_config.Sync_References["notices"].Content, "\t\r\n ") + "\n",
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
				},
			))
		}
	}

	_os.Exit(exitcode)
}
