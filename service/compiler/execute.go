package compiler

import (
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	_stash "main/internal/stash"
	S "main/package/console"
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
	Execute_Step_ProcessProxyFolders
	Execute_Step_GenerateFiles
	Execute_Step_Publish
	Execute_Step_LoopAround
)

func Execute(heading string) (Exitcode int) {
	exitcode := 0
	const interval = 100
	step := Execute_Step_Initialize
	report := ""
	report_next := false
	outfiles := map[string]string{}
	var watcher *_watcher.T_Watcher
	var save_action _sync.WaitGroup

	for {
		switch step {
		case Execute_Step_Initialize:
			S.Post(S.MAKE(S.Tag.H1(heading, S.Preset.Title), []string{}))
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
			Update_Blueprint()
			fallthrough

		case Execute_Step_ProcessProxyFolders:
			Build_Targets()
			fallthrough

		case Execute_Step_GenerateFiles:
			outfiles, report = Generate_Files()
			fallthrough

		case Execute_Step_Publish:
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
			fallthrough

		case Execute_Step_LoopAround:
			if _config.Static.WATCH {
				step = Execute_Step_LoopAround

				if watcher == nil {
					watch_dirs := append(
						_slice.Collect(_map.Keys(_stash.Cache.Targetdir)),
						_config.Path_Folder["blueprint"].Path,
					)
					ignore_dirs := []string{
						_config.Path_Folder["archive"].Path,
					}

					X.Report("Initial Build", watch_dirs, report, []string{})
					if w, err := _watcher.Instant(watch_dirs, ignore_dirs, interval); err == nil {
						watcher = w
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
					} else {
						report = S.MAKE(
							S.Tag.H4("Unexpected error while creating watcher", S.Preset.Failed),
							[]string{S.Tag.Li(err.Error(), S.Preset.None)},
						)
						break
					}
				}

				if watcher.Length() > 12 {
					watcher.Reset()
					watcher = nil
					step = Execute_Step_Initialize
				} else if event := watcher.Pull(); event != nil {
					filepath := _fileman.Path_Join(event.Folder, event.FilePath)

					if event.Folder == _config.Path_Folder["blueprint"].Path {
						if event.Action == _watcher.E_Action_Update {
							switch filepath {
							case _config.Path_Json["configure"].Path:
								watcher.Close()
								watcher = nil
								step = Execute_Step_VerifyConfigs
							case _config.Path_Css["atrules"].Path:
							case _config.Path_Css["constants"].Path:
							case _config.Path_Css["elements"].Path:
							case _config.Path_Css["extends"].Path:
								_action.Save_RootCss()
								step = Execute_Step_GenerateFiles
							case _config.Path_Json["hashrule"].Path:
								step = Execute_Step_ReadHashrule
							default:
								if _fileman.Path_IsSubpath(event.FilePath, _config.Path_Folder["libraries"].Path) &&
									event.Extension == "css" {
									_config.Static.Libraries_Saved[filepath] = event.FileContent
								} else if _fileman.Path_IsSubpath(filepath, _config.Path_Folder["artifacts"].Path) &&
									(event.Extension == _config.Root.Extension || event.Extension == "json") {
									_config.Static.Artifacts_Saved[filepath] = event.FileContent
								}
								step = Execute_Step_ProcessBlueprint
							}
						} else {
							step = Execute_Step_VerifySetupStruct
						}
					} else if event.Action == _watcher.E_Action_Update || event.Action == _watcher.E_Action_Refactor {
						Update_Target(*event)
						step = Execute_Step_GenerateFiles
					} else {
						step = Execute_Step_VerifyConfigs
					}

					heading = event.TimeStamp + " | " + event.FilePath
					report_next = true
				}

				_time.Sleep(interval * _time.Millisecond)
			}

		}

		if !_config.Static.WATCH {
			break
		}
	}

	save_action.Wait()
	if watcher == nil {
		S.Post(report)
	} else {
		watcher.Close()
		watcher = nil
	}

	return exitcode
}
