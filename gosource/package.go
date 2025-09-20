package main

import (
	_os_ "os"
	"fmt"
	"encoding/json"
	_fileman_ "main/fileman"
	_cache_ "main/cache"
	_types_ "main/types"
)

func main() {
	// --- Initialize ---
	exposedCommands := []string{}
	for k := range _cache_.Root.Commands {
		exposedCommands = append(exposedCommands, k)
	}
	cmd := ""
	arg := ""
	if len(_os_.Args) > 2 && contains(exposedCommands, _os_.Args[2]) {
		cmd = _os_.Args[2]
	}
	if len(_os_.Args) > 3 && contains(exposedCommands, _os_.Args[2]) {
		arg = _os_.Args[3]
	}
	workPath := "."
	rootPath, _ := filepath.Abs(".")
	projectPackagePath := "package.json"
	originPackagePath, _ := filepath.Abs("package.json")

	var originPackageJson, projectPackageJson _types_.Support_PackageEssential
	errChan := make(chan error, 2)
	go func() { errChan <- _fileman_.Read_Json(originPackagePath, &originPackageJson) }()
	go func() { errChan <- _fileman_.Read_Json(projectPackagePath, &projectPackageJson) }()
	<-errChan
	<-errChan

	// Validate originPackageJson
	rawStatus, statusOK := originPackageJson.Data["status"].(bool)
	if !statusOK || !rawStatus {
		fmt.Println("Bad root package.json file.")
		_os_.Exit(1)
	}

	// Find project name/version
	projectName, _ := projectPackageJson.Data["name"].(string)
	if projectName == "" { projectName = "-" }
	projectVersion, _ := projectPackageJson.Data["version"].(string)
	if projectVersion == "" { projectVersion = "0.0.0" }

	bin := ""
	if m, ok := originPackageJson.Data["bin"].(map[string]interface{}); ok {
		for k := range m { bin = k; break }
	}
	rootPackageEssential := _types_.Support_PackageEssential{
		Bin:     bin,
		Name:    getString(originPackageJson.Data["name"], _cache_.Root.Name),
		Version: getString(originPackageJson.Data["version"], _cache_.Root.Version),
	}

	// --- Script sync with Project ---
	if status, statusOK := projectPackageJson.Data["status"].(bool); statusOK && status {
		if scriptsData, ok := projectPackageJson.Data["scripts"].(map[string]interface{}); ok && contains(exposedCommands, cmd) {
			addedCommands := 0
			for cmdKey, cmdLine := range _cache_.Root.Scripts {
				if _, exists := scriptsData[cmdKey]; !exists {
					addedCommands++
					scriptsData[fmt.Sprintf("%s:%s", _cache_.Root.Name, cmdKey)] = fmt.Sprintf("%s %s", rootPackageEssential.Bin, cmdLine)
				}
			}
			if addedCommands > 0 {
				projectPackageJson.Data["scripts"] = scriptsData
				writeJSON(projectPackagePath, projectPackageJson)
			}
		}
	}

	// --- Commander logic: Call the command executor ---
	// commander(cmd, arg, rootPath, workPath, projectName, projectVersion, rootPackageEssential)
}

// Helper function
func contains(list []string, s string) bool {
	for _, v := range list {
		if v == s {
			return true
		}
	}
	return false
}
func getString(val interface{}, fallback string) string {
	if s, ok := val.(string); ok && s != "" {
		return s
	}
	return fallback
}

// // Placeholder for command execution logic
// func commander(command, argument, rootPath, workPath, projectName, projectVersion string, pkg PackageEssential) {
// 	fmt.Printf("Runner: %s %s (Project: %s/%s)\n", command, argument, projectName, projectVersion)
// 	fmt.Printf("RootPath: %s WorkPath: %s\n", rootPath, workPath)
// 	fmt.Printf("Bin: %s Name: %s Version: %s\n", pkg.Bin, pkg.Name, pkg.Version)
// 	// Implement actual logic here
// }
