package execute

// import (
// 	"slices"
// 	_os_ "os"
// 	_fmt_ "fmt"
// 	_cache_ "main/cache"
// 	_types_ "main/types"
// 	_fileman_ "main/fileman"
// )

// func main() {
// 	// --- Initialize ---
// 	exposedCommands := []string{}
// 	for k := range _cache_.Root.Commands {
// 		exposedCommands = append(exposedCommands, k)
// 	}
// 	cmd := ""
// 	arg := ""
// 	if len(_os_.Args) > 2 && slices.Contains(exposedCommands, _os_.Args[2]) {
// 		cmd = _os_.Args[2]
// 	}
// 	if len(_os_.Args) > 3 && slices.Contains(exposedCommands, _os_.Args[2]) {
// 		arg = _os_.Args[3]
// 	}
// 	workPath := "."
// 	rootPath, _ := _fileman_.Path_FromRoot(".")
// 	projectPackagePath := "package.json"
// 	rootPackagePath, _ := _fileman_.Path_Resolves("package.json");

// 	var rootPackageData, rootPackageErr = _fileman_.Read_Json(rootPackagePath, false);
// 	var projectPackageData, projectPackageErr = _fileman_.Read_Json(projectPackagePath, false);

// 	// Validate originPackageJson
// 	if rootPackageErr == nil {
// 		_fmt_.Println("Bad root package.json file.")
// 		_os_.Exit(1)
// 	}

// 	projectName, _ := projectPackageData["name"].(string)
// 	if projectName == "" { projectName = "-" }
// 	projectVersion, _ := projectPackageData["version"].(string)
// 	if projectVersion == "" { projectVersion = "0.0.0" }

// 	bin := ""
// 	if m, ok := rootPackageData["bin"].(map[string]any); ok {
// 		for k := range m { bin = k; break }
// 	}
// 	rootPackageEssential := _types_.Support_PackageEssential{
// 		Bin:     bin,
// 		Name:    helper_ResolveStringFallback(rootPackageData["name"], _cache_.Root.Name),
// 		Version: helper_ResolveStringFallback(rootPackageData["version"], _cache_.Root.Version),
// 	}

// 	// --- Script sync with Project ---
// 	if projectPackageErr == nil && rootPackageErr == nil {
// 		if scriptsData, ok := projectPackageData["scripts"].(map[string]any); ok && slices.Contains(exposedCommands, cmd) {
// 			addedCommands := 0
// 			for cmdKey, cmdLine := range _cache_.Root.Scripts {
// 				if _, exists := scriptsData[cmdKey]; !exists {
// 					addedCommands++
// 					scriptsData[_fmt_.Sprintf("%s:%s", _cache_.Root.Name, cmdKey)] = _fmt_.Sprintf("%s %s", rootPackageEssential.Bin, cmdLine)
// 				}
// 			}
// 			if addedCommands > 0 {
// 				projectPackageData["scripts"] = scriptsData
// 				_fileman_.Write_Json(projectPackagePath, projectPackageData)
// 			}
// 		}
// 	}

// 	// --- Commander logic: Call the command executor ---
// 	commander(cmd, arg, rootPath, workPath, projectName, projectVersion, rootPackageEssential)
// }

// func helper_ResolveStringFallback(val any, fallback string) string {
// 	if s, ok := val.(string); ok && s != "" {
// 		return s
// 	}
// 	return fallback
// }

// // // Placeholder for command execution logic
// func commander(command, argument, rootPath, workPath, projectName, projectVersion string, pkg _types_.Support_PackageEssential) {
// 	_fmt_.Printf("Runner: %s %s (Project: %s@%s)\n", command, argument, projectName, projectVersion)
// 	_fmt_.Printf("RootPath: %s WorkPath: %s\n", rootPath, workPath)
// 	_fmt_.Printf("Bin: %s Name: %s Version: %s\n", pkg.Bin, pkg.Name, pkg.Version)
// 	// Implement actual logic here
// }
