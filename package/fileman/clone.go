package fileman

import (
	"errors"
	_errors "errors"
	_fmt "fmt"
	_os "os"
	_filepath "path/filepath"
	_slices "slices"
	"sync"
)

// Safe performs a safe copy, only copying files that don't exist in the destination.
func Clone_Safe(source, destination string, ignoreFiles []string, concurrent bool) error {
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

	return Clone_Hard(source, destination, allIgnoreFiles, concurrent)
}

func Clone_Hard(source, destination string, ignoreFiles []string, concurrent bool) error {
	if concurrent {
		return Clone_HardParallel(source, destination, ignoreFiles)
	} else {
		return Clone_HardSerial(source, destination, ignoreFiles)
	}
}

func Clone_HardSerial(source, destination string, ignoreFiles []string) error {
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
				if err := Clone_HardSerial(srcPath, destPath, ignoreFiles); err != nil {
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

func Clone_HardParallel(source, destination string, ignoreFiles []string) error {
	var wg sync.WaitGroup
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

		errCh := make(chan error, len(entries))
		for _, entry := range entries {
			wg.Add(1)

			go func(entry _os.DirEntry) {
				defer wg.Done()

				srcPath := _filepath.Join(source, entry.Name())
				destPath := _filepath.Join(destination, entry.Name())

				found := _slices.Contains(ignoreFiles, srcPath)
				if found {
					return
				}

				if entry.IsDir() {
					if err := Clone_HardParallel(srcPath, destPath, ignoreFiles); err != nil {
						errCh <- err
					}
				} else {
					if err := helper_CopyFile(srcPath, destPath); err != nil {
						errCh <- err
					}
				}
			}(entry)
		}
		wg.Wait()
		close(errCh)

		errs := []error{}
		for e := range errCh {
			errs = append(errs, e)
		}
		return errors.Join(errs...)

	} else {
		if err := helper_CopyFile(source, destination); err != nil {
			return err
		}
	}
	return nil
}
