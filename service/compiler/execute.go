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
	"strconv"
	_sync "sync"
	_atomic "sync/atomic"
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
	Execute_Step_UpdateCache
	Execute_Step_GenerateFiles
	Execute_Step_LoopAround
)

var WATCHER *_watcher.T_Watcher
var ExecuteMutex _sync.Mutex
var RebuildFlag _atomic.Bool
var RebuildTicker *_time.Ticker
var RebuildTickerReset func()

func startRebuildTicker(intervalMs int) {
	var tickerDuration _time.Duration
	RebuildTickerReset = func() { tickerDuration = _time.Duration(intervalMs) * _time.Millisecond }
	RebuildTickerReset()

	go func() {
		RebuildTicker = _time.NewTicker(tickerDuration)
		defer RebuildTicker.Stop()

		for range RebuildTicker.C {
			RebuildFlag.Store(true)
		}
	}()
}

func Execute(heading string) (Exitcode int) {
	exitcode := 0
	step := Execute_Step_Initialize
	report := ""
	outfiles := map[string]string{}
	showReport := true
	var save_action _sync.WaitGroup

	if _config.Static.WATCH && _config.Root.RebuildInterval > 0 {
		startRebuildTicker(_config.Root.RebuildInterval)
	}

	for {
		ExecuteMutex.Lock()

		switch step {
		case Execute_Step_Initialize:
			if heading != "" {
				S.Post(S.MAKE(S.Tag.H1(heading, S.Preset.Title, S.Style.AS_Bold), []string{}))
				heading = ""
			}
			fallthrough

		case Execute_Step_VerifySetupStruct:
			if RebuildFlag.Load() {
				showReport = false
				RebuildFlag.Store(false)
			}
			if RebuildTicker != nil {
				RebuildTickerReset()
			}
			if res_report, res_status := _action.Verify_Setup(); res_status != _action.Verify_Setup_Status_Verified {
				report = res_report
				step = Execute_Step_LoopAround
				showReport = true
				exitcode = 1
				break
			} else if WATCHER != nil {
				WATCHER.Close()
				WATCHER = nil
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
				exitcode = 1
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
				exitcode = 1
				break
			}
			fallthrough

		case Execute_Step_UpdateCache:
			Update_Cache()
			if _config.Static.SERVER {
				Accumulate()
			}
			fallthrough

		case Execute_Step_GenerateFiles:
			if !_config.Static.SERVER {
				outfiles, report = Generate_Files()
				if len(outfiles) > 0 {
					save_action.Wait()
					save_action.Add(1)
					go func() {
						_fileman.Write_Bulk(outfiles)
						save_action.Done()
					}()
				}
			}
			fallthrough

		case Execute_Step_LoopAround:
			if _config.Static.WATCH {

				if WATCHER == nil {
					watch_dirs := append(
						_slice.Collect(_map.Keys(_stash.Cache.Targetdir)),
						_config.Path_Folder["blueprint"].Path,
					)
					ignore_dirs := []string{
						_config.Path_Folder["archive"].Path,
					}

					if watcher, err := _watcher.Quick(watch_dirs, ignore_dirs, _config.Root.PollingInterval); err == nil {
						WATCHER = watcher

						if !_config.Static.SERVER {
							sigs := make(chan _os.Signal, 1)
							_signal.Notify(sigs, _syscall.SIGINT)

							go func() {
								<-sigs
								if watcher != nil {
									watcher.Close()
									watcher = nil
									S.Render.Write("\r\n", 2)
								}
								_os.Exit(1)
							}()
						}
					} else {
						report = S.MAKE(
							S.Tag.H4("Unexpected error while creating watcher", S.Preset.Failed, S.Style.AS_Bold),
							[]string{S.Tag.Li(err.Error(), S.Preset.None)},
						)
						break
					}
				}

				step = Execute_Step_LoopAround
				if RebuildFlag.Load() {
					step = Execute_Step_VerifySetupStruct
				} else if events := WATCHER.DeBuf(); len(events) > 0 {
					steppings := []Execute_Step_enum{}
					for _, event := range events {

						filepath := _fileman.Path_Join(event.Folder, event.FilePath)
						breaknow := false

						if event.Folder == _config.Path_Folder["blueprint"].Path {
							if event.Action == _watcher.E_Action_Update {

								switch filepath {
								case _config.Path_Json["configure"].Path:
									steppings = append(steppings, Execute_Step_VerifyConfigs)
									breaknow = true

								case _config.Path_Json["hashrule"].Path:
									steppings = append(steppings, Execute_Step_ReadHashrule)
									breaknow = true

								case _config.Path_Css["atrules"].Path:
									fallthrough
								case _config.Path_Css["constants"].Path:
									fallthrough
								case _config.Path_Css["elements"].Path:
									fallthrough
								case _config.Path_Css["extends"].Path:
									_action.Save_RootCss()
									steppings = append(steppings, Execute_Step_UpdateCache)

								default:
									if _fileman.Path_HasChildPath(_config.Path_Folder["libraries"].Path, filepath) &&
										event.Extension == "css" {
										_config.Static.Libraries_Saved[filepath] = event.FileContent
									} else if _fileman.Path_HasChildPath(_config.Path_Folder["artifacts"].Path, filepath) &&
										(event.Extension == _config.Root.Extension || event.Extension == "json") {
										_config.Static.Artifacts_Saved[filepath] = event.FileContent
									}
									steppings = append(steppings, Execute_Step_UpdateCache)
								}

							} else {
								steppings = append(steppings, Execute_Step_VerifySetupStruct)
								breaknow = true
							}
						} else if event.Action == _watcher.E_Action_Update {
							if target, ok := _config.Static.TargetDir_Saved[event.Folder]; ok && target.Stylesheet == event.FilePath {
								target.StylesheetContent = event.FileContent
								_config.Static.TargetDir_Saved[event.Folder] = target
								steppings = append(steppings, Execute_Step_UpdateCache)
							} else if _, ok := target.Extensions[event.Extension]; ok {
								target.Filepath_to_Content[event.FilePath] = event.FileContent
								_config.Static.TargetDir_Saved[event.Folder] = target
								steppings = append(steppings, Execute_Step_UpdateCache)
							} else {
								outpath := _fileman.Path_Join(target.Source, event.FilePath)
								go _fileman.Write_File(outpath, event.FileContent)
								steppings = append(steppings, Execute_Step_LoopAround)
							}
						} else {
							steppings = append(steppings, Execute_Step_ReadTargets)
						}
						heading = event.TimeStamp + " | " + strconv.Itoa(len(events)) + " files changed."

						if breaknow {
							break
						}
					}

					for _, i := range steppings {
						if i < step {
							step = i
						}
					}
				}
			}
		}

		ExecuteMutex.Unlock()
		if _config.Static.WATCH {
			if !_config.Static.SERVER && len(report) > 0 && showReport {
				S.Post(X.Report(heading, []string{}, report))
			}
			report = ""
			heading = ""
			showReport = true
			_time.Sleep(_time.Duration(_config.Root.WaitingInterval) * _time.Millisecond)
		} else {
			S.Post(report)
			break
		}
	}

	save_action.Wait()
	if WATCHER != nil {
		WATCHER.Close()
		WATCHER = nil
	}

	return exitcode
}
