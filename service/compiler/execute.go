package compiler

import (
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	_stash "main/internal/stash"
	S "main/package/console"
	"main/package/fileman"
	_fileman "main/package/fileman"
	_watcher "main/package/watchman"
	_map "maps"
	_os "os"
	_signal "os/signal"
	_slice "slices"
	_sync "sync"
	_syscall "syscall"
	_time "time"
)

type Execute_Step_enum int

const (
	Execute_Step_Exit Execute_Step_enum = iota
	Execute_Step_Initialize
	Execute_Step_VerifySetupStruct
	Execute_Step_ReadRootCss
	Execute_Step_ReadLibraries
	Execute_Step_VerifyConfigs
	Execute_Step_ReadArtifacts
	Execute_Step_ReadTargets
	Execute_Step_ReadHashrule
	Execute_Step_ProcessBlueprint
	Execute_Step_UpdateCache
	Execute_Step_GenerateFiles
	Execute_Step_LoopAround
)

var ExecuteMutex _sync.Mutex
var WATCHER *_watcher.T_Watcher

func Execute(heading string) (Exitcode int) {
	exitcode := 0
	const interval = 100
	step := Execute_Step_Initialize
	report := ""
	report_next := false
	outfiles := map[string]string{}
	var save_action _sync.WaitGroup

	for {
		ExecuteMutex.Lock()

		switch step {
		case Execute_Step_Initialize:
			if heading != "" {
				S.Post(S.MAKE(S.Tag.H1(heading, S.Preset.Title), []string{}))
			}
			fallthrough

		case Execute_Step_VerifySetupStruct:
			if res_report, res_status := _action.Verify_Setup(); res_status != _action.Verify_Setup_Status_Verified {
				report = res_report
				step = Execute_Step_LoopAround
				break
			}
			fallthrough

		case Execute_Step_ReadRootCss:
			_action.Save_RootCss()
			fallthrough

		case Execute_Step_ReadLibraries:
			_action.Save_Libraries()
			fallthrough

		case Execute_Step_VerifyConfigs:
			if res_report, res_status := _action.Verify_Configs(false); !res_status {
				report = res_report
				step = Execute_Step_LoopAround
				break
			}
			fallthrough

		case Execute_Step_ReadArtifacts:
			_action.Save_Artifacts()
			fallthrough

		case Execute_Step_ReadTargets:
			_action.Save_Targets()
			fallthrough

		case Execute_Step_ReadHashrule:
			if res_report, res_status := _action.Save_Hashrule(); !res_status {
				report = res_report
				step = Execute_Step_LoopAround
				break
			} else {
				report = ""
			}
			fallthrough

		case Execute_Step_ProcessBlueprint:
			fallthrough

		case Execute_Step_UpdateCache:
			Update_Cache()
			if _config.Static.DRYRUN {
				Accumulate()
			}
			fallthrough

		case Execute_Step_GenerateFiles:
			if !_config.Static.DRYRUN {
				outfiles, report = Generate_Files()

				if len(outfiles) > 0 {
					save_action.Wait()
					save_action.Add(1)
					go func() {
						_fileman.Write_Bulk(outfiles)
						save_action.Done()
					}()
				}
				if report_next {
					X.Report(heading, []string{}, report, []string{})
					report_next = false
				}
			}
			fallthrough

		case Execute_Step_LoopAround:
			if _config.Static.WATCH {
				step = Execute_Step_LoopAround

				if WATCHER == nil {
					watch_dirs := append(
						_slice.Collect(_map.Keys(_stash.Cache.Targetdir)),
						_config.Path_Folder["blueprint"].Path,
					)
					ignore_dirs := []string{
						_config.Path_Folder["archive"].Path,
					}

					X.Report("Initial Build", watch_dirs, report, []string{})
					if w, err := _watcher.Instant(watch_dirs, ignore_dirs, interval); err == nil {
						WATCHER = w

						if !_config.Static.DRYRUN {
							sigs := make(chan _os.Signal, 1)
							_signal.Notify(sigs, _syscall.SIGINT)

							go func() {
								<-sigs
								if w != nil {
									w.Close()
									w = nil
									S.Render.Write("\r\n", 2)
								}
								_os.Exit(0)
							}()
						}
					} else {
						report = S.MAKE(
							S.Tag.H4("Unexpected error while creating watcher", S.Preset.Failed),
							[]string{S.Tag.Li(err.Error(), S.Preset.None)},
						)
						break
					}
				}

				if WATCHER.Length() > 12 {
					WATCHER.Reset()
					WATCHER = nil
					step = Execute_Step_Initialize
				} else if event := WATCHER.Pull(); event != nil {
					filepath := _fileman.Path_Join(event.Folder, event.FilePath)

					if event.Folder == _config.Path_Folder["blueprint"].Path {
						if event.Action == _watcher.E_Action_Update {

							switch filepath {
							case _config.Path_Json["configure"].Path:
								WATCHER.Close()
								WATCHER = nil
								step = Execute_Step_VerifyConfigs

							case _config.Path_Json["hashrule"].Path:
								step = Execute_Step_ReadHashrule

							case _config.Path_Css["atrules"].Path:
							case _config.Path_Css["constants"].Path:
							case _config.Path_Css["elements"].Path:
							case _config.Path_Css["extends"].Path:
								_action.Save_RootCss()
								step = Execute_Step_ProcessBlueprint

							default:
								if _fileman.Path_IsSubpath(_config.Path_Folder["libraries"].Path, filepath) &&
									event.Extension == "css" {
									_config.Static.Libraries_Saved[filepath] = event.FileContent
								} else if _fileman.Path_IsSubpath(_config.Path_Folder["artifacts"].Path, filepath) &&
									(event.Extension == _config.Root.Extension || event.Extension == "json") {
									_config.Static.Artifacts_Saved[filepath] = event.FileContent
								}
								step = Execute_Step_ProcessBlueprint
							}

						} else {
							step = Execute_Step_VerifySetupStruct
						}
					} else if event.Action == _watcher.E_Action_Update {
						step = Execute_Step_UpdateCache
						if target, ok := _config.Static.TargetDir_Saved[event.Folder]; ok && target.Stylesheet == event.FilePath {
							target.StylesheetContent = event.FileContent
							_config.Static.TargetDir_Saved[event.Folder] = target
						} else if _, ok := target.Extensions[event.Extension]; ok {
							target.Filepath_to_Content[event.FilePath] = event.FileContent
							_config.Static.TargetDir_Saved[event.Folder] = target
						} else {
							outpath := _fileman.Path_Join(target.Source, event.FilePath)
							fileman.Write_File(outpath, event.FileContent)
							step = Execute_Step_LoopAround
						}
					} else {
						step = Execute_Step_ReadTargets
					}

					heading = event.TimeStamp + " | " + event.FilePath
					report_next = true
				}

			}

		}

		ExecuteMutex.Unlock()
		if _config.Static.WATCH {
			_time.Sleep(interval * _time.Millisecond)
		} else {
			break
		}
	}

	save_action.Wait()
	if WATCHER == nil {
		S.Post(report)
	} else {
		WATCHER.Close()
		WATCHER = nil
	}

	return exitcode
}
