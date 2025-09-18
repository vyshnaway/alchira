package fileman

import (
	"slices"
	"fmt"
	"io"
	"os"
	"strings"
)

// copyFile is a helper function to copy a single file.
func helper_CopyFile(src, dst string) error {
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

// Helper function to check if a string is in a slice.
func helper_Contains(slice []string, item string) bool {
	return slices.Contains(slice, item)
}

// isExcluded checks if a relative path or an absolute path is in the exclusion list.
func helper_IsExcluded(relPath string, excludes []string) bool {
	for _, exclude := range excludes {
		// Check if the relative path starts with any exclude prefix
		if strings.HasPrefix(relPath, exclude) {
			return true
		}
	}
	return false
}

// isDirEmpty checks if a directory is empty.
func helper_IsDirEmpty(name string) (bool, error) {
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
