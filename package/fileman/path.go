package fileman

import (
	_fmt "fmt"
	_fs "io/fs"
	_os "os"
	_filepath "path/filepath"
	_strings "strings"
)

// Returns basename from a pathString
func Path_BaseName(pathString string) string {
	return _filepath.Base(pathString)
}

// Returns basename from a pathString
func Path_FileExtension(pathString string) string {
	e := _filepath.Ext(pathString)
	if len(e) > 0 {
		e = e[1:]
	}
	return e
}

// Join joins any number of path elements into a single path.
func Path_Join(pathfrags ...string) string {
	return _filepath.Join(pathfrags...)
}

// Resolves returns the absolute path of the given path string.
func Path_Resolves(pathString string) (string, error) {
	return _filepath.Abs(_filepath.Clean(pathString))
}

// Resolves returns the absolute path of the given path string.
func Path_Basedir(pathString string) string {
	return _filepath.Dir(pathString)
}

type Path_Check_Type int

const (
	Path_Check_Type_Err Path_Check_Type = 0
	Path_Check_Type_Nil Path_Check_Type = 1
	Path_Check_Type_Txt Path_Check_Type = 2
	Path_Check_Type_Dir Path_Check_Type = 3
)

// Available checks if a path exists and returns its type ("txt", "dir") or an error.
func Path_Check(pathString string) (Path_Check_Type, error) {
	info, err := _os.Stat(pathString)
	if err != nil {
		if _os.IsNotExist(err) {
			return Path_Check_Type_Nil, nil
		}
		return 0, _fmt.Errorf("path check error for '%s': %w", pathString, err)
	}
	if info.IsDir() {
		return Path_Check_Type_Dir, nil
	}
	return Path_Check_Type_Txt, nil
}

// Path_Fix normalizes a file path for cross-platform compatibility
func Path_Fix(pathString string) string {
	normalized := _strings.ReplaceAll(pathString, "\\", "/")
	components := _strings.Split(normalized, "/")

	var cleanComponents []string
	for _, comp := range components {
		if comp != "" {
			cleanComponents = append(cleanComponents, comp)
		}
	}

	return _filepath.Clean(_filepath.Join(cleanComponents...))
}

// IfFolder checks if a path exists and is a directory.
func Path_IfDir(pathString string) bool {
	filetype, err := Path_Check(pathString)
	return err == nil && filetype == Path_Check_Type_Dir
}

// IfFile checks if a path exists and is a regular file.
func Path_IfFile(pathString string) bool {
	filetype, err := Path_Check(pathString)
	return err == nil && filetype == Path_Check_Type_Txt
}

// isSubpath returns true if child is a subdirectory of parent, not counting equality.
func Path_HasChildPath(parent, child string) bool {
	parent, _ = Path_Resolves(parent)
	child, _ = Path_Resolves(child)
	parent = parent + string(_filepath.Separator)
	// If rel starts with "..", it's outside the parent.
	return _strings.HasPrefix(child, parent)
}

// isSubpath returns true if child is a subdirectory of parent, not counting equality.
func Path_RelChildPath(parent, child string) (ok bool, childRelPath string) {
	parent, _ = Path_Resolves(parent)
	child, _ = Path_Resolves(child)
	parent = parent + string(_filepath.Separator)
	if _strings.HasPrefix(child, parent) {
		ok = true
		childRelPath = child[len(parent):]
	}
	// If rel starts with "..", it's outside the parent.
	return ok, childRelPath
}

// Path_IsIndependent checks if two folders are independent (neither is inside the other).
func Path_IsIndependent(folder1, folder2 string) (bool, error) {
	abs1, err := _filepath.Abs(folder1)
	if err != nil {
		return false, _fmt.Errorf("could not get absolute path for folder1 '%s': %w", folder1, err)
	}
	abs2, err := _filepath.Abs(folder2)
	if err != nil {
		return false, _fmt.Errorf("could not get absolute path for folder2 '%s': %w", folder2, err)
	}
	abs1 = _filepath.Clean(abs1)
	abs2 = _filepath.Clean(abs2)

	// If they are the same folder, not independent.
	if abs1 == abs2 {
		return false, nil
	}
	// If one is a prefix path of the other (with path separator), not independent.
	if Path_HasChildPath(abs1, abs2) || Path_HasChildPath(abs2, abs1) {
		return false, nil
	}
	// Otherwise, independent.
	return true, nil
}

// ListFiles recursively lists all files in a directory.
func Path_ListFiles(dir string, fileList []string) ([]string, error) {
	if !Path_IfDir(dir) {
		return fileList, nil // Return current list if dir doesn't exist or is not a folder
	}
	err := _filepath.WalkDir(dir, func(path string, d _fs.DirEntry, err error) error {
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
	if !Path_IfDir(dir) {
		return folderList, nil
	}
	err := _filepath.WalkDir(dir, func(path string, d _fs.DirEntry, err error) error {
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
