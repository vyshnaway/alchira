package fileman

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

// Returns basename from a pathstring
func Path_BaseName(pathstring string) string {
	return filepath.Base(pathstring);
}

// Join joins any number of path elements into a single path.
func Path_Join(pathfrags ...string) string {
	return filepath.Join(pathfrags...)
}

// FromRoot joins the given path elements to the calculated root directory.
func Path_FromRoot(elem ...string) string {
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		panic("Failed to get current file path for root calculation.")
	}
	root := filepath.Join(filepath.Dir(filename), "..", "..")
	return filepath.Join(root, filepath.Join(elem...))
}

// Resolves returns the absolute path of the given path string.
func Path_Resolves(pathString string) (string, error) {
	return filepath.Abs(pathString)
}

// Available checks if a path exists and returns its type ("file", "folder") or an error.
func Path_Available(pathString string) (exist bool, fileType string, err error) {
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
}

// IfFolder checks if a path exists and is a directory.
func Path_IfFolder(pathString string) bool {
	exist, fileType, err := Path_Available(pathString)
	return err == nil && exist && fileType == "folder"
}

// IfFile checks if a path exists and is a regular file.
func Path_IfFile(pathString string) bool {
	exist, fileType, err := Path_Available(pathString)
	return err == nil && exist && fileType == "file"
}

// IsIndependent checks if two folders are independent (neither is inside the other).
func Path_IsIndependent(folder1, folder2 string) (bool, error) {
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
}

// ListFiles recursively lists all files in a directory.
func Path_ListFiles(dir string, fileList []string) ([]string, error) {
	if !Path_IfFolder(dir) {
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
}

// ListFolders recursively lists all subfolders in a directory.
func Path_ListFolders(dir string, folderList []string) ([]string, error) {
	if !Path_IfFolder(dir) {
		return folderList, nil
	}
	err := filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() && path != dir {
			folderList = append(folderList, path)
		}
		return nil
	})
	return folderList, err
}
