package fileman

import (
	_os_ "os"
	_fmt_ "fmt"
	_fs_ "io/fs"
	_runtime_ "runtime"
	_strings_ "strings"
	_filepath_ "path/filepath"
)

// Returns basename from a pathString
func Path_BaseName(pathString string) string {
	return _filepath_.Base(pathString)
}

// Join joins any number of path elements into a single path.
func Path_Join(pathfrags ...string) string {
	return _filepath_.Join(pathfrags...)
}

// Path_FromRoot joins the given path elements to the calculated root directory.
func Path_FromRoot(elem ...string) (string, error) {
    _, filename, _, ok := _runtime_.Caller(0)
    if !ok {
        return "", _fmt_.Errorf("failed to get current file path for root calculation")
    }
    root := _filepath_.Join(_filepath_.Dir(filename), "..", "..")
    joined := _filepath_.Join(root, _filepath_.Join(elem...))
    return joined, nil
}

// Resolves returns the absolute path of the given path string.
func Path_Resolves(pathString string) (string, error) {
	return _filepath_.Abs(pathString)
}

// Available checks if a path exists and returns its type ("file", "folder") or an error.
func Path_Check(pathString string) (exist bool, filetype string, err error) {
	info, err := _os_.Stat(pathString)
	if err != nil {
		if _os_.IsNotExist(err) {
			return false, "", nil
		}
		return false, "", _fmt_.Errorf("path check error for '%s': %w", pathString, err)
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
	parent = _filepath_.Clean(parent)
	child = _filepath_.Clean(child)
	if len(child) <= len(parent) {
		return false
	}
	// Ensure there's a path separator after the parent
	return _strings_.HasPrefix(child, parent+string(_filepath_.Separator))
}

// Path_IsIndependent checks if two folders are independent (neither is inside the other).
func Path_IsIndependent(folder1, folder2 string) (bool, error) {
	abs1, err := _filepath_.Abs(folder1)
	if err != nil {
		return false, _fmt_.Errorf("could not get absolute path for folder1 '%s': %w", folder1, err)
	}
	abs2, err := _filepath_.Abs(folder2)
	if err != nil {
		return false, _fmt_.Errorf("could not get absolute path for folder2 '%s': %w", folder2, err)
	}
	abs1 = _filepath_.Clean(abs1)
	abs2 = _filepath_.Clean(abs2)

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
	err := _filepath_.WalkDir(dir, func(path string, d _fs_.DirEntry, err error) error {
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
	err := _filepath_.WalkDir(dir, func(path string, d _fs_.DirEntry, err error) error {
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
