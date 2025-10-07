package action

import (
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	S "main/shell"
	_types_ "main/types"
	"main/utils"
	X "main/xhell"
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
		S.TASK("Verifying directory status", 1)

		for _, v := range _cache_.Path_Folder {
			if v.Essential && !_fileman_.Path_IfDir(v.Path) {
				S.STEP("Path: "+v.Path, 1)
				errors[v.Path] = "Folder not found."
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
					errors[v.Path] = "File not found."
				}
			}
		}

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

func Verify_Configs(loadvendors bool) (Report string, status bool) {
	Setup_Ignorefiles()
	if data, err := _fileman_.Read_File(_cache_.Path_Files["readme"].Path, false); err == nil {
		_cache_.Archive.Readme = data
	}
	if data, err := _fileman_.Read_File(_cache_.Path_Files["licence"].Path, false); err == nil {
		_cache_.Archive.Licence = data
	}

	S.TASK("Verifying configs", 1)
	errors := []string{}

	config_path := _cache_.Path_Json["configure"].Path
	S.STEP("PATH : "+config_path, 1)

	_cache_.Static.ProxyMap = []_types_.Config_ProxyMap{}
	if config_data, config_err := _fileman_.Read_File(config_path, false); config_err == nil {

		if config, err := utils.Code_JsonParse[_types_.Config_Raw](config_data); err != nil {
			errors = append(errors, config_path+" : Bad json/ Incomplete schema.")
		} else {
			if loadvendors {
				S.TASK("Updating vendor-prefixes", 1)
				Sync_SaveVendors(config.Vendors)
			}

			Setup_Tweaks(config.Tweaks)

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

	conflict_sync := Conflict_Sync_Test()
	errors = append(errors, conflict_sync.Warnings...)

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
