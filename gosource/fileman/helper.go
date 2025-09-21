package fileman

import (
	_io_ "io"
	_os_ "os"
	_fmt_ "fmt"
	_slices_ "slices"
	_strings_ "strings"
)

// copyFile is a helper function to copy a single file.
func helper_CopyFile(src, dst string) error {
	sourceFile, err := _os_.Open(src)
	if err != nil {
		return _fmt_.Errorf("could not open source file '%s': %w", src, err)
	}
	defer sourceFile.Close()

	destFile, err := _os_.Create(dst)
	if err != nil {
		return _fmt_.Errorf("could not create destination file '%s': %w", dst, err)
	}
	defer destFile.Close()

	_, err = _io_.Copy(destFile, sourceFile)
	if err != nil {
		return _fmt_.Errorf("could not copy content from '%s' to '%s': %w", src, dst, err)
	}
	return destFile.Sync() // Ensure data is written to disk
}

// Helper function to check if a string is in a slice.
func helper_Contains(slice []string, item string) bool {
	return _slices_.Contains(slice, item)
}

// isExcluded checks if a relative path or an absolute path is in the exclusion list.
func helper_IsExcluded(relPath string, excludes []string) bool {
	for _, exclude := range excludes {
		// Check if the relative path starts with any exclude prefix
		if _strings_.HasPrefix(relPath, exclude) {
			return true
		}
	}
	return false
}

// isDirEmpty checks if a directory is empty.
func helper_IsDirEmpty(name string) (bool, error) {
	f, err := _os_.Open(name)
	if err != nil {
		return false, err
	}
	defer f.Close()

	_, err = f.Readdirnames(1) // Or f.Readdir(1)
	if err == _io_.EOF {
		return true, nil
	}
	return false, err // Either not empty or error
}
