package server

import (
	_config "main/configs"
	_action "main/internal/action"
)

type execute_Step_enum int

const (
	execute_Step_Exit execute_Step_enum = iota
	execute_Step_Initialize
	execute_Step_VerifySetupStruct
	execute_Step_ReadRootCss
	execute_Step_ReadLibraries
	execute_Step_VerifyConfigs
	execute_Step_ReadArtifacts
	execute_Step_ReadTargets
	execute_Step_ReadHashrule
	execute_Step_ProcessScaffold
	execute_Step_ProcessProxyFolders
	execute_Step_GenerateFiles
	execute_Step_Publish
	execute_Step_LoopAroud
)

func Simulate() (Exitcode int) {
	exitcode := 0
	step := execute_Step_Initialize

	for {
		switch step {
		case execute_Step_Initialize:
			fallthrough

		case execute_Step_VerifySetupStruct:
			if _, res_status := _action.Verify_Setup(); res_status != _action.Verify_Setup_Status_Verified {
				step = execute_Step_LoopAroud
				break
			}
			fallthrough

		case execute_Step_ReadRootCss:
			_action.Save_RootCss()
			fallthrough

		case execute_Step_ReadLibraries:
			_action.Save_Libraries()
			fallthrough

		case execute_Step_VerifyConfigs:
			if _, res_status := _action.Verify_Configs(false); !res_status {
				step = execute_Step_LoopAroud
				break
			}
			fallthrough

		case execute_Step_ReadArtifacts:
			_action.Save_Artifacts()
			fallthrough

		case execute_Step_ReadTargets:
			_action.Save_Targets()
			fallthrough

		case execute_Step_ReadHashrule:
			if _, res_status := _action.Save_Hashrule(); !res_status {
				step = execute_Step_LoopAroud
				break
			}
			fallthrough

		case execute_Step_ProcessScaffold:
			Update_Scaffold()
			fallthrough

		case execute_Step_ProcessProxyFolders:
			ReBuild_Manifest()

		}

		if !_config.Static.WATCH {
			break
		}
	}

	return exitcode
}
