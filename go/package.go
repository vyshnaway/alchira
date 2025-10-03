package main

import (
	_fmt_ "fmt"

	// _assemble_ "main/assemble"
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
	_fmt_.Println(command)  //
	_fmt_.Println(argument) //

	workPath , _ := _fileman_.Path_Resolves(".")
	workPackagePath, _ := _fileman_.Path_Resolves("package.json")

	rootPath, _ := _fileman_.Path_FromRoot(".")
	rootPackagePath, _ := _fileman_.Path_FromRoot("package.json")
	_fmt_.Println(workPath)        //
	_fmt_.Println(rootPath)        //
	_fmt_.Println(workPackagePath) //
	_fmt_.Println(rootPackagePath) //

	rootPackageData, rootPackageErr := _fileman_.Read_Json(rootPackagePath, false)
	if rootPackageErr != nil {
		_fmt_.Println("Bad root package.json file.")
		_os_.Exit(1)
	}
	rootPackageData_ := rootPackageData.(_types_.Refer_PackageEssential)
	_fmt_.Println(rootPackageErr) //
	_fmt_.Println(_utils_.Code_JsonBuild(rootPackageData, "")) //
	_fmt_.Println(_utils_.Code_JsonBuild(rootPackageData_, "")) //

	// rootPackageEssential := _types_.Refer_PackageEssential{
	// 	Bin:     rootPackageData_.Bin,
	// 	Name:    _utils_.String_Fallback(rootPackageData_.Name, _cache_.Root.Name),
	// 	Version: _utils_.String_Fallback(rootPackageData_.Version, _cache_.Root.Version),
	// }

	// projectPackageData, projectPackageErr := _fileman_.Read_Json(workPackagePath, false)
	// projectPackageData_ := projectPackageData.(_types_.Refer_PackageEssential)

	// projectName := projectPackageData_.Name
	// if projectName == "" {
	// 	projectName = "-"
	// }
	// projectVersion := projectPackageData_.Version
	// if projectVersion == "" {
	// 	projectVersion = "0.0.0"
	// }

	// --- Script sync with Project ---
	// if projectPackageErr == nil && rootPackageErr == nil {
	// 	if scriptsData, ok := projectPackageData_.Scripts.(map[string]any); ok && _slices_.Contains(exposedCommands, command) {
	// 		addedCommands := 0
	// 		for cmdKey, cmdLine := range _cache_.Root.Scripts {
	// 			if _, exists := scriptsData[cmdKey]; !exists {
	// 				addedCommands++
	// 				scriptsData[_fmt_.Sprintf("%s:%s", _cache_.Root.Name, cmdKey)] = _fmt_.Sprintf("%s %s", rootPackageEssential.Bin, cmdLine)
	// 			}
	// 		}
	// 		if addedCommands > 0 {
	// 			projectPackageData["scripts"] = scriptsData
	// 			_fileman_.Write_Json(workPackagePath, projectPackageData)
	// 		}
	// 	}
	// }

	// --- Commander logic: Call the command executor ---
	// _assemble_.Orchestrate(
	// 	command,
	// 	argument,
	// 	rootPath,
	// 	workPath,
	// 	projectName,
	// 	projectVersion,
	// 	rootPackageEssential,
	// )
}
