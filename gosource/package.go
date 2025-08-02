package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"golang.org/x/term" // For getting console width
)

// getConsoleWidth attempts to get the current terminal width.
// Returns a default of 80 if it cannot determine it.
func getConsoleWidth() int {
	width, _, err := term.GetSize(int(os.Stdout.Fd()))
	if err != nil {
		return 80 // Default width if unable to determine
	}
	return width
}

// commander is a placeholder function for the actual commander logic.
// In a real application, this would contain the core logic for your commands.
func commander(
	command string,
	argument string,
	rootPath string,
	workPath string,
	consoleWidth int,
	rootPackageEssential T_RootPackageEssential,
	projectName string,
	projectVersion string,
) {
	fmt.Println("\n--- Commander Function Called ---")
	fmt.Printf("Command: %s\n", command)
	fmt.Printf("Argument: %s\n", argument)
	fmt.Printf("Root Path: %s\n", rootPath)
	fmt.Printf("Work Path: %s\n", workPath)
	fmt.Printf("Console Width: %d\n", consoleWidth)
	fmt.Printf("Root Package Name: %s\n", rootPackageEssential.Name)
	fmt.Printf("Root Package Version: %s\n", rootPackageEssential.Version)
	fmt.Printf("Root Package Website: %s\n", rootPackageEssential.Website)
	fmt.Printf("Root Package Commands (bin keys): %v\n", rootPackageEssential.Command)
	fmt.Printf("Project Name: %s\n", projectName)
	fmt.Printf("Project Version: %s\n", projectVersion)
	fmt.Println("--- End Commander Function ---")
	// Add your actual command execution logic here
}

func main() {
	// Calculate paths
	rootPath := fileman.Path.FromRoot(".") // fileman's init already sets the root
	workPath, err := filepath.Abs(".")
	if err != nil {
		log.Fatalf("Failed to get current working directory: %v", err)
	}
	packagePath := "package.json"
	rootPackagePath := fileman.Path.FromRoot(packagePath)

	// Parse command-line arguments
	command := ""
	argument := ""
	if len(os.Args) > 1 {
		command = os.Args[1]
	}
	if len(os.Args) > 2 {
		argument = os.Args[2]
	}

	consoleWidth := getConsoleWidth()

	commandList := []string{"init", "watch", "split", "preview", "publish", "install"}

	// Read root package.json
	// Using map[string]interface{} for flexible parsing, then converting to PackageJson struct
	var rootPackageJsonMap map[string]interface{}
	status, data, err := fileman.Read.Json(rootPackagePath, false)
	if err != nil || !status {
		log.Fatalf("Bad root package.json file at '%s': %v", rootPackagePath, err)
	}
	rootPackageJsonMap = data

	// Populate rootPackageEssential
	rootPackageEssential := T_RootPackageEssential{}
	if name, ok := rootPackageJsonMap["name"].(string); ok {
		rootPackageEssential.Name = name
	}
	if version, ok := rootPackageJsonMap["version"].(string); ok {
		rootPackageEssential.Version = version
	}
	if scripts, ok := rootPackageJsonMap["scripts"].(map[string]interface{}); ok {
		rootPackageEssential.Scripts = make(map[string]string)
		for k, v := range scripts {
			if s, isString := v.(string); isString {
				rootPackageEssential.Scripts[k] = s
			}
		}
	}
	if homepage, ok := rootPackageJsonMap["homepage"].(string); ok {
		rootPackageEssential.Website = homepage
	}
	if bin, ok := rootPackageJsonMap["bin"].(map[string]interface{}); ok {
		for k := range bin {
			rootPackageEssential.Command = append(rootPackageEssential.Command, k)
		}
	}

	// Read project package.json
	var projectPackageJsonMap map[string]interface{}
	projectPackageStatus, projectPackageData, err := fileman.Read.Json(packagePath, false)
	if err != nil && !os.IsNotExist(err) { // Only log error if it's not simply "file not found"
		log.Printf("Warning: Error reading project package.json: %v", err)
	}
	if projectPackageStatus {
		projectPackageJsonMap = projectPackageData
	} else {
		// If project package.json doesn't exist, initialize an empty map for it
		projectPackageJsonMap = make(map[string]interface{})
		projectPackageJsonMap["name"] = "xtylesheet"                    // Default name if not found
		projectPackageJsonMap["version"] = "0.0.0"                      // Default version
		projectPackageJsonMap["scripts"] = make(map[string]interface{}) // Ensure scripts map exists
	}

	// Conditional logic for adding commands to project package.json
	if projectPackageStatus && contains(commandList, command) {
		addedCommands := 0
		projectScripts, ok := projectPackageJsonMap["scripts"].(map[string]interface{})
		if !ok {
			projectScripts = make(map[string]interface{})
			projectPackageJsonMap["scripts"] = projectScripts
		}

		for _, cmd := range commandList {
			rootScript, rootScriptExists := rootPackageEssential.Scripts[cmd]
			projectScriptExists := false
			if _, ok := projectScripts[cmd]; ok {
				projectScriptExists = true
			}

			if rootScriptExists && !projectScriptExists {
				addedCommands++
				// Use a default prefix or the root package name
				prefix := "xcss"
				if rootPackageEssential.Name != "" {
					prefix = rootPackageEssential.Name
				}
				projectScripts[fmt.Sprintf("%s:%s", prefix, cmd)] = rootScript
			}
		}

		if addedCommands > 0 {
			if err := fileman.Write.Json(packagePath, projectPackageJsonMap); err != nil {
				log.Fatalf("Failed to write updated project package.json: %v", err)
			}
			fmt.Println("Updated project package.json with new commands.")
		}
	}

	// Determine project name and version for commander call
	projectName := "xtylesheet"
	projectVersion := "0.0.0"
	if projectPackageStatus {
		if name, ok := projectPackageJsonMap["name"].(string); ok {
			projectName = name
		}
		if version, ok := projectPackageJsonMap["version"].(string); ok {
			projectVersion = version
		}
	}

	// Call the commander function
	commander(
		command,
		argument,
		rootPath,
		workPath,
		consoleWidth,
		rootPackageEssential,
		projectName,
		projectVersion,
	)
}

// Helper function to check if a string is in a slice.
func contains(slice []string, item string) bool {
	for _, a := range slice {
		if a == item {
			return true
		}
	}
	return false
}
