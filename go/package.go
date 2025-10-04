package main

import (
	_fmt_ "fmt"

	_assemble_ "main/assemble"
	_cache_ "main/cache"
	_fileman_ "main/fileman"

	_types_ "main/types"
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

	workPath, _ := _fileman_.Path_Resolves(".")
	workPackagePath, _ := _fileman_.Path_Resolves("package.json")

	rootPath, _ := _fileman_.Path_FromRoot(".")
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
	rootPackageEssential := _types_.Refer_PackageEssential{
		Name:    _utils_.String_Fallback(rootPackageData_["name"], _cache_.Root.Name),
		Version: _utils_.String_Fallback(rootPackageData_["version"], _cache_.Root.Version),
		Bin: func() map[string]string {
			if bin, ok := rootPackageData_["bin"].(map[string]string); ok {
				return bin
			}
			return map[string]string{}
		}(),
	}
	// _fmt_.Println(rootPackageErr)                                   //
	// _fmt_.Println(_utils_.Code_JsonBuild(rootPackageData, ""))      //
	// _fmt_.Println(_utils_.Code_JsonBuild(rootPackageData_, ""))     //
	// _fmt_.Println(_utils_.Code_JsonBuild(rootPackageEssential, "")) //

	
	projectname := "-"
	projectversion := "0.0.0"
	if workPackageData, workPackageErr := _fileman_.Read_Json(workPackagePath, false); workPackageErr == nil {
		workPackageData_ := workPackageData.(map[string]any)

		// projectName := workPackageData_.Name
		if val, ok := workPackageData_["name"].(string); ok && val != "" {
			projectname = val
		}
		if val, ok := workPackageData_["version"].(string); ok && val != "" {
			projectversion = val
		}
	}

	// --- Commander logic: Call the command executor ---
	_assemble_.Orchestrate(
		command,
		argument,
		rootPath,
		workPath,
		projectname,
		projectversion,
		rootPackageEssential,
	)
}
