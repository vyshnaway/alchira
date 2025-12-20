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
	_strconv "strconv"
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
	Execute_Step_UpdateCache
	Execute_Step_GenerateFiles
	Execute_Step_LoopAround
)

var startStamp int64
var CycleStamp int64

func ResetRebuildTicker() {
	intervalVal, _ := _config.Saved.Tweaks["reload-period"].(int)
	if _config.Static.SERVER {
		intervalVal = 10
	}
	if intervalVal < 0 {
		intervalVal = -intervalVal
	}
	tickerDuration := _time.Duration(intervalVal+1) * _time.Second

	if _config.Static.RebuildTicker == nil {
		_config.Static.RebuildTicker = _time.NewTicker(tickerDuration)
		go func(ticker *_time.Ticker) {
			defer ticker.Stop()
			for range ticker.C {
				_config.Static.RebuildFlag.Store(true)
			}
		}(_config.Static.RebuildTicker)
	}

	if intervalVal < 1 {
		_config.Static.RebuildTicker.Stop()
	} else {
		_config.Static.RebuildTicker.Reset(tickerDuration)
	}
}

func Execute(heading string) (Exitcode int) {
	exitcode := 0
	step := Execute_Step_Initialize
	report := ""
	outfiles := map[string]string{}
	showReport := true
	watchman := _config.Static.Watchman
	watchman.PollIntervalMs = _config.Root.PollingInterval

	var save_action _sync.WaitGroup

	if _config.Static.WATCH {
		if !_config.Static.IAMAI {
			ResetRebuildTicker()
		}

		if !_config.Static.SERVER || !_config.Static.IAMAI {
			sigs := make(chan _os.Signal, 1)
			_signal.Notify(sigs, _syscall.SIGINT)

			go func() {
				<-sigs
				watchman.Close()
				S.Render.Write("\n"+S.Tag.H5("Ok, I will stop watching!!!", S.Preset.Failed, S.Style.AS_Bold), 3)
				save_action.Wait()
				_os.Exit(1)
			}()
		}
	}

	for {
		now := _time.Now().UnixMilli()
		CycleStamp = now - startStamp
		startStamp = now

		_config.Static.ExecuteMutex.Lock()

		switch step {
		case Execute_Step_Initialize:
			if heading != "" {
				S.Post(S.MAKE(S.Tag.H1(heading, S.Preset.Title, S.Style.AS_Bold), []string{}))
				heading = ""
			}
			fallthrough

		case Execute_Step_VerifySetupStruct:
			if _config.Static.RebuildFlag.Load() {
				_config.Reset(true)
				showReport = false
			}

			res_report, res_status := _action.Verify_Setup()
			switch res_status {
			case _action.Verify_Setup_Status_Uninitialized:
				report = res_report
				showReport = true
				_config.Static.WATCH = false
			case _action.Verify_Setup_Status_Verified:
				step = Execute_Step_LoopAround
			default:
				if res_status == _action.Verify_Setup_Status_Initialized {
					exitcode = 1
					report = res_report
				} else {
					exitcode = 1
					showReport = true
					report = res_report
					_config.Static.WATCH = false
					break
				}
			}
			fallthrough

		case Execute_Step_ReadRootCss:
			_action.Save_RootCss()
			fallthrough

		case Execute_Step_ReadLibraries:
			_action.Save_Libraries()
			fallthrough

		case Execute_Step_VerifyConfigs:
			res_report, res_status := _action.Verify_Configs(false)
			ResetRebuildTicker()
			if !res_status {
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
			S.STEP("Extracting CSS", 1)
			SetReferences()
			if _config.Static.SERVER {
				Accumulate()
			}
			fallthrough

		case Execute_Step_GenerateFiles:
			S.STEP("Rebuilding Files", 1)
			if !_config.Static.SERVER {
				new_outfiles, new_report := Generate_Files()
				for filepath, new_content := range outfiles {
					if old_content, exist := outfiles[filepath]; exist && old_content == new_content {
						delete(new_outfiles, filepath)
					}
				}
				outfiles = new_outfiles
				if len(outfiles) > 0 {
					report = new_report
					save_action.Wait()
					save_action.Add(1)
					go func() {
						// _fileman.Write_Bulk(outfiles)
						save_action.Done()
					}()
				}
			}
			S.TASK("Compilation complete", 1)
			fallthrough

		case Execute_Step_LoopAround:
			if _config.Static.WATCH {

				if !watchman.Status {
					watchman.Add_WatchingFolder(append(
						_slice.Collect(_map.Keys(_stash.Cache.Targetdir)),
						_config.Path_Folder["blueprint"].Path,
					))
					watchman.Add_IgnoredFolder([]string{
						_config.Path_Folder["archive"].Path,
					})

					watchman.Start()
				}

				step = Execute_Step_LoopAround
				if _config.Static.RebuildFlag.Load() {
					step = Execute_Step_VerifySetupStruct
				} else if watchman.Status {
					if events := watchman.DeBuf(); len(events) > 0 {
						steppings := []Execute_Step_enum{}
						for _, event := range events {

							filepath := _fileman.Path_Join(event.Folder, event.FilePath)
							breaknow := false

							if event.Folder == _config.Path_Folder["blueprint"].Path {
								if event.Action == _watcher.E_Method_Update {

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
											_config.Saved.Libraries_Saved[filepath] = event.FileContent
										} else if _fileman.Path_HasChildPath(_config.Path_Folder["artifacts"].Path, filepath) &&
											(event.Extension == _config.Root.Extension || event.Extension == "json") {
											_config.Saved.Artifacts_Saved[filepath] = event.FileContent
										}
										steppings = append(steppings, Execute_Step_UpdateCache)
									}

								} else {
									steppings = append(steppings, Execute_Step_VerifySetupStruct)
									breaknow = true
								}
							} else if event.Action == _watcher.E_Method_Update {
								if target, ok := _config.Saved.TargetDir_Saved[event.Folder]; ok && target.Stylesheet == event.FilePath {
									target.StylesheetContent = event.FileContent
									_config.Saved.TargetDir_Saved[event.Folder] = target
									steppings = append(steppings, Execute_Step_UpdateCache)
								} else if _, ok := target.Extensions[event.Extension]; ok {
									target.Filepath_to_Content[event.FilePath] = event.FileContent
									_config.Saved.TargetDir_Saved[event.Folder] = target
									steppings = append(steppings, Execute_Step_UpdateCache)
								} else if !_config.Static.SERVER {
									outpath := _fileman.Path_Join(target.Source, event.FilePath)
									go _fileman.Write_File(outpath, event.FileContent)
									steppings = append(steppings, Execute_Step_LoopAround)
								}
							} else {
								steppings = append(steppings, Execute_Step_ReadTargets)
							}
							heading = event.TimeStamp + " | " + _strconv.Itoa(len(events)) + " files changed."

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
		}

		_config.Static.ExecuteMutex.Unlock()
		if _config.Static.SERVER || _config.Static.IAMAI {
			report = ""
		}
		if _config.Static.WATCH {
			if !_config.Static.SERVER && !_config.Static.IAMAI && len(report) > 0 && showReport {
				S.Post(X.Report(heading, []string{}, report))
				S.Render.Write(X.Report(heading, []string{}, report), 2)
			}
			report = ""
			heading = ""
			showReport = true
			// _time.Sleep(_time.Duration(_config.Root.WaitingInterval) * _time.Millisecond)
		} else {
			S.Post(report)
			break
		}
	}
	save_action.Wait()
	return exitcode
}
