package fileman

import (
	_fmt "fmt"
	_io "io"
	_os "os"
)

// copyFile is a helper function to copy a single file.
func helper_CopyFile(src, dst string) error {
	_fmt.Println(src)
	sourceFile, err := _os.Open(src)
	if err != nil {
		return _fmt.Errorf("could not open source file '%s': %w", src, err)
	}
	defer sourceFile.Close()

	destFile, err := _os.Create(dst)
	if err != nil {
		return _fmt.Errorf("could not create destination file '%s': %w", dst, err)
	}
	defer destFile.Close()

	_, err = _io.Copy(destFile, sourceFile)
	if err != nil {
		return _fmt.Errorf("could not copy content from '%s' to '%s': %w", src, dst, err)
	}
	return destFile.Sync() // Ensure data is written to disk
}

// isExcluded checks if a relative path or an absolute path is in the exclusion list.
func helper_IsExcluded(relPath string, excludes []string) bool {
	for _, exclude := range excludes {
		// Check if the relative path starts with any exclude prefix
		if Path_HasChildPath(relPath, exclude) {
			return true
		}
	}
	return false
}

// isDirEmpty checks if a directory is empty.
func helper_IsDirEmpty(name string) (bool, error) {
	f, err := _os.Open(name)
	if err != nil {
		return false, err
	}
	defer f.Close()

	_, err = f.Readdirnames(1) // Or f.Readdir(1)
	if err == _io.EOF {
		return true, nil
	}
	return false, err // Either not empty or error
}
