package fileman

import (
	"fmt"
	"os"
	"path/filepath"
)

func Clone_Hard(source, destination string, ignoreFiles []string) error {
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
				if err := Clone_Hard(srcPath, destPath, ignoreFiles); err != nil {
					return err
				}
			} else {
				if err := helper_CopyFile(srcPath, destPath); err != nil {
					return err
				}
			}
		}
	} else {
		// If source is a file, just copy it.
		if err := helper_CopyFile(source, destination); err != nil {
			return err
		}
	}
	return nil
}

// Safe performs a safe copy, only copying files that don't exist in the destination.
func Clone_Safe(source, destination string, ignoreFiles []string) error {
	var destinationFiles []string
	if Path_IfFolder(destination) {
		var err error
		destinationFiles, err = Path_ListFiles(destination, []string{})
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
	return Clone_Hard(source, destination, allIgnoreFiles)
}
