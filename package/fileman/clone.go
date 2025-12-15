package fileman

import (
	_errors "errors"
	_fmt "fmt"
	_os "os"
	_filepath "path/filepath"
	_slices "slices"
)

// Safe performs a safe copy, only copying files that don't exist in the destination.
func Clone_Safe(source, destination string, ignoreFiles []string) error {
	var destinationFiles []string
	if Path_IfDir(destination) {
		var err error
		destinationFiles, err = Path_ListFiles(destination, []string{})
		if err != nil {
			return _fmt.Errorf("could not list files in destination '%s': %w", destination, err)
		}
	}

	var existingDestAbsPaths []string
	for _, destFile := range destinationFiles {
		relPath, err := _filepath.Rel(destination, destFile)
		if err != nil {
			return _fmt.Errorf("could not get relative path for '%s': %w", destFile, err)
		}
		existingDestAbsPaths = append(existingDestAbsPaths, _filepath.Join(source, relPath))
	}

	allIgnoreFiles := append(ignoreFiles, existingDestAbsPaths...)

	return Clone_Hard(source, destination, allIgnoreFiles)
}

func Clone_Hard(source, destination string, ignoreFiles []string) error {
	sourceInfo, err := _os.Stat(source)
	if err != nil {
		if _os.IsNotExist(err) {
			return _fmt.Errorf("source folder '%s' does not exist: %w", source, err)
		}
		return _fmt.Errorf("could not stat source '%s': %w", source, err)
	}

	if sourceInfo.IsDir() {
		err = _os.MkdirAll(destination, sourceInfo.Mode())
		if err != nil {
			return _fmt.Errorf("could not create destination directory '%s': %w", destination, err)
		}

		entries, err := _os.ReadDir(source)
		if err != nil {
			return _fmt.Errorf("could not read source directory '%s': %w", source, err)
		}

		errs := []error{}
		for _, entry := range entries {
			srcPath := _filepath.Join(source, entry.Name())
			destPath := _filepath.Join(destination, entry.Name())

			found := _slices.Contains(ignoreFiles, srcPath)
			if found {
				continue
			}

			if entry.IsDir() {
				if err := Clone_Hard(srcPath, destPath, ignoreFiles); err != nil {
					errs = append(errs, err)
				}
			} else {
				if err := helper_CopyFile(srcPath, destPath); err != nil {
					errs = append(errs, err)
				}
			}
		}
		return _errors.Join(errs...)

	} else {
		if err := helper_CopyFile(source, destination); err != nil {
			return err
		}
	}
	return nil
}
