package compiler

import (
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	_stash "main/internal/stash"
	S "main/package/console"
	_fileman "main/package/fileman"
	_watcher "main/package/watcher"
	_map "maps"
	_os "os"
	_signal "os/signal"
	_slice "slices"
	_sync "sync"
	_syscall "syscall"
	_time "time"
)

type execute_Step_enum int

const (
	execute_Step_Exit execute_Step_enum = iota
	execute_Step_Initialize
	execute_Step_VerifySetupStruct
	execute_Step_ReadRootCss
	execute_Step_ReadLibraries
	execute_Step_VerifyConfigs
	execute_Step_ReadArtifacts
	execute_Step_ReadTargets
	execute_Step_ReadHashrule
	execute_Step_ProcessScaffold
	execute_Step_ProcessProxyFolders
	execute_Step_GenerateFiles
	execute_Step_Publish
	execute_Step_WatchFolders
)

func Execute(heading string) (Exitcode int) {
	exitcode := 0
	step := execute_Step_Initialize
	report := ""
	targets := []string{}
	report_next := false
	cycle_one := true
	outfiles := map[string]string{}
	var watcher *_watcher.Watcher
	var save_action _sync.WaitGroup

	for {
		switch step {
		case execute_Step_Initialize:
			S.Post(S.MAKE(S.Tag.H1(heading, S.Preset.Title), []string{}))
			fallthrough

		case execute_Step_VerifySetupStruct:
			if res_report, res_status := _action.Verify_Setup(); res_status != _action.Verify_Setup_Status_Verified {
				report = res_report
				step = execute_Step_WatchFolders
				break
			}
			fallthrough

		case execute_Step_ReadRootCss:
			_action.Save_RootCss()
			fallthrough

		case execute_Step_ReadLibraries:
			_action.Save_Libraries()
			fallthrough

		case execute_Step_VerifyConfigs:
			if res_report, res_status := _action.Verify_Configs(cycle_one); !res_status {
				report = res_report
				step = execute_Step_WatchFolders
				break
			} else {
				cycle_one = false
			}
			fallthrough

		case execute_Step_ReadArtifacts:
			_action.Save_Artifacts()
			fallthrough

		case execute_Step_ReadTargets:
			_action.Save_Targets()
			fallthrough

		case execute_Step_ReadHashrule:
			if res_report, res_status := _action.SaveHashrule(); !res_status {
				report = res_report
				step = execute_Step_WatchFolders
				break
			} else {
				report = ""
			}
			fallthrough

		case execute_Step_ProcessScaffold:
			Update_Scaffold()
			fallthrough

		case execute_Step_ProcessProxyFolders:
			Build_Targets()
			fallthrough

		case execute_Step_GenerateFiles:
			outfiles, report = Generate_Files()
			fallthrough

		case execute_Step_Publish:
			if len(outfiles) > 0 {
				save_action.Wait()
				save_action.Add(1)
				go func() {
					_fileman.Write_Bulk(outfiles)
					save_action.Done()
				}()
			}
			if report_next {
				X.Report(heading, targets, report, []string{})
				report_next = false
			}
			fallthrough

		case execute_Step_WatchFolders:
			if _config.Static.WATCH {

				step = execute_Step_WatchFolders

				if watcher == nil {
					watch_dirs := append(
						_slice.Collect(_map.Keys(_stash.Cache.Targetdir)),
						_config.Path_Folder["scaffold"].Path,
					)
					ignore_dirs := []string{
						_config.Path_Folder["autogen"].Path,
						_config.Path_Folder["archive"].Path,
					}

					if w, err := _watcher.Create(watch_dirs, ignore_dirs); err == nil {
						watcher = w
						sigs := make(chan _os.Signal, 1)
						_signal.Notify(sigs, _syscall.SIGINT)

						go func() {
							<-sigs
							if w != nil {
								w.Close()
								w = nil
								S.Render.Write("\n", 2)
							}
							_os.Exit(0)
						}()
					}
				}

				if watcher.Length() > 16 {
					watcher.Reset()
					step = execute_Step_Initialize
				} else if event := watcher.Pull(); event != nil {
					filepath := _fileman.Path_Join(event.Folder, event.FilePath)

					if event.Folder == _config.Path_Folder["scaffold"].Path {
						if event.Action == _watcher.E_Action_Update {
							switch filepath {
							case _config.Path_Json["configure"].Path:
								watcher.Close()
								watcher = nil
								step = execute_Step_VerifyConfigs
							case _config.Path_Css["atrules"].Path:
							case _config.Path_Css["constants"].Path:
							case _config.Path_Css["elements"].Path:
							case _config.Path_Css["extends"].Path:
								_action.Save_RootCss()
								step = execute_Step_GenerateFiles
							case _config.Path_Json["hashrule"].Path:
								step = execute_Step_ReadHashrule
							default:
								if _fileman.Path_IsSubpath(event.FilePath, _config.Path_Folder["libraries"].Path) &&
									event.Extension == "css" {
									_config.Static.Libraries_Saved[filepath] = event.FileContent
								} else if _fileman.Path_IsSubpath(filepath, _config.Path_Folder["artifacts"].Path) &&
									(event.Extension == _config.Root.Extension || event.Extension == "json") {
									_config.Static.Artifacts_Saved[filepath] = event.FileContent
								}
								step = execute_Step_ProcessScaffold
							}
						} else {
							step = execute_Step_VerifySetupStruct
						}
					} else if event.Action == _watcher.E_Action_Update || event.Action == _watcher.E_Action_Unlink {
						Update_Target(*event)
						step = execute_Step_GenerateFiles
					} else {
						step = execute_Step_VerifyConfigs
					}

					heading = event.TimeStamp + " | " + event.FilePath
					report_next = true
				}

				_time.Sleep(20 * _time.Millisecond)
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
