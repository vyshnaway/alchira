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
	Warnings     []string
	Notification []string
}

// ProxyMapDependency validates and processes proxy map dependencies
func Verify_ProxyMapDependency(proxymap []_types_.Config_ProxyMap, configdir string) (Verify_ProxyMapDependency_return, error) {
	result := Verify_ProxyMapDependency_return{
		Warnings:     []string{},
		Notification: []string{},
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
		result.Notification = append(result.Notification, n)
	}

	return result, nil
}

type verify_Setup_Status_enum int

const (
	verify_Setup_Status_Uninitialized verify_Setup_Status_enum = 0
	verify_Setup_Status_Inialized     verify_Setup_Status_enum = 1
	verify_Setup_Status_Verified      verify_Setup_Status_enum = 2
)

func Verify_Setup() (Status verify_Setup_Status_enum, Report string) {
	status := verify_Setup_Status_Uninitialized
	report := ""

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
			status = verify_Setup_Status_Verified
			report = S.Tag.H4("Setup Healthy", S.Preset.Success, S.Style.AS_Bold)
		} else {
			status = verify_Setup_Status_Inialized
			report = S.MAKE(
				S.Tag.H4("Error Paths", S.Preset.Failed),
				X.List_Props(errors, []string{}, []string{}),
				S.TList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Failed, Styles: []string{}},
			)
		}
	} else {
		report = S.MAKE(
			S.Tag.H4("Setup not initialized in directory.", S.Preset.Warning, S.Style.AS_Bold),
			[]string{`Use "init" command to initialize.`},
			S.TList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Warning, Styles: []string{}},
		)
	}

	return status, report
}

func Verify_Configs(loadStatics: boolean) {
	$.TASK("Initializing configs", 0);
	const errors: string[] = [];

	$.STEP("PATH : " + CACHE.PATH.json.configure.path);
	const config = await FILEMAN.read.json(CACHE.PATH.json.configure.path);
	if (config.status) {
		const CONFIG = config.data as _Config.Raw;
		if (loadStatics) { await FetchStatics(CONFIG.vendors); }
		ACTION.setTWEAKS(CONFIG.tweaks);

		CACHE.STATIC.ProxyMap = Array.isArray(CONFIG.proxymap) ? CONFIG.proxymap.reduce((A, I) => {
			if (
				typeof I === "object"
				&& typeof I.source === "string"
				&& typeof I.target === "string"
				&& typeof I.stylesheet === "string"
				&& typeof I.extensions === "object"
				&& I.source !== ""
				&& I.target !== ""
				&& I.stylesheet !== ""
				&& Object.keys(I.extensions).length !== 0
			) {
				Object.entries(I.extensions).forEach(([K, V]) => {
					if (Array.isArray(V)) {
						I.extensions[K] = V.filter(e => typeof e === "string");
					} else {
						I.extensions[K] = [];
					}
				});
				I.source = fixPath(I.source);
				I.target = fixPath(I.target);
				I.stylesheet = fixPath(I.stylesheet);
				A.push(I);
			}
			return A;
		}, [] as _Config.ProxyMap[]) : [];
		if (CACHE.STATIC.ProxyMap.length === 0) {
			errors.push($.tag.Li(CACHE.PATH.json.configure.path + ": Workable proxies unavailable."));
		}

		Object.assign(CACHE.STATIC.Archive, config.data);
		CACHE.STATIC.Archive.name = CACHE.STATIC.Archive.name = CONFIG.name || CACHE.STATIC.ProjectName;
		CACHE.STATIC.Archive.version = CACHE.STATIC.Archive.version = CONFIG.version || CACHE.STATIC.ProjectVersion;
		CACHE.STATIC.Archive.readme = (await FILEMAN.read.file(CACHE.PATH.md.readme.path)).data;
		CACHE.STATIC.Archive.licence = (await FILEMAN.read.file(CACHE.PATH.md.licence.path)).data;
		CACHE.STATIC.Artifacts_Saved = Object.entries((typeof CONFIG.artifacts === "object") ? CONFIG.artifacts : {})
			.reduce((a, [k, v]) => {
				if (typeof v === "string" && v !== '-') { a[k] = v; }
				return a;
			}, {} as Record<string, string>);

		const results = await VERIFY.proxyMapDependency(CACHE.STATIC.ProxyMap, CACHE.PATH.folder.scaffold.path);
		errors.push(...results.warnings);
	} else {
		errors.push(`${CACHE.PATH.json.configure.path} : Bad json file.`);
	}

	$.TASK("Initialization finished");
	return {
		status: Object.keys(errors).length === 0,
		report: $.MAKE(
			Object.keys(errors).length === 0
				? $.tag.H4("Configs Healthy", $.preset.success, $.style.AS_Bold)
				: $.tag.H4("Error Paths: " + CACHE.PATH.json.configure.path, $.preset.failed, $.style.AS_Bold),
			errors, [$.list.Bullets, 0, $.preset.warning]
		)
	};
}
