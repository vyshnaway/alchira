package main

import (
	_fmt_ "fmt"
	_action_ "main/action"
	_assemble_ "main/assemble"
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	_utils_ "main/utils"
	_os_ "os"
	_slices_ "slices"
)

func main() {
	// --- Initialize ---

	exposedCommands := []string{}
	for k := range _cache_.Root.Commands {
		exposedCommands = append(exposedCommands, k)
	}
	// _fmt_.Println(_utils_.Code_JsonBuild(exposedCommands, "")) //

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
	// _fmt_.Println(command)  //
	// _fmt_.Println(argument) //

	workpath := "."
	workPackagePath := "package.json"
	rootpath, _ := _fileman_.Path_FromRoot(".")
	rootPackagePath, _ := _fileman_.Path_FromRoot("package.json")
	// _fmt_.Println(workPath)        //
	// _fmt_.Println(rootPath)        //
	// _fmt_.Println(workPackagePath) //
	// _fmt_.Println(rootPackagePath) //

	rootPackageData, rootPackageErr := _fileman_.Read_Json(rootPackagePath, false)
	if rootPackageErr != nil {
		_fmt_.Println("Bad root package.json file.")
		_os_.Exit(1)
	}
	rootPackageData_ := rootPackageData.(map[string]any)
	_cache_.Root.Name = _utils_.String_Fallback(rootPackageData_["name"], _cache_.Root.Name)
	_cache_.Root.Version = _utils_.String_Fallback(rootPackageData_["version"], _cache_.Root.Version)
	// _fmt_.Println(rootPackageErr)                                   //
	// _fmt_.Println(_utils_.Code_JsonBuild(rootPackageData, ""))      //
	// _fmt_.Println(_utils_.Code_JsonBuild(rootPackageData_, ""))     //

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

	// _utils_.String_PrintAny(_cache_.Path_Autogen)
	// _utils_.String_PrintAny(_cache_.Path_Css)
	// _utils_.String_PrintAny(_cache_.Path_Files)
	// _utils_.String_PrintAny(_cache_.Path_Folder)
	// _utils_.String_PrintAny(_cache_.Path_Json)
	// _utils_.String_PrintAny(_cache_.Sync_Agreements)
	// _utils_.String_PrintAny(_cache_.Sync_Blueprint)
	// _utils_.String_PrintAny(_cache_.Sync_References)

	_assemble_.Commander(
		command,
		argument,
		projectname,
		projectversion,
	)
}
