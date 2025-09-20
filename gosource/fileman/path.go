package fileman

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

// Returns basename from a pathString
func Path_BaseName(pathString string) string {
	return filepath.Base(pathString)
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
func Path_Check(pathString string) (exist bool, filetype string, err error) {
	info, err := os.Stat(pathString)
	if err != nil {
		if os.IsNotExist(err) {
			return false, "", nil
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
	exist, filetype, err := Path_Check(pathString)
	return err == nil && exist && filetype == "folder"
}

// IfFile checks if a path exists and is a regular file.
func Path_IfFile(pathString string) bool {
	exist, filetype, err := Path_Check(pathString)
	return err == nil && exist && filetype == "file"
}

// isSubpath returns true if child is a subdirectory of parent, not counting equality.
func Path_IsSubpath(parent, child string) bool {
    parent = filepath.Clean(parent)
    child = filepath.Clean(child)
    if len(child) <= len(parent) {
        return false
    }
    // Ensure there's a path separator after the parent
    return strings.HasPrefix(child, parent+string(filepath.Separator))
}

// Path_IsIndependent checks if two folders are independent (neither is inside the other).
func Path_IsIndependent(folder1, folder2 string) (bool, error) {
    abs1, err := filepath.Abs(folder1)
    if err != nil {
        return false, fmt.Errorf("could not get absolute path for folder1 '%s': %w", folder1, err)
    }
    abs2, err := filepath.Abs(folder2)
    if err != nil {
        return false, fmt.Errorf("could not get absolute path for folder2 '%s': %w", folder2, err)
    }
    abs1 = filepath.Clean(abs1)
    abs2 = filepath.Clean(abs2)

    // If they are the same folder, not independent.
    if abs1 == abs2 {
        return false, nil
    }
    // If one is a prefix path of the other (with path separator), not independent.
    if Path_IsSubpath(abs1, abs2) || Path_IsSubpath(abs2, abs1) {
        return false, nil
    }
    // Otherwise, independent.
    return true, nil
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
