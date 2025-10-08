package main

import (
	_fmt_ "fmt"
	_action_ "main/action"
	_assemble_ "main/assemble"
	_cache_ "main/cache"
	_fileman_ "main/module/fileman"
	_utils_ "main/utils"
	_os_ "os"
	_slices_ "slices"
)

func main() {

	exposedCommands := []string{}
	for k := range _cache_.Root.Commands {
		exposedCommands = append(exposedCommands, k)
	}

	command := ""
	if len(_os_.Args) > 1 {
		command = _os_.Args[1]
	}
	argument := ""
	if _slices_.Contains(exposedCommands, command) {
		if len(_os_.Args) > 2 {
			argument = _os_.Args[2]
		}
	} else {
		command = ""
	}

	workpath := "."
	workPackagePath := "package.json"
	rootpath, _ := _fileman_.Path_FromRoot(".")
	rootPackagePath, _ := _fileman_.Path_FromRoot("package.json")

	rootPackageData, rootPackageErr := _fileman_.Read_Json(rootPackagePath, false)
	if rootPackageErr != nil {
		_fmt_.Println("Bad root package.json file.")
		_os_.Exit(1)
	}
	rootPackageData_ := rootPackageData.(map[string]any)
	_cache_.Root.Name = _utils_.String_Fallback(rootPackageData_["name"], _cache_.Root.Name)
	_cache_.Root.Version = _utils_.String_Fallback(rootPackageData_["version"], _cache_.Root.Version)

	projectname := "-"
	projectversion := "0.0.0"
	if workPackageData, workPackageErr := _fileman_.Read_Json(workPackagePath, false); workPackageErr == nil {
		workPackageData_ := workPackageData.(map[string]any)
		if val, ok := workPackageData_["name"].(string); ok && val != "" {
			projectname = val
		}
		if val, ok := workPackageData_["version"].(string); ok && val != "" {
			projectversion = val
		}
	}

	_action_.Setup_Environment(rootpath, workpath)

	exitcode := _assemble_.Commander(
		command,
		argument,
		projectname,
		projectversion,
	)

	_os_.Exit(exitcode)
}
