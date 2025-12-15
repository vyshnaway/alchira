package fileman

import (
	_error "errors"
	_fmt "fmt"
	_os "os"
	_filepath "path/filepath"
	_slice "slices"
	_strings "strings"
)

// File deletes a file or a directory recursively.
func Delete_File(pathToDelete string) (err error) {
	pathtype, statErr := Path_Check(pathToDelete)
	if statErr != nil {
		return statErr
	}
	if pathtype == Path_Check_Type_Nil {
		return nil
	}

	// os.RemoveAll works for both files and directories
	err = _os.RemoveAll(pathToDelete)
	if err != nil {
		return _fmt.Errorf("failed to delete '%s': %w", pathToDelete, err)
	}
	return nil
}

// Bulk deletes multiple paths.
func Delete_Bulk(pathsToDelete ...string) error {
	errs := []error{}
	for _, p := range pathsToDelete {

		if err := Delete_File(p); err != nil {
			errs = append(errs, err)
		}
	}
	return _error.Join(errs...)
}

// Folder cleans a folder by deleting files matching extensions or all files if extensions are empty,
// and recursively deleting subfolders, respecting ignore paths.
func Delete_Folder(folderPath string, extensions, ignorePaths []string) (err error) {
	if !Path_IfDir(folderPath) {
		return nil
	}

	// Normalize extensions
	var normalizedExtensions []string
	for _, ext := range extensions {
		if !_strings.HasPrefix(ext, ".") {
			normalizedExtensions = append(normalizedExtensions, "."+ext)
		} else {
			normalizedExtensions = append(normalizedExtensions, ext)
		}
	}

	// Delete files
	files, err := Path_ListFiles(folderPath, []string{})
	if err != nil {
		return _fmt.Errorf("failed to list files in '%s': %w", folderPath, err)
	}

	errs := make([]error, 3*len(files))
	for _, file := range files {
		if _slice.Contains(ignorePaths, file) {
			continue
		}
		if len(normalizedExtensions) == 0 || _slice.Contains(normalizedExtensions, _filepath.Ext(file)) {
			if err := _os.Remove(file); err != nil && !_os.IsNotExist(err) {
				errs = append(errs, _fmt.Errorf("failed to delete file '%s': %w", file, err))
			}
		}
	}

	// Delete empty folders (recursively)
	// We need to list folders again after deleting files, and iterate in reverse order
	// to delete deepest empty folders first.
	folders, err := Path_ListFolders(folderPath, []string{})
	if err != nil {
		errs = append(errs, _fmt.Errorf("failed to list folders in '%s': %w", folderPath, err))
	}
	// Sort folders in reverse order of path length to delete deepest first
	// This helps ensure parent folders become empty and can be deleted.
	for i := len(folders) - 1; i >= 0; i-- {
		subFolder := folders[i]
		if _slice.Contains(ignorePaths, subFolder) {
			continue
		}
		isEmpty, checkErr := helper_IsDirEmpty(subFolder)
		if checkErr != nil {
			// Log error but continue
			_fmt.Printf("Warning: Could not check if directory '%s' is empty: %v\r\n", subFolder, checkErr)
			continue
		}
		if isEmpty {
			if err := _os.Remove(subFolder); err != nil && !_os.IsNotExist(err) {
				errs = append(errs, _fmt.Errorf("failed to delete empty folder '%s': %w", subFolder, err))
			}
		}
	}

	return _error.Join(errs...)
}
