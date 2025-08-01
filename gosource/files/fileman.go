package fileman

import (
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
)

// Root directory of the application, calculated relative to the current file.
var root string

func init() {
	// Get the absolute path of the current file.
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		panic("Failed to get current file path for root calculation.")
	}
	// Go up two directories from the current file to find the root.
	root = filepath.Join(filepath.Dir(filename), "..", "..")
}

// Path provides utilities for path manipulation and checks.
var Path = struct {
	Join        func(elem ...string) string
	FromRoot    func(elem ...string) string
	Resolves    func(pathString string) (string, error)
	Available   func(pathString string) (exist bool, fileType string, err error)
	IfFolder    func(pathString string) bool
	IfFile      func(pathString string) bool
	IsIndependent func(folder1, folder2 string) (bool, error)
	ListFiles   func(dir string, fileList []string) ([]string, error)
	ListFolders func(dir string, folderList []string) ([]string, error)
}{
	// Join joins any number of path elements into a single path.
	Join: filepath.Join,

	// FromRoot joins the given path elements to the calculated root directory.
	FromRoot: func(elem ...string) string {
		return filepath.Join(root, filepath.Join(elem...))
	},

	// Resolves returns the absolute path of the given path string.
	Resolves: func(pathString string) (string, error) {
		return filepath.Abs(pathString)
	},

	// Available checks if a path exists and returns its type ("file", "folder") or an error.
	Available: func(pathString string) (exist bool, fileType string, err error) {
		info, err := os.Stat(pathString)
		if err != nil {
			if os.IsNotExist(err) {
				return false, "", nil // Path does not exist
			}
			return false, "", fmt.Errorf("path check error for '%s': %w", pathString, err)
		}
		if info.IsDir() {
			return true, "folder", nil
		}
		return true, "file", nil
	},

	// IfFolder checks if a path exists and is a directory.
	IfFolder: func(pathString string) bool {
		exist, fileType, err := Path.Available(pathString)
		return err == nil && exist && fileType == "folder"
	},

	// IfFile checks if a path exists and is a regular file.
	IfFile: func(pathString string) bool {
		exist, fileType, err := Path.Available(pathString)
		return err == nil && exist && fileType == "file"
	},

	// IsIndependent checks if two folders are independent (neither is inside the other).
	IsIndependent: func(folder1, folder2 string) (bool, error) {
		abs1, err := filepath.Abs(folder1)
		if err != nil {
			return false, fmt.Errorf("could not get absolute path for folder1 '%s': %w", folder1, err)
		}
		abs2, err := filepath.Abs(folder2)
		if err != nil {
			return false, fmt.Errorf("could not get absolute path for folder2 '%s': %w", folder2, err)
		}

		rel1, err := filepath.Rel(abs1, abs2)
		if err != nil {
			// If paths are on different drives/partitions, Rel might return an error.
			// In such cases, they are independent.
			return true, nil
		}
		rel2, err := filepath.Rel(abs2, abs1)
		if err != nil {
			return true, nil
		}

		// A path is independent if its relative path starts with ".." or is absolute (meaning different roots).
		notInside := func(rel string) bool {
			return strings.HasPrefix(rel, "..") || filepath.IsAbs(rel)
		}
		return notInside(rel1) && notInside(rel2), nil
	},

	// ListFiles recursively lists all files in a directory.
	ListFiles: func(dir string, fileList []string) ([]string, error) {
		if !Path.IfFolder(dir) {
			return fileList, nil // Return current list if dir doesn't exist or is not a folder
		}
		err := filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
			if err != nil {
				return err
			}
			if !d.IsDir() {
				fileList = append(fileList, path)
			}
			return nil
		})
		return fileList, err
	},

	// ListFolders recursively lists all subfolders in a directory.
	ListFolders: func(dir string, folderList []string) ([]string, error) {
		if !Path.IfFolder(dir) {
			return folderList, nil // Return current list if dir doesn't exist or is not a folder
		}
		err := filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
			if err != nil {
				return err
			}
			if d.IsDir() && path != dir { // Exclude the root directory itself
				folderList = append(folderList, path)
			}
			return nil
		})
		return folderList, err
	},
}

// Clone provides utilities for cloning directories and files.
var Clone = struct {
	Hard func(source, destination string, ignoreFiles []string) error
	Safe func(source, destination string, ignoreFiles []string) error
}{
	// Hard performs a recursive copy of source to destination, ignoring specified files.
	Hard: func(source, destination string, ignoreFiles []string) error {
		sourceInfo, err := os.Stat(source)
		if err != nil {
			if os.IsNotExist(err) {
				return fmt.Errorf("source folder '%s' does not exist: %w", source, err)
			}
			return fmt.Errorf("could not stat source '%s': %w", source, err)
		}

		if sourceInfo.IsDir() {
			err = os.MkdirAll(destination, sourceInfo.Mode())
			if err != nil {
				return fmt.Errorf("could not create destination directory '%s': %w", destination, err)
			}

			entries, err := os.ReadDir(source)
			if err != nil {
				return fmt.Errorf("could not read source directory '%s': %w", source, err)
			}

			for _, entry := range entries {
				srcPath := filepath.Join(source, entry.Name())
				destPath := filepath.Join(destination, entry.Name())

				// Check if the file/folder should be ignored
				found := false
				for _, ignore := range ignoreFiles {
					if srcPath == ignore {
						found = true
						break
					}
				}
				if found {
					continue
				}

				if entry.IsDir() {
					if err := Clone.Hard(srcPath, destPath, ignoreFiles); err != nil {
						return err
					}
				} else {
					if err := copyFile(srcPath, destPath); err != nil {
						return err
					}
				}
			}
		} else {
			// If source is a file, just copy it.
			if err := copyFile(source, destination); err != nil {
				return err
			}
		}
		return nil
	},

	// Safe performs a safe copy, only copying files that don't exist in the destination.
	Safe: func(source, destination string, ignoreFiles []string) error {
		var destinationFiles []string
		if Path.IfFolder(destination) {
			var err error
			destinationFiles, err = Path.ListFiles(destination, []string{})
			if err != nil {
				return fmt.Errorf("could not list files in destination '%s': %w", destination, err)
			}
		}

		// Convert destination files to relative paths from the source, then to absolute paths
		// to match the ignoreFiles format expected by Clone.Hard.
		var existingDestAbsPaths []string
		for _, destFile := range destinationFiles {
			relPath, err := filepath.Rel(destination, destFile)
			if err != nil {
				return fmt.Errorf("could not get relative path for '%s': %w", destFile, err)
			}
			existingDestAbsPaths = append(existingDestAbsPaths, filepath.Join(source, relPath))
		}

		allIgnoreFiles := append(ignoreFiles, existingDestAbsPaths...)
		return Clone.Hard(source, destination, allIgnoreFiles)
	},
}

// copyFile is a helper function to copy a single file.
func copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return fmt.Errorf("could not open source file '%s': %w", src, err)
	}
	defer sourceFile.Close()

	destFile, err := os.Create(dst)
	if err != nil {
		return fmt.Errorf("could not create destination file '%s': %w", dst, err)
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, sourceFile)
	if err != nil {
		return fmt.Errorf("could not copy content from '%s' to '%s': %w", src, dst, err)
	}
	return destFile.Sync() // Ensure data is written to disk
}

// Read provides utilities for reading files.
var Read = struct {
	File func(target string, online bool) (status bool, data string, err error)
	Json func(target string, online bool) (status bool, data map[string]interface{}, err error)
	Bulk func(target string, extensions []string) (map[string]string, error)
}{
	// File reads a file from disk or fetches it from a URL.
	File: func(target string, online bool) (status bool, data string, err error) {
		if online {
			resp, err := http.Get(target)
			if err != nil {
				return false, "", fmt.Errorf("failed to fetch URL '%s': %w", target, err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				return false, "", fmt.Errorf("failed to fetch URL '%s', status code: %d", target, resp.StatusCode)
			}

			bodyBytes, err := io.ReadAll(resp.Body)
			if err != nil {
				return false, "", fmt.Errorf("failed to read response body from '%s': %w", target, err)
			}
			return true, string(bodyBytes), nil
		} else {
			if !Path.IfFile(target) {
				return false, "", fmt.Errorf("file does not exist: %s", target)
			}
			contentBytes, err := os.ReadFile(target)
			if err != nil {
				return false, "", fmt.Errorf("failed to read file '%s': %w", target, err)
			}
			return true, string(contentBytes), nil
		}
	},

	// Json reads a JSON file from disk or fetches it from a URL, stripping comments.
	Json: func(target string, online bool) (status bool, data map[string]interface{}, err error) {
		var rawContent string
		var readErr error

		if online {
			status, rawContent, readErr = Read.File(target, true)
		} else {
			status, rawContent, readErr = Read.File(target, false)
		}

		if !status || readErr != nil {
			return false, nil, readErr
		}

		// Remove C-style comments (/* ... */) and single-line comments (// ...)
		// This regex is a simplified version and might not handle all edge cases perfectly.
		commentRegex := regexp.MustCompile(`(?s)/\*.*?\*/|//.*`)
		cleanContent := commentRegex.ReplaceAllString(rawContent, "")

		var jsonData map[string]interface{}
		err = json.Unmarshal([]byte(cleanContent), &jsonData)
		if err != nil {
			return false, nil, fmt.Errorf("failed to parse JSON from '%s': %w", target, err)
		}
		return true, jsonData, nil
	},

	// Bulk reads multiple files from a target directory based on extensions.
	Bulk: func(target string, extensions []string) (map[string]string, error) {
		result := make(map[string]string)
		var convertedExtensions []string
		for _, ext := range extensions {
			if !strings.HasPrefix(ext, ".") {
				convertedExtensions = append(convertedExtensions, "."+ext)
			} else {
				convertedExtensions = append(convertedExtensions, ext)
			}
		}

		files, err := Path.ListFiles(target, []string{})
		if err != nil {
			return nil, fmt.Errorf("failed to list files in '%s': %w", target, err)
		}

		for _, file := range files {
			if len(convertedExtensions) == 0 || contains(convertedExtensions, filepath.Ext(file)) {
				contentBytes, err := os.ReadFile(file)
				if err != nil {
					return nil, fmt.Errorf("failed to read file '%s' during bulk read: %w", file, err)
				}
				result[file] = string(contentBytes)
			}
		}
		return result, nil
	},
}

// Write provides utilities for writing files.
var Write = struct {
	File func(filePath string, content string) error
	Json func(pathString string, object map[string]interface{}) error
	Bulk func(fileContentObject map[string]string) error
}{
	// File writes content to a file, creating directories if needed.
	File: func(filePath string, content string) error {
		dir := filepath.Dir(filePath)
		if !Path.IfFolder(dir) {
			if err := os.MkdirAll(dir, 0755); err != nil { // 0755 permissions
				return fmt.Errorf("failed to create directory '%s': %w", dir, err)
			}
		}
		err := os.WriteFile(filePath, []byte(content), 0644) // 0644 permissions
		if err != nil {
			return fmt.Errorf("error writing to file '%s': %w", filePath, err)
		}
		return nil
	},

	// Json writes a JSON object to a file, pretty-printing it.
	Json: func(pathString string, object map[string]interface{}) error {
		dir := filepath.Dir(pathString)
		if !Path.IfFolder(dir) {
			if err := os.MkdirAll(dir, 0755); err != nil {
				return fmt.Errorf("failed to create directory '%s': %w", dir, err)
			}
		}
		jsonData, err := json.MarshalIndent(object, "", "  ") // Pretty print with 2 spaces
		if err != nil {
			return fmt.Errorf("failed to marshal JSON object: %w", err)
		}
		err = os.WriteFile(pathString, jsonData, 0644)
		if err != nil {
			return fmt.Errorf("error writing JSON data to '%s': %w", pathString, err)
		}
		return nil
	},

	// Bulk writes multiple files from a map of file paths to content.
	Bulk: func(fileContentObject map[string]string) error {
		for filePath, content := range fileContentObject {
			if err := Write.File(filePath, content); err != nil {
				return err // Propagate the first error encountered
			}
		}
		return nil
	},
}

// Sync provides utilities for synchronizing files and folders.
var Sync = struct {
	File func(url, path string) (string, error)
	Json func(url, path string) (map[string]interface{}, error)
	Bulk func(source, target string, extInclude, extnUnsync, fileExcludes []string) (map[string]string, error)
}{
	// File synchronizes a file from a URL or local path.
	File: func(url, path string) (string, error) {
		status, latestData, err := Read.File(url, true)
		if err == nil && status {
			if writeErr := Write.File(path, latestData); writeErr != nil {
				return "", fmt.Errorf("failed to write latest data to '%s': %w", path, writeErr)
			}
			return latestData, nil
		}
		// If online fetch fails, try reading local file
		status, currentData, err := Read.File(path, false)
		if err == nil && status {
			return currentData, nil
		}
		return "", fmt.Errorf("failed to sync file from URL '%s' and local path '%s': %w", url, path, err)
	},

	// Json synchronizes a JSON file from a URL or local path.
	Json: func(url, path string) (map[string]interface{}, error) {
		status, latestData, err := Read.Json(url, true)
		if err == nil && status {
			if writeErr := Write.Json(path, latestData); writeErr != nil {
				return nil, fmt.Errorf("failed to write latest JSON data to '%s': %w", path, writeErr)
			}
			return latestData, nil
		}
		// If online fetch fails, try reading local file
		status, currentData, err := Read.Json(path, false)
		if err == nil && status {
			return currentData, nil
		}
		return nil, fmt.Errorf("failed to sync JSON from URL '%s' and local path '%s': %w", url, path, err)
	},

	// Bulk synchronizes two directories, handling inclusions, exclusions, and unsynced extensions.
	Bulk: func(source, target string, extInclude, extnUnsync, fileExcludes []string) (map[string]string, error) {
		resultFileContents := make(map[string]string)

		// Normalize extensions to include leading dot
		normalizeExts := func(exts []string) []string {
			var normalized []string
			for _, ext := range exts {
				if !strings.HasPrefix(ext, ".") {
					normalized = append(normalized, "."+ext)
				} else {
					normalized = append(normalized, ext)
				}
			}
			return normalized
		}
		extInclude = normalizeExts(extInclude)
		extnUnsync = normalizeExts(extnUnsync)

		sourceExists := Path.IfFolder(source)
		targetExists := Path.IfFolder(target)

		// Initial synchronization to ensure both directories exist and have basic content
		if !sourceExists && !targetExists {
			return nil, fmt.Errorf("neither source '%s' nor target '%s' directories exist", source, target)
		}
		if !targetExists && sourceExists {
			if err := Clone.Safe(source, target, []string{}); err != nil {
				return nil, fmt.Errorf("failed to safely clone source to target when target did not exist: %w", err)
			}
		}
		if !sourceExists && targetExists {
			if err := Clone.Safe(target, source, []string{}); err != nil { // Note: original code clones target to source here
				return nil, fmt.Errorf("failed to safely clone target to source when source did not exist: %w", err)
			}
		}

		// List files and filter by exclusions
		targetFiles, err := Path.ListFiles(target, []string{})
		if err != nil {
			return nil, fmt.Errorf("failed to list target files: %w", err)
		}
		relativeTargetFiles := make([]string, 0, len(targetFiles))
		for _, file := range targetFiles {
			relPath, err := filepath.Rel(target, file)
			if err != nil {
				return nil, fmt.Errorf("failed to get relative path for target file '%s': %w", file, err)
			}
			if !isExcluded(relPath, fileExcludes) {
				relativeTargetFiles = append(relativeTargetFiles, relPath)
			}
		}

		sourceFiles, err := Path.ListFiles(source, []string{})
		if err != nil {
			return nil, fmt.Errorf("failed to list source files: %w", err)
		}
		relativeSourceFiles := make([]string, 0, len(sourceFiles))
		for _, file := range sourceFiles {
			relPath, err := filepath.Rel(source, file)
			if err != nil {
				return nil, fmt.Errorf("failed to get relative path for source file '%s': %w", file, err)
			}
			if !isExcluded(relPath, fileExcludes) {
				relativeSourceFiles = append(relativeSourceFiles, relPath)
			}
		}

		// Delete files in target that are not in source or are marked as unsyncable
		for _, relFile := range relativeTargetFiles {
			targetFilePath := filepath.Join(target, relFile)
			sourceFilePath := filepath.Join(source, relFile) // Corresponding source path

			// Check if file exists in source
			sourceFileExists := false
			for _, sf := range relativeSourceFiles {
				if sf == relFile {
					sourceFileExists = true
					break
				}
			}

			// Check if extension is in unsync list
			isUnsyncable := contains(extnUnsync, filepath.Ext(relFile))

			if !sourceFileExists || isUnsyncable {
				if err := os.Remove(targetFilePath); err != nil && !os.IsNotExist(err) {
					return nil, fmt.Errorf("failed to delete target file '%s': %w", targetFilePath, err)
				}
			}
		}

		// Copy files from source to target and read contents for included extensions
		for _, relFile := range relativeSourceFiles {
			sourceFilePath := filepath.Join(source, relFile)
			targetFilePath := filepath.Join(target, relFile)

			// Ensure parent directory exists in target
			targetDir := filepath.Dir(targetFilePath)
			if !Path.IfFolder(targetDir) {
				if err := os.MkdirAll(targetDir, 0755); err != nil {
					return nil, fmt.Errorf("failed to create target directory '%s': %w", targetDir, err)
				}
			}

			if contains(extInclude, filepath.Ext(relFile)) {
				contentBytes, err := os.ReadFile(sourceFilePath)
				if err != nil {
					return nil, fmt.Errorf("failed to read source file '%s' for inclusion: %w", sourceFilePath, err)
				}
				resultFileContents[relFile] = string(contentBytes)
			} else {
				// Copy file if not in extInclude (and not deleted in previous step)
				if err := copyFile(sourceFilePath, targetFilePath); err != nil {
					return nil, fmt.Errorf("failed to copy file from '%s' to '%s': %w", sourceFilePath, targetFilePath, err)
				}
			}
		}

		// Delete empty folders in target that no longer have corresponding source folders
		targetFolders, err := Path.ListFolders(target, []string{})
		if err != nil {
			return nil, fmt.Errorf("failed to list target folders: %w", err)
		}
		sourceFolders, err := Path.ListFolders(source, []string{})
		if err != nil {
			return nil, fmt.Errorf("failed to list source folders: %w", err)
		}

		for _, targetFolder := range targetFolders {
			relFolder, err := filepath.Rel(target, targetFolder)
			if err != nil {
				return nil, fmt.Errorf("failed to get relative path for target folder '%s': %w", targetFolder, err)
			}
			sourceFolderPath := filepath.Join(source, relFolder)

			// Check if the corresponding source folder exists
			sourceFolderExists := false
			for _, sf := range sourceFolders {
				if sf == sourceFolderPath {
					sourceFolderExists = true
					break
				}
			}

			// If target folder is empty and no corresponding source folder, remove it
			// (Note: This logic is simplified from Node.js version which checks if sourceFolderPath exists based on target path)
			// A more robust solution would involve checking if the target folder became empty after file deletions.
			// For simplicity, we'll remove if source equivalent doesn't exist AND target folder is empty.
			isEmpty, _ := isDirEmpty(targetFolder) // Ignore error, assume not empty if error
			if !sourceFolderExists && isEmpty {
				if err := os.RemoveAll(targetFolder); err != nil && !os.IsNotExist(err) {
					return nil, fmt.Errorf("failed to remove empty target folder '%s': %w", targetFolder, err)
				}
			}
		}

		return resultFileContents, nil
	},
}

// Delete provides utilities for deleting files and folders.
var Delete = struct {
	File   func(pathToDelete string) (success bool, message string, err error)
	Bulk   func(pathsToDelete ...string) error
	Folder func(folderPath string, extensions, ignorePaths []string) (success bool, message string, err error)
}{
	// File deletes a file or a directory recursively.
	File: func(pathToDelete string) (success bool, message string, err error) {
		exist, _, statErr := Path.Available(pathToDelete)
		if statErr != nil {
			return false, "Error checking path existence", statErr
		}
		if !exist {
			return false, "Path does not exist.", nil
		}

		// os.RemoveAll works for both files and directories
		err = os.RemoveAll(pathToDelete)
		if err != nil {
			return false, "Error deleting path.", fmt.Errorf("failed to delete '%s': %w", pathToDelete, err)
		}
		return true, "Path deleted successfully.", nil
	},

	// Bulk deletes multiple paths.
	Bulk: func(pathsToDelete ...string) error {
		var firstErr error
		for _, p := range pathsToDelete {
			_, _, err := Delete.File(p)
			if err != nil && firstErr == nil {
				firstErr = err // Store the first error but continue trying to delete others
			}
		}
		return firstErr
	},

	// Folder cleans a folder by deleting files matching extensions or all files if extensions are empty,
	// and recursively deleting subfolders, respecting ignore paths.
	Folder: func(folderPath string, extensions, ignorePaths []string) (success bool, message string, err error) {
		if !Path.IfFolder(folderPath) {
			return false, "Folder does not exist.", nil
		}

		// Normalize extensions
		var normalizedExtensions []string
		for _, ext := range extensions {
			if !strings.HasPrefix(ext, ".") {
				normalizedExtensions = append(normalizedExtensions, "."+ext)
			} else {
				normalizedExtensions = append(normalizedExtensions, ext)
			}
		}

		// Delete files
		files, err := Path.ListFiles(folderPath, []string{})
		if err != nil {
			return false, "Error listing files for deletion.", fmt.Errorf("failed to list files in '%s': %w", folderPath, err)
		}
		for _, file := range files {
			if contains(ignorePaths, file) {
				continue
			}
			if len(normalizedExtensions) == 0 || contains(normalizedExtensions, filepath.Ext(file)) {
				if err := os.Remove(file); err != nil && !os.IsNotExist(err) {
					return false, "Error deleting file.", fmt.Errorf("failed to delete file '%s': %w", file, err)
				}
			}
		}

		// Delete empty folders (recursively)
		// We need to list folders again after deleting files, and iterate in reverse order
		// to delete deepest empty folders first.
		folders, err := Path.ListFolders(folderPath, []string{})
		if err != nil {
			return false, "Error listing folders for deletion.", fmt.Errorf("failed to list folders in '%s': %w", folderPath, err)
		}
		// Sort folders in reverse order of path length to delete deepest first
		// This helps ensure parent folders become empty and can be deleted.
		for i := len(folders) - 1; i >= 0; i-- {
			subFolder := folders[i]
			if contains(ignorePaths, subFolder) {
				continue
			}
			isEmpty, checkErr := isDirEmpty(subFolder)
			if checkErr != nil {
				// Log error but continue
				fmt.Printf("Warning: Could not check if directory '%s' is empty: %v\n", subFolder, checkErr)
				continue
			}
			if isEmpty {
				if err := os.Remove(subFolder); err != nil && !os.IsNotExist(err) {
					return false, "Error deleting folder.", fmt.Errorf("failed to delete empty folder '%s': %w", subFolder, err)
				}
			}
		}

		return true, "Folder cleaned successfully.", nil
	},
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

// isExcluded checks if a relative path or an absolute path is in the exclusion list.
func isExcluded(relPath string, excludes []string) bool {
	for _, exclude := range excludes {
		// Check if the relative path starts with any exclude prefix
		if strings.HasPrefix(relPath, exclude) {
			return true
		}
	}
	return false
}

// isDirEmpty checks if a directory is empty.
func isDirEmpty(name string) (bool, error) {
	f, err := os.Open(name)
	if err != nil {
		return false, err
	}
	defer f.Close()

	_, err = f.Readdirnames(1) // Or f.Readdir(1)
	if err == io.EOF {
		return true, nil
	}
	return false, err // Either not empty or error
}

