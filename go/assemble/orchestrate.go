package assemble

import (
	_action_ "main/action"
	_cache_ "main/cache"
	_craft_ "main/craft"
	"main/fileman"
	S "main/shell"
	"main/stash"
	_watcher_ "main/watcher"
	X "main/xhell"
	"maps"
	"os"
	"os/signal"
	"slices"
	"sync"
	"syscall"
	"time"
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

func orchestrate(heading string) {
	step := execute_Step_Initialize
	report := ""
	targets := []string{}
	report_next := false
	cycle_one := true
	// initial_heading := "Initial Build"
	outfiles := map[string]string{}
	var watcher *_watcher_.Watcher
	var save_action sync.WaitGroup

	for {
		switch step {
		case execute_Step_Initialize:
			S.Post(S.MAKE(S.Tag.H1(heading, S.Preset.Title), []string{}))
			fallthrough

		case execute_Step_VerifySetupStruct:
			if res_status, res_report := _action_.Verify_Setup(); res_status != _action_.Verify_Setup_Status_Verified {
				report = res_report
				step = execute_Step_WatchFolders
				break
			} else {
				report = ""
			}
			fallthrough

		case execute_Step_ReadRootCss:
			_action_.Save_RootCss()
			fallthrough

		case execute_Step_ReadLibraries:
			_action_.Save_Libraries()
			fallthrough

		case execute_Step_VerifyConfigs:
			if res_report, res_status := _action_.Verify_Configs(cycle_one); !res_status {
				report = res_report
				step = execute_Step_WatchFolders
				break
			} else {
				cycle_one = false
				report = ""
			}
			fallthrough 

		case execute_Step_ReadArtifacts:
			_action_.Save_Artifacts()
			fallthrough

		case execute_Step_ReadTargets:
			_action_.Save_Targets()
			fallthrough

		case execute_Step_ReadHashrule:
			if res_report, res_status := _action_.SaveHashrule(); !res_status {
				report = res_report
				step = execute_Step_WatchFolders
				break
			} else {
				report = ""
			}
			fallthrough

		case execute_Step_ProcessScaffold:
			_craft_.Update_Scaffold()
			fallthrough

		case execute_Step_ProcessProxyFolders:
			_craft_.Build_Targets()
			fallthrough

		case execute_Step_GenerateFiles:
			outfiles, report = _craft_.Generate_Files()
			// fallthrough

		case execute_Step_Publish:
			if len(outfiles) > 0 {
				save_action.Wait()
				save_action.Add(1)
				go func() {
					fileman.Write_Bulk(outfiles)
					save_action.Done()
				}()
			}
			if report_next {
				X.Report(heading, targets, report, []string{})
				report_next = false
			}
			fallthrough

		case execute_Step_WatchFolders:

			if _cache_.Static.WATCH {
				step = execute_Step_WatchFolders
			} else {
				break
			}

			if watcher == nil {
				watch_dirs := append(
					slices.Collect(maps.Keys(stash.Cache.Targetdir)),
					_cache_.Path_Folder["scaffold"].Path,
				)
				ignore_dirs := []string{
					_cache_.Path_Folder["autogen"].Path,
					_cache_.Path_Folder["archive"].Path,
				}
				X.Report(heading, targets, report, []string{})

				if w, err := _watcher_.Create(watch_dirs, ignore_dirs); err == nil {
					watcher = w
					sigs := make(chan os.Signal, 1)
					signal.Notify(sigs, syscall.SIGINT)

					go func() {
						<-sigs
						if w != nil {
							w.Close()
							w = nil
							S.Render.Write("\n", 2)
						}
						os.Exit(0)
					}()
				}
			}

			if watcher.Length() > 16 {
				watcher.Reset()
				step = execute_Step_Initialize
			} else if event := watcher.Pull(); event != nil {
				filepath := fileman.Path_Join(event.Folder, event.FilePath)

				if event.Folder == _cache_.Path_Folder["scaffold"].Path {
					if event.Action == _watcher_.Action_Update {
						switch filepath {
						case _cache_.Path_Json["configure"].Path:
							watcher.Close()
							watcher = nil
							step = execute_Step_VerifyConfigs
						case _cache_.Path_Css["atrules"].Path:
						case _cache_.Path_Css["constants"].Path:
						case _cache_.Path_Css["elements"].Path:
						case _cache_.Path_Css["extends"].Path:
							_action_.Save_RootCss()
							step = execute_Step_GenerateFiles
						case _cache_.Path_Json["hashrule"].Path:
							step = execute_Step_ReadHashrule
						default:
							if fileman.Path_IsSubpath(event.FilePath, _cache_.Path_Folder["libraries"].Path) &&
								event.Extension == "css" {
								_cache_.Static.Libraries_Saved[filepath] = event.FileContent
							} else if fileman.Path_IsSubpath(filepath, _cache_.Path_Folder["artifacts"].Path) &&
								(event.Extension == _cache_.Root.Extension || event.Extension == "json") {
								_cache_.Static.Artifacts_Saved[filepath] = event.FileContent
							}
							step = execute_Step_ProcessScaffold
						}
					} else {
						step = execute_Step_VerifySetupStruct
					}
				} else if event.Action == _watcher_.Action_Update || event.Action == _watcher_.Action_Unlink {
					_craft_.Update_Target(*event)
					step = execute_Step_GenerateFiles
				} else {
					step = execute_Step_VerifyConfigs
				}

				heading = event.TimeStamp + " | " + event.FilePath
				report_next = true
			}

			time.Sleep(20 * time.Millisecond)

		}

		if !_cache_.Static.WATCH {
			break
		}
	}

	if !_cache_.Static.WATCH {
		S.Post(report)
	} else if watcher != nil {
		watcher.Close()
		watcher = nil
	}
}
