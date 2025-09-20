package fileman

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// File deletes a file or a directory recursively.
func Delete_File(pathToDelete string) (success bool, message string, err error) {
	exist, _, statErr := Path_Check(pathToDelete)
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
}

// Bulk deletes multiple paths.
func Delete_Bulk(pathsToDelete ...string) error {
	var firstErr error
	for _, p := range pathsToDelete {
		_, _, err := Delete_File(p)
		if err != nil && firstErr == nil {
			firstErr = err // Store the first error but continue trying to delete others
		}
	}
	return firstErr
}

// Folder cleans a folder by deleting files matching extensions or all files if extensions are empty,
// and recursively deleting subfolders, respecting ignore paths.
func Delete_Folder(folderPath string, extensions, ignorePaths []string) (success bool, message string, err error) {
	if !Path_IfFolder(folderPath) {
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
	files, err := Path_ListFiles(folderPath, []string{})
	if err != nil {
		return false, "Error listing files for deletion.", fmt.Errorf("failed to list files in '%s': %w", folderPath, err)
	}
	for _, file := range files {
		if helper_Contains(ignorePaths, file) {
			continue
		}
		if len(normalizedExtensions) == 0 || helper_Contains(normalizedExtensions, filepath.Ext(file)) {
			if err := os.Remove(file); err != nil && !os.IsNotExist(err) {
				return false, "Error deleting file.", fmt.Errorf("failed to delete file '%s': %w", file, err)
			}
		}
	}

	// Delete empty folders (recursively)
	// We need to list folders again after deleting files, and iterate in reverse order
	// to delete deepest empty folders first.
	folders, err := Path_ListFolders(folderPath, []string{})
	if err != nil {
		return false, "Error listing folders for deletion.", fmt.Errorf("failed to list folders in '%s': %w", folderPath, err)
	}
	// Sort folders in reverse order of path length to delete deepest first
	// This helps ensure parent folders become empty and can be deleted.
	for i := len(folders) - 1; i >= 0; i-- {
		subFolder := folders[i]
		if helper_Contains(ignorePaths, subFolder) {
			continue
		}
		isEmpty, checkErr := helper_IsDirEmpty(subFolder)
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
}
