package action

import (
	_config "main/configs"
	X "main/internal/shell"
	_model "main/models"
	_fileman "main/package/fileman"
	S "main/package/shell"
	_util "main/package/utils"
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

	if _fileman.Path_IfDir(_config.Path_Folder["scaffold"].Path) {
		_fileman.Write_File(_config.Path_Files["reference"].Path, _config.Sync_References["readme"].Content)
		_fileman.Write_File(_config.Path_Files["guildelines"].Path, _config.Sync_References["guildelines"].Content)
		_fileman.Clone_Safe(_config.Sync_Blueprint["scaffold"].Path, _config.Path_Folder["scaffold"].Path, []string{})

		errors := map[string]string{}
		S.TASK("Verifying directory status", 1)

		for _, v := range _config.Path_Folder {
			if v.Essential && !_fileman.Path_IfDir(v.Path) {
				S.STEP("Path: "+v.Path, 1)
				errors[v.Path] = "Folder not found."
			}
		}

		for _, val := range []map[string]_model.File_Source{
			_config.Path_Autogen,
			_config.Path_Css,
			_config.Path_Files,
			_config.Path_Json,
		} {
			for _, v := range val {
				if v.Essential && !_fileman.Path_IfFile(v.Path) {
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
	if data, err := _fileman.Read_File(_config.Path_Files["readme"].Path, false); err == nil {
		_config.Archive.Readme = data
	}
	if data, err := _fileman.Read_File(_config.Path_Files["licence"].Path, false); err == nil {
		_config.Archive.Licence = data
	}

	S.TASK("Verifying configs", 1)
	errors := []string{}

	config_path := _config.Path_Json["configure"].Path
	S.STEP("PATH : "+config_path, 1)

	_config.Static.ProxyMap = []_model.Config_ProxyMap{}
	if config_data, config_err := _fileman.Read_File(config_path, false); config_err == nil {

		if config, err := _util.Code_JsonParse[_model.Config_Raw](config_data); err != nil {
			errors = append(errors, config_path+" : Bad json/ Incomplete schema.")
		} else {
			if loadvendors {
				S.TASK("Updating vendor-prefixes", 1)
				Sync_SaveVendors(config.Vendors)
			}

			Setup_Tweaks(config.Tweaks)

			if len(config.Name) > 0 {
				_config.Archive.Name = config.Name
			} else {
				_config.Archive.Name = _config.Static.ProjectName
			}

			if len(config.Version) > 0 {
				_config.Archive.Version = config.Version
			} else {
				_config.Archive.Version = _config.Static.ProjectVersion
			}

			if config.Artifacts == nil {
				_config.Static.Artifacts_Sources = map[string]string{}
			} else {
				_config.Static.Artifacts_Sources = config.Artifacts
			}

			if config.ProxyMap != nil {
				_config.Static.ProxyMap = config.ProxyMap
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
