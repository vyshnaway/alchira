package server

import (
	"main/configs"
	"main/internal/action"
	"main/internal/stash"
	_fileman "main/package/fileman"
	_watcher "main/package/watcher"
	"main/service/compiler"
	"maps"
	_os "os"
	_signal "os/signal"
	"slices"
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
	Execute_Step_ProcessScaffold
	Execute_Step_BuildManifest
	Execute_Step_GenerateFiles
	Execute_Step_Publish
	Execute_Step_LoopAround
)

func Dryrun(step Execute_Step_enum) (Status bool) {
	status := false
	const interval = 200
	var watcher *_watcher.T_Watcher

	switch step {
	case Execute_Step_Initialize:
		fallthrough

	case Execute_Step_VerifySetupStruct:
		if _, res_status := action.Verify_Setup(); res_status != action.Verify_Setup_Status_Verified {
			step = Execute_Step_LoopAround
			break
		}
		fallthrough

	case Execute_Step_ReadRootCss:
		action.Save_RootCss()
		fallthrough

	case Execute_Step_ReadLibraries:
		action.Save_Libraries()
		fallthrough

	case Execute_Step_VerifyConfigs:
		if _, res_status := action.Verify_Configs(false); !res_status {
			step = Execute_Step_LoopAround
			break
		}
		status = true
		fallthrough

	case Execute_Step_ReadArtifacts:
		action.Save_Artifacts()
		fallthrough

	case Execute_Step_ReadTargets:
		action.Save_Targets()
		fallthrough

	case Execute_Step_ReadHashrule:
		if _, res_status := action.Save_Hashrule(); !res_status {
			step = Execute_Step_LoopAround
			break
		}
		fallthrough

	case Execute_Step_ProcessScaffold:
		compiler.Update_Scaffold()
		fallthrough

	case Execute_Step_BuildManifest:
		compiler.Build_Targets()
		compiler.Accumulate()
		fallthrough

	case Execute_Step_LoopAround:
		if configs.Static.WATCH {
			step = Execute_Step_LoopAround

			if watcher == nil {
				watch_dirs := append(
					slices.Collect(maps.Keys(stash.Cache.Targetdir)),
					configs.Path_Folder["scaffold"].Path,
				)
				ignore_dirs := []string{
					configs.Path_Folder["autogen"].Path,
					configs.Path_Folder["archive"].Path,
				}

				if w, err := _watcher.Create(watch_dirs, ignore_dirs, interval); err == nil {
					watcher = w
					sigs := make(chan _os.Signal, 1)
					_signal.Notify(sigs, _syscall.SIGINT)

					go func() {
						<-sigs
						if w != nil {
							w.Close()
							w = nil
						}
						_os.Exit(0)
					}()
				} else {
					break
				}
			}

			if watcher.Length() > 12 {
				watcher.Reset()
				watcher = nil
				step = Execute_Step_Initialize
			} else if event := watcher.Pull(); event != nil {
				filepath := _fileman.Path_Join(event.Folder, event.FilePath)

				if event.Folder == configs.Path_Folder["scaffold"].Path {
					if event.Action == _watcher.E_Action_Update {
						switch filepath {
						case configs.Path_Json["configure"].Path:
							watcher.Close()
							watcher = nil
							step = Execute_Step_VerifyConfigs
						case configs.Path_Css["atrules"].Path:
						case configs.Path_Css["constants"].Path:
						case configs.Path_Css["elements"].Path:
						case configs.Path_Css["extends"].Path:
							action.Save_RootCss()
							step = Execute_Step_GenerateFiles
						case configs.Path_Json["hashrule"].Path:
							step = Execute_Step_ReadHashrule
						default:
							if _fileman.Path_IsSubpath(event.FilePath, configs.Path_Folder["libraries"].Path) &&
								event.Extension == "css" {
								configs.Static.Libraries_Saved[filepath] = event.FileContent
							} else if _fileman.Path_IsSubpath(filepath, configs.Path_Folder["artifacts"].Path) &&
								(event.Extension == configs.Root.Extension || event.Extension == "json") {
								configs.Static.Artifacts_Saved[filepath] = event.FileContent
							}
							step = Execute_Step_ProcessScaffold
						}
					} else {
						step = Execute_Step_VerifySetupStruct
					}
				} else if event.Action == _watcher.E_Action_Update || event.Action == _watcher.E_Action_Refactor {
					compiler.Update_Target(*event)
					step = Execute_Step_GenerateFiles
				} else {
					step = Execute_Step_VerifyConfigs
				}
			}
			_time.Sleep(interval * _time.Millisecond)
		}
	}

	return status
}
