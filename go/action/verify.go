package action

import (
	_fmt_ "fmt"
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	S "main/shell"
	_types_ "main/types"
	X "main/xhell"
	_filepath_ "path/filepath"
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
	verify_Setup_Status_Uninitialized verify_Setup_Status_enum = 0
	verify_Setup_Status_Inialized     verify_Setup_Status_enum = 1
	verify_Setup_Status_Verified      verify_Setup_Status_enum = 2
)

func Verify_Setup() (Status verify_Setup_Status_enum, Report string) {
	Status = verify_Setup_Status_Uninitialized
	Report = ""

	if _fileman_.Path_IfDir(_cache_.Path["blueprint"]["scaffold"].Path) {
		_fileman_.Write_File(_cache_.Path["md"]["reference"].Path, _cache_.Sync["MARKDOWN"]["readme"].Content)
		_fileman_.Write_File(_cache_.Path["md"]["guildelines"].Path, _cache_.Sync["MARKDOWN"]["guildelines"].Content)
		_fileman_.Clone_Safe(_cache_.Path["blueprint"]["scaffold"].Path, _cache_.Sync["folder"]["scaffold"].Path, []string{})

		errors := map[string]string{}
		S.TASK("Verifying directory status", 0)

		for key, val := range _cache_.Path {
			if key != "blueprint" {
				if key == "folder" {
					for _, v := range val {
						if v.Essential && !_fileman_.Path_IfDir(v.Path) {
							S.STEP("Path: "+v.Path, 1)
							errors[v.Path] = "Path not found."
						}
					}
				} else {
					for _, v := range val {
						if v.Essential && !_fileman_.Path_IfFile(v.Path) {
							S.STEP("Path: "+v.Path, 1)
							errors[v.Path] = "Path not found."
						}
					}
				}
			}
		}

		if len(errors) == 0 {
			Status = verify_Setup_Status_Verified
			Report = S.Tag.H4("Setup Healthy", S.Preset.Success, S.Style.AS_Bold)
		} else {
			Status = verify_Setup_Status_Inialized
			Report = S.MAKE(
				S.Tag.H4("Error Paths", S.Preset.Failed),
				X.List_Props(errors, []string{}, []string{}),
				S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Failed, Styles: []string{}},
			)
		}
	} else {
		Report = S.MAKE(
			S.Tag.H4("Setup not initialized in directory.", S.Preset.Warning, S.Style.AS_Bold),
			[]string{`Use "init" command to initialize.`},
			S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Warning, Styles: []string{}},
		)
	}

	return Status, Report
}

func Verify_Configs(loadStatics bool) (Report string, Status bool) {
	S.TASK("Initializing configs", 0)
	errors := []string{}

	config_path := _cache_.Path["json"]["configure"].Path
	S.STEP("PATH : "+config_path, 0)
	config_data, config_err := _fileman_.Read_Json(config_path, false)
	if config_err == nil {
		CONFIG := config_data.(_types_.Config_Raw)
		if loadStatics {
			Fetch_Statics(CONFIG.Vendors)
		}
		if CONFIG.Tweaks != nil {
			Setup_Tweaks(CONFIG.Tweaks)
		}

		for _, I := range CONFIG.ProxyMap {
			// Simplified validation based on TypeScript checks
			isValid := (I.Source != "" && I.Target != "" && I.Stylesheet != "")

			if len(I.Extensions) == 0 {
				isValid = false
			}

			if isValid {

				I.Source = _fileman_.PathFix(I.Source)
				I.Target = _fileman_.PathFix(I.Target)
				I.Stylesheet = _fileman_.PathFix(I.Stylesheet)

				_cache_.Static.ProxyMap = append(_cache_.Static.ProxyMap, I)
			}
		}

		// CACHE.STATIC.ProxyMap = Array.isArray(CONFIG.proxymap) ? CONFIG.proxymap.reduce((A, I) => {
		// 	if (
		// 		typeof I === "object"
		// 		&& typeof I.source === "string"
		// 		&& typeof I.target === "string"
		// 		&& typeof I.stylesheet === "string"
		// 		&& typeof I.extensions === "object"
		// 		&& I.source !== ""
		// 		&& I.target !== ""
		// 		&& I.stylesheet !== ""
		// 		&& Object.keys(I.extensions).length !== 0
		// 	) {
		// 		Object.entries(I.extensions).forEach(([K, V]) => {
		// 			if (Array.isArray(V)) {
		// 				I.extensions[K] = V.filter(e => typeof e === "string");
		// 			} else {
		// 				I.extensions[K] = [];
		// 			}
		// 		});
		// 		I.source = fixPath(I.source);
		// 		I.target = fixPath(I.target);
		// 		I.stylesheet = fixPath(I.stylesheet);
		// 		A.push(I);
		// 	}
		// 	return A;
		// }, [] as _Config.ProxyMap[]) : [];
		// if (CACHE.STATIC.ProxyMap.length === 0) {
		// 	errors.push($.tag.Li(CACHE.PATH.json.configure.path + ": Workable proxies unavailable."));
		// }

		// Object.assign(CACHE.STATIC.Archive, config.data);
		// CACHE.STATIC.Archive.name = CACHE.STATIC.Archive.name = CONFIG.name || CACHE.STATIC.ProjectName;
		// CACHE.STATIC.Archive.version = CACHE.STATIC.Archive.version = CONFIG.version || CACHE.STATIC.ProjectVersion;
		// CACHE.STATIC.Archive.readme = (await FILEMAN.read.file(CACHE.PATH.md.readme.path)).data;
		// CACHE.STATIC.Archive.licence = (await FILEMAN.read.file(CACHE.PATH.md.licence.path)).data;
		// CACHE.STATIC.Artifacts_Saved = Object.entries((typeof CONFIG.artifacts === "object") ? CONFIG.artifacts : {})
		// 	.reduce((a, [k, v]) => {
		// 		if (typeof v === "string" && v !== '-') { a[k] = v; }
		// 		return a;
		// 	}, {} as Record<string, string>);

		dependancy_response := Verify_ProxyMapDependency(_cache_.Static.ProxyMap, _cache_.Path["folder"]["scafffold"].Path)
		errors = append(errors, dependancy_response.Warnings...)
	} else {
		errors = append(errors, config_path+" : Bad json file.")
	}

	S.TASK("Initialization finished", 0)
	Status = len(errors) == 0
	if Status {
		Report = S.MAKE(
			S.Tag.H4("Configs Healthy", S.Preset.Success, S.Style.AS_Bold),
			errors,
			S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Warning},
		)

		return Report, Status
	} else {
		Report = S.MAKE(
			S.Tag.H4("Error path : "+config_path, S.Preset.Failed, S.Style.AS_Bold),
			errors,
			S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Warning},
		)

		return Report, Status
	}

}
