package action

import (
	_fmt_ "fmt"
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	S "main/shell"
	_types_ "main/types"
	X "main/xhell"
	_filepath_ "path/filepath"
	"strconv"
	_sync_ "sync"
)

type Verify_ProxyMapDependency_return struct {
	Warnings []string
	Messages []string
}

// ProxyMapDependency validates and processes proxy map dependencies
func Verify_ProxyMapDependency(proxymap []_types_.Config_ProxyMap, configdir string) Verify_ProxyMapDependency_return {
	result := Verify_ProxyMapDependency_return{
		Warnings: []string{},
		Messages: []string{},
	}

	var wg _sync_.WaitGroup
	warning_channel := make(chan string, len(proxymap)*3)
	notification_channel := make(chan string, len(proxymap))

	for i, ip := range proxymap {
		wg.Add(1)
		go func(index int, m _types_.Config_ProxyMap) {
			defer wg.Done()

			if ok, err := _fileman_.Path_IsIndependent(ip.Source, configdir); ok {
				if err == nil {
					warning_channel <- _fmt_.Sprintf("[%d]:source:\"%s\" should not depend on \"%s\".", index, m.Source, configdir)
				} else {
					warning_channel <- err.Error()
				}
			}
			if ok, err := _fileman_.Path_IsIndependent(ip.Target, configdir); ok {
				if err == nil {
					warning_channel <- _fmt_.Sprintf("[%d]:target:\"%s\" should not depend on \"%s\".", index, m.Target, configdir)
				} else {
					warning_channel <- err.Error()
				}
			}

			if !_fileman_.Path_IfDir(m.Source) {
				warning_channel <- _fmt_.Sprintf("[%d]:source:\"%s\" dir unavailable.", index, m.Source)
			} else {
				pathtype, err := _fileman_.Path_Check(m.Target)
				if err != nil {
					warning_channel <- _fmt_.Sprintf("[%d]:target:\"%s\" %s.", index, m.Source, err.Error())
				} else {
					if pathtype == _fileman_.Path_Check_Type_Txt {
						warning_channel <- _fmt_.Sprintf("[%d]:\"%s\" expected dir instead of file.", index, m.Target)
					} else {
						if pathtype == _fileman_.Path_Check_Type_Nil {
							if err := _fileman_.Clone_Hard(m.Source, m.Target, []string{}); err == nil {
								notification_channel <- _fmt_.Sprintf("[%d]:\"%s\" cloned from [%d]:\"%s\"", index, m.Target, index, m.Source)
							}
						}

						if !_fileman_.Path_IfFile(_filepath_.Join(m.Source, m.Stylesheet)) {
							warning_channel <- _fmt_.Sprintf("[%d]:stylesheet:\"%s\" file not found in \"%s\" dir.", index, m.Stylesheet, m.Source)
						}
						if !_fileman_.Path_IfFile(_filepath_.Join(m.Target, m.Stylesheet)) {
							warning_channel <- _fmt_.Sprintf("[%d]:stylesheet:\"%s\" file not found in \"%s\" dir.", index, m.Stylesheet, m.Target)
						}

						for j, jp := range proxymap[i+1:] {
							if ok, err := _fileman_.Path_IsIndependent(ip.Source, jp.Source); ok {
								if err == nil {
									warning_channel <- _fmt_.Sprintf("[%d]:source:\"%s\" & [%d]:source:\"%s\" are not independent.", i, ip.Source, j, jp.Source)
								} else {
									warning_channel <- err.Error()
								}
							}
							if ok, err := _fileman_.Path_IsIndependent(ip.Target, jp.Target); ok {
								if err == nil {
									warning_channel <- _fmt_.Sprintf("[%d]:target:\"%s\" & [%d]:target:\"%s\" are not independent.", i, ip.Target, j, jp.Target)
								} else {
									warning_channel <- err.Error()
								}
							}
							if ok, err := _fileman_.Path_IsIndependent(ip.Source, jp.Target); ok {
								if err == nil {
									warning_channel <- _fmt_.Sprintf("[%d]:source:\"%s\" & [%d]:target:\"%s\" are not independent.", i, ip.Source, j, jp.Target)
								} else {
									warning_channel <- err.Error()
								}
							}
							if ok, err := _fileman_.Path_IsIndependent(ip.Target, jp.Source); ok {
								if err == nil {
									warning_channel <- _fmt_.Sprintf("[%d]:target:\"%s\" & [%d]:source:\"%s\" are not independent.", i, ip.Target, j, jp.Source)
								} else {
									warning_channel <- err.Error()
								}
							}
						}
					}

				}
			}
		}(i, ip)
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

func Verify_Configs(loadStatics bool) (Report string, Ok bool) {
	S.TASK("Initializing configs", 0)
	errors := []string{}

	config_path := _cache_.Path_Json["configure"].Path
	S.STEP("PATH : "+config_path, 0)
	config_data, config_err := _fileman_.Read_Json(config_path, false)

	_cache_.Static.ProxyMap = []_types_.Config_ProxyMap{}
	if config_0, config_0_ok := config_data.(map[string]any); config_0_ok && config_err == nil {

		if val, ok := config_0["proxymap"].([]any); ok {
			for i, v := range val {
				if proxymap, k := v.(_types_.Config_ProxyMap); k &&
					proxymap.Source != "" &&
					proxymap.Target != "" &&
					proxymap.Stylesheet != "" &&
					len(proxymap.Extensions) > 0 {

					proxymap.Source = _fileman_.PathFix(proxymap.Source)
					proxymap.Target = _fileman_.PathFix(proxymap.Target)
					proxymap.Stylesheet = _fileman_.PathFix(proxymap.Stylesheet)
					_cache_.Static.ProxyMap = append(_cache_.Static.ProxyMap, proxymap)

				} else {
					message := config_path + ":[proxymap]:" + "[" + strconv.Itoa(i) + "] Workable proxies unavailable."
					errors = append(errors, S.Tag.Li(message, S.Preset.Failed))
				}
			}
		}

		if val, ok := config_0["vendors"].(string); ok {
			_cache_.Archive.Vendors = val
			if loadStatics {
				Fetch_Statics(val)
			}
		}

		if val, ok := config_0["tweaks"].(map[string]any); ok {
			Setup_Tweaks(val)
		}

		if val, ok := config_0["name"].(string); ok && len(val) > 0 {
			_cache_.Archive.Name = val
		}
		if val, ok := config_0["version"].(string); ok && len(val) > 0 {
			_cache_.Archive.Version = val
		}

		if val, ok := config_0["artifacts"].(map[string]string); ok {
			_cache_.Static.Artifacts_Sources = val
		} else {
			_cache_.Static.Artifacts_Sources = map[string]string{}
		}

		dependancy_response := Verify_ProxyMapDependency(_cache_.Static.ProxyMap, _cache_.Path_Folder["scafffold"].Path)
		errors = append(errors, dependancy_response.Warnings...)
	} else {
		errors = append(errors, config_path+" : Bad json/ Incomplete schema.")
	}

	if data, err := _fileman_.Read_File(_cache_.Path_Files["readme"].Path, false); err == nil {
		_cache_.Archive.Readme = data
	}
	if data, err := _fileman_.Read_File(_cache_.Path_Files["licence"].Path, false); err == nil {
		_cache_.Archive.Licence = data
	}

	S.TASK("Initialization finished", 0)
	Ok = len(errors) == 0
	if Ok {
		Report = S.MAKE(
			S.Tag.H4("Configs Healthy", S.Preset.Success, S.Style.AS_Bold),
			errors,
			S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Warning},
		)

		return Report, Ok
	} else {
		Report = S.MAKE(
			S.Tag.H4("Error path : "+config_path, S.Preset.Failed, S.Style.AS_Bold),
			errors,
			S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Warning},
		)

		return Report, Ok
	}

}
