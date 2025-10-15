package server

import (
	"main/configs"
	"main/internal/action"
	"main/internal/stash"
	_fileman "main/package/fileman"
	_watcher "main/package/watchman"
	"main/service/compiler"
	"maps"
	_os "os"
	_signal "os/signal"
	"slices"
	_syscall "syscall"
	_time "time"
)

type Dryrun_Step_enum int

const (
	Dryrun_Step_Exit Dryrun_Step_enum = iota
	Dryrun_Step_Initialize
	Dryrun_Step_VerifySetupStruct
	Dryrun_Step_ReadRootCss
	Dryrun_Step_ReadLibraries
	Dryrun_Step_VerifyConfigs
	Dryrun_Step_ReadArtifacts
	Dryrun_Step_ReadTargets
	Dryrun_Step_ReadHashrule
	Dryrun_Step_ProcessScaffold
	Dryrun_Step_BuildManifest
	Dryrun_Step_GenerateFiles
	Dryrun_Step_Publish
	Dryrun_Step_LoopAround
)

func Dryrun(step Dryrun_Step_enum, watch bool) (*_watcher.T_Watcher, bool) {
	const interval = 10
	status := false
	var watcher *_watcher.T_Watcher

	go func() {
		for {
			switch step {

			case Dryrun_Step_Initialize:
				fallthrough

			case Dryrun_Step_VerifySetupStruct:
				if _, res_status := action.Verify_Setup(); res_status != action.Verify_Setup_Status_Verified {
					step = Dryrun_Step_LoopAround
					break
				}
				fallthrough

			case Dryrun_Step_ReadRootCss:
				action.Save_RootCss()
				fallthrough

			case Dryrun_Step_ReadLibraries:
				action.Save_Libraries()
				fallthrough

			case Dryrun_Step_VerifyConfigs:
				if _, res_status := action.Verify_Configs(false); !res_status {
					step = Dryrun_Step_LoopAround
					break
				}
				status = true
				fallthrough

			case Dryrun_Step_ReadArtifacts:
				action.Save_Artifacts()
				fallthrough

			case Dryrun_Step_ReadTargets:
				action.Save_Targets()
				fallthrough

			case Dryrun_Step_ReadHashrule:
				if _, res_status := action.Save_Hashrule(); !res_status {
					step = Dryrun_Step_LoopAround
					break
				}
				fallthrough

			case Dryrun_Step_ProcessScaffold:
				compiler.Update_Scaffold()
				fallthrough

			case Dryrun_Step_BuildManifest:
				compiler.Build_Targets()
				compiler.Accumulate()
				fallthrough

			case Dryrun_Step_LoopAround:
				if configs.Static.WATCH {
					step = Dryrun_Step_LoopAround

					if REFER.watcher == nil {
						watch_dirs := append(
							slices.Collect(maps.Keys(stash.Cache.Targetdir)),
							configs.Path_Folder["scaffold"].Path,
						)
						ignore_dirs := []string{
							configs.Path_Folder["autogen"].Path,
							configs.Path_Folder["archive"].Path,
						}

						if w, err := _watcher.Instant(watch_dirs, ignore_dirs, interval); err == nil {
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

					if REFER.watcher.Length() > 12 {
						REFER.watcher.Reset()
						REFER.watcher = nil
						step = Dryrun_Step_Initialize
					} else if event := REFER.watcher.Pull(); event != nil {
						filepath := _fileman.Path_Join(event.Folder, event.FilePath)

						if event.Folder == configs.Path_Folder["scaffold"].Path {
							if event.Action == _watcher.E_Action_Update {
								switch filepath {
								case configs.Path_Json["configure"].Path:
									REFER.watcher.Close()
									REFER.watcher = nil
									step = Dryrun_Step_VerifyConfigs
								case configs.Path_Css["atrules"].Path:
								case configs.Path_Css["constants"].Path:
								case configs.Path_Css["elements"].Path:
								case configs.Path_Css["extends"].Path:
									action.Save_RootCss()
									step = Dryrun_Step_GenerateFiles
								case configs.Path_Json["hashrule"].Path:
									step = Dryrun_Step_ReadHashrule
								default:
									if _fileman.Path_IsSubpath(event.FilePath, configs.Path_Folder["libraries"].Path) &&
										event.Extension == "css" {
										configs.Static.Libraries_Saved[filepath] = event.FileContent
									} else if _fileman.Path_IsSubpath(filepath, configs.Path_Folder["artifacts"].Path) &&
										(event.Extension == configs.Root.Extension || event.Extension == "json") {
										configs.Static.Artifacts_Saved[filepath] = event.FileContent
									}
									step = Dryrun_Step_ProcessScaffold
								}
							} else {
								step = Dryrun_Step_VerifySetupStruct
							}
						} else if event.Action == _watcher.E_Action_Update || event.Action == _watcher.E_Action_Refactor {
							compiler.Update_Target(*event)
							step = Dryrun_Step_GenerateFiles
						} else {
							step = Dryrun_Step_VerifyConfigs
						}
					}
					_time.Sleep(interval * _time.Millisecond)
				}
			}
			if !watch {
				break
			}
		}
	}()

	return watcher, status
}
