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

// Path_FromBinFolder joins the given path elements to the calculated root directory.
func Path_FromBinFolder(elem ...string) (string, error) {
	filename, err := _os.Executable()

	if err != nil {
		return "", _fmt.Errorf("failed to get current file path for root calculation")
	}
	root := _filepath.Dir(filename)
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

	relWorkpath := "."
	absWorkpath, _ := _fileman.Path_Resolves(relWorkpath)
	workPackagePath, _ := _fileman.Path_Resolves("package.json")
	var workData models.Compiler_Config
	if str, err := _fileman.Read_File(workPackagePath, false); err == nil {
		if json.Unmarshal([]byte(str), &workData) == nil {
			projectname := _util.String_Fallback(workData.Name, _config.Static.ProjectVersion)
			projectversion := _util.String_Fallback(workData.Version, _config.Static.ProjectName)
			_config.Static.ProjectVersion = projectversion
			_config.Static.ProjectName = _util.String_Filter(projectname, []rune{}, []rune{}, []rune{})
		}
	}

	compilerDir, _ := Path_FromBinFolder("..")
	compilerConfigPath, _ := Path_FromBinFolder("configs.json")
	
	var compilerConfig models.Compiler_Config
	if str, err := _fileman.Read_File(compilerConfigPath, false); err == nil {
		json.Unmarshal([]byte(str), &compilerConfig)
	}
	_action.Setup_Environment(compilerDir, relWorkpath, absWorkpath, compilerConfig)

	_config.Static.Command = command
	_config.Static.Argument = argone

	_config.Static.DEBUG = command == "debug"
	_config.Static.IAMAI = command == "iamai"
	_config.Static.WATCH = command == "server" || command == "watch"
	_config.Static.SERVER = command == "server"
	_config.Static.MINIFY = !_config.Static.DEBUG || !_config.Static.SERVER
	_config.Static.PREVIEW = command == "preview" || command == "watch"

	S.Canvas.Initialize(
		!_config.Static.WATCH && _slice.Contains([]string{"debug", "watch", "preview", "publish", "init", "install"}, command),
		true, 2,
	)

	exitcode := 0

	_config.Reset(false)
	if _config.Static.Command != "void" && _fileman.Path_IfFile(_fileman.Path_Join(compilerDir, ".gitignore")) {
		pprof, e := _server.RequestAvailablePort(0)
		if e == nil {
			go func() {
				_log.Println(_http.ListenAndServe(_fmt.Sprint("localhost:", pprof), nil))
			}()
			S.Post(S.Tag.H2(_fmt.Sprint("[DEV] | Pprof Port: ", pprof), S.Preset.Tertiary))
		}
	}

	title := _string.ToUpper(_config.Root.Name)
	vtitle := title + " @ v" + _config.Root.Version
	flavourcaps := _string.ToUpper(_config.Root.Flavor.Name)

	if len(flavourcaps) > 0 {
		vtitle += " | " + flavourcaps
		if len(_config.Root.Flavor.Version) > 0 {
			vtitle += " @ " + _config.Root.Flavor.Version
		}
	}
	if len(flavourcaps) > 0 {
		title += " | " + flavourcaps
	}

	switch _config.Static.Command {

	case "void":
		if argone == "sync" {
			_action.Sync_RootDocs()
		}

	case "init":
		{
			var wg _sync.WaitGroup
			wg.Add(2)
			go func() { _action.Sync_RootDocs(); wg.Done() }()
			go func() { Sp.Title(title+" : Initialize", 1000, 1); wg.Done() }()
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
			exitcode = _compiler.Execute(title + " : Debug")
		}
	case "watch":
		{
			exitcode = _compiler.Execute(title + " : Watch")
		}
	case "preview":
		{
			exitcode = _compiler.Execute(title + " : Preview")
		}
	case "publish":
		{
			exitcode = _compiler.Execute(title + " : " + "Publishing for Production")
		}
	case "iamai", "server":
		{
			if _, setup_status := _action.Verify_Setup(); setup_status == _action.Verify_Setup_Status_Uninitialized {
				exitcode = 0
			} else {
				if command == "iamai" {
					_action.Sync_RootDocs()
					S.Post(_config.Sync_References["agent"].Content)
				}

				if val, err := _strconv.Atoi(argone); err == nil {
					_config.Root.WebsocketPort = val
				}
				_server.Connect(_config.Root.WebsocketPort)
			}
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

			S.Post(S.MAKE(S.Tag.H2(vtitle, S.Preset.Title, S.Style.AS_Bold),
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
