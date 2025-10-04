package action

import (
	"encoding/json"
	_fmt_ "fmt"
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	S "main/shell"
	_types_ "main/types"
	X "main/xhell"
	_filepath_ "path/filepath"
	_sync_ "sync"
)

type verify_Setup_Status_enum int

const (
	Verify_Setup_Status_Uninitialized verify_Setup_Status_enum = 0
	Verify_Setup_Status_Initialized   verify_Setup_Status_enum = 1
	Verify_Setup_Status_Verified      verify_Setup_Status_enum = 2
)

func Verify_Setup() (Status verify_Setup_Status_enum, Report string) {
	status := Verify_Setup_Status_Uninitialized
	report := ""

	if _fileman_.Path_IfDir(_cache_.Path_Folder["scaffold"].Path) {
		_fileman_.Write_File(_cache_.Path_Files["reference"].Path, _cache_.Sync_References["readme"].Content)
		_fileman_.Write_File(_cache_.Path_Files["guildelines"].Path, _cache_.Sync_References["guildelines"].Content)
		_fileman_.Clone_Safe(_cache_.Sync_Blueprint["scaffold"].Path, _cache_.Path_Folder["scaffold"].Path, []string{})

		errors := map[string]string{}
		S.TASK("Verifying directory status", 0)

		for _, v := range _cache_.Path_Folder {
			if v.Essential && !_fileman_.Path_IfDir(v.Path) {
				S.STEP("Path: "+v.Path, 1)
				errors[v.Path] = "Path not found."
			}
		}

		for _, val := range []map[string]_types_.File_Source{
			_cache_.Path_Autogen,
			_cache_.Path_Css,
			_cache_.Path_Files,
			_cache_.Path_Json,
		} {
			for _, v := range val {
				if v.Essential && !_fileman_.Path_IfFile(v.Path) {
					S.STEP("Path: "+v.Path, 1)
					errors[v.Path] = "Path not found."
				}
			}
		}

		S.TASK("Verification Complete", 1)

		if len(errors) == 0 {
			status = Verify_Setup_Status_Verified
			report = S.Tag.H4("Setup Healthy", S.Preset.Success, S.Style.AS_Bold)
		} else {
			status = Verify_Setup_Status_Initialized
			report = S.MAKE(
				S.Tag.H4("Error Paths", S.Preset.Failed),
				X.List_Props(errors, []string{}, []string{}),
				S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Failed, Styles: []string{}},
			)
		}
	} else {
		report = S.MAKE(
			S.Tag.H4("Setup not initialized in directory.", S.Preset.Warning, S.Style.AS_Bold),
			[]string{`Use "init" command to initialize.`},
			S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Warning, Styles: []string{}},
		)
	}

	return status, report
}

type Verify_ProxyMapDependency_return struct {
	Warnings []string
	Messages []string
}

// ProxyMapDependency validates and processes proxy map dependencies
func verify_ConflictsAndSync() Verify_ProxyMapDependency_return {
	proxymap := _cache_.Static.ProxyMap
	configdir := _cache_.Path_Folder["scaffold"].Path

	result := Verify_ProxyMapDependency_return{
		Warnings: []string{},
		Messages: []string{},
	}

	var wg _sync_.WaitGroup
	warning_channel := make(chan string, len(proxymap)*8)
	notification_channel := make(chan string, len(proxymap))

	for index, ip := range proxymap {
		wg.Add(1)

		go func(i int, m _types_.Config_ProxyMap) {
			defer wg.Done()
			
			if ok, err := _fileman_.Path_IsIndependent(ip.Source, configdir); !ok {
				if err == nil {
					warning_channel <- _fmt_.Sprintf("[%d]:source:\"%s\" should not depend on \"%s\".", i, m.Source, configdir)
				} else {
					warning_channel <- err.Error()
				}
			}
			if ok, err := _fileman_.Path_IsIndependent(ip.Target, configdir); !ok {
				if err == nil {
					warning_channel <- _fmt_.Sprintf("[%d]:target:\"%s\" should not depend on \"%s\".", i, m.Target, configdir)
				} else {
					warning_channel <- err.Error()
				}
			}

			source_type, source_err := _fileman_.Path_Check(m.Source)
			target_type, target_err := _fileman_.Path_Check(m.Target)

			if source_type == _fileman_.Path_Check_Type_Dir && target_type != _fileman_.Path_Check_Type_Nil {
				if err := _fileman_.Clone_Safe(m.Source, m.Target, []string{}); err == nil {
					notification_channel <- _fmt_.Sprintf("[%d]:\"%s\" cloned from [%d]:\"%s\"", i, m.Target, i, m.Source)
				}
			} else if source_type == _fileman_.Path_Check_Type_Nil && target_type != _fileman_.Path_Check_Type_Dir {
				if err := _fileman_.Clone_Safe(m.Target, m.Source, []string{}); err == nil {
					notification_channel <- _fmt_.Sprintf("[%d]:\"%s\" cloned from [%d]:\"%s\"", i, m.Source, i, m.Target)
				}
			}

			if source_type != _fileman_.Path_Check_Type_Dir && source_type != _fileman_.Path_Check_Type_Nil {
				if source_err == nil {
					warning_channel <- _fmt_.Sprintf("[%d]:source:\"%s\" dir unavailable.", i, m.Source)
				} else {
					warning_channel <- _fmt_.Sprintf("[%d]:source:\"%s\" %s.", i, m.Source, source_err)
				}
			}

			if target_type != _fileman_.Path_Check_Type_Dir && target_type != _fileman_.Path_Check_Type_Nil {
				if target_err == nil {
					warning_channel <- _fmt_.Sprintf("[%d]:target:\"%s\" dir unavailable.", i, m.Source)
				} else {
					warning_channel <- _fmt_.Sprintf("[%d]:target:\"%s\" %s.", i, m.Target, target_err)
				}
			}

			source_isdir := _fileman_.Path_IfDir(m.Source)
			target_isdir := _fileman_.Path_IfDir(m.Target)
			if source_isdir && target_isdir {
				if !_fileman_.Path_IfFile(_filepath_.Join(m.Source, m.Stylesheet)) {
					warning_channel <- _fmt_.Sprintf("[%d]:stylesheet:\"%s\" file not found in \"%s\" dir.", i, m.Stylesheet, m.Source)
				}
				if !_fileman_.Path_IfFile(_filepath_.Join(m.Target, m.Stylesheet)) {
					warning_channel <- _fmt_.Sprintf("[%d]:stylesheet:\"%s\" file not found in \"%s\" dir.", i, m.Stylesheet, m.Target)
				}

				for j, jp := range proxymap[i+1:] {
					if ok, err := _fileman_.Path_IsIndependent(ip.Source, jp.Source); !ok {
						if err == nil {
							warning_channel <- _fmt_.Sprintf("[%d]:source:\"%s\" & [%d]:source:\"%s\" are not independent.", i, ip.Source, j, jp.Source)
						} else {
							warning_channel <- err.Error()
						}
					}
					if ok, err := _fileman_.Path_IsIndependent(ip.Target, jp.Target); !ok {
						if err == nil {
							warning_channel <- _fmt_.Sprintf("[%d]:target:\"%s\" & [%d]:target:\"%s\" are not independent.", i, ip.Target, j, jp.Target)
						} else {
							warning_channel <- err.Error()
						}
					}
					if ok, err := _fileman_.Path_IsIndependent(ip.Source, jp.Target); !ok {
						if err == nil {
							warning_channel <- _fmt_.Sprintf("[%d]:source:\"%s\" & [%d]:target:\"%s\" are not independent.", i, ip.Source, j, jp.Target)
						} else {
							warning_channel <- err.Error()
						}
					}
					if ok, err := _fileman_.Path_IsIndependent(ip.Target, jp.Source); !ok {
						if err == nil {
							warning_channel <- _fmt_.Sprintf("[%d]:target:\"%s\" & [%d]:source:\"%s\" are not independent.", i, ip.Target, j, jp.Source)
						} else {
							warning_channel <- err.Error()
						}
					}
				}
			}

		}(index, ip)
	}

	go func() {
		wg.Wait()
		close(warning_channel)
		close(notification_channel)
	}()

	for w := range warning_channel {
		result.Warnings = append(result.Warnings, w)
	}
	for n := range notification_channel {
		result.Messages = append(result.Messages, n)
	}

	return result
}

func Verify_Configs(loadStatics bool) (Report string, status bool) {
	Setup_Ignorefiles()
	if data, err := _fileman_.Read_File(_cache_.Path_Files["readme"].Path, false); err == nil {
		_cache_.Archive.Readme = data
	}
	if data, err := _fileman_.Read_File(_cache_.Path_Files["licence"].Path, false); err == nil {
		_cache_.Archive.Licence = data
	}

	S.TASK("Verifying configs", 0)
	errors := []string{}

	config_path := _cache_.Path_Json["configure"].Path
	S.STEP("PATH : "+config_path, 1)

	_cache_.Static.ProxyMap = []_types_.Config_ProxyMap{}
	if config_data, config_err := _fileman_.Read_File(config_path, false); config_err == nil {
		config := _types_.Config_Raw{}

		if err := json.Unmarshal([]byte(config_data), &config); err != nil {
			errors = append(errors, config_path+" : Bad json/ Incomplete schema.")
		} else {
			if loadStatics {
				Fetch_Statics(config.Vendors)
			}

			if config.Tweaks != nil {
				Setup_Tweaks(config.Tweaks)
			}

			if len(config.Name) > 0 {
				_cache_.Archive.Name = config.Name
			} else {
				_cache_.Archive.Name = _cache_.Static.ProjectName
			}

			if len(config.Version) > 0 {
				_cache_.Archive.Version = config.Version
			} else {
				_cache_.Archive.Version = _cache_.Static.ProjectVersion
			}

			if config.Artifacts == nil {
				_cache_.Static.Artifacts_Sources = map[string]string{}
			} else {
				_cache_.Static.Artifacts_Sources = config.Artifacts
			}

			if config.ProxyMap != nil {
				_cache_.Static.ProxyMap = config.ProxyMap
			}
		}
	}

	conflict_sync := verify_ConflictsAndSync()
	errors = append(errors, conflict_sync.Warnings...)
	S.TASK("Verification finished", 1)
	status = len(errors) == 0
	if status {
		report := S.MAKE(
			S.Tag.H4("Configs Healthy", S.Preset.Success, S.Style.AS_Bold),
			errors,
			S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Warning},
		)

		return report, status
	} else {
		report := S.MAKE(
			S.Tag.H4("Error path : "+config_path, S.Preset.Failed, S.Style.AS_Bold),
			errors,
			S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Warning},
		)

		return report, status
	}

}
