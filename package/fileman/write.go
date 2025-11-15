package fileman

import (
	_json "encoding/json"
	_error "errors"
	_fmt "fmt"
	_os "os"
	_filepath "path/filepath"
	_sync "sync"
)

// File writes content to a file, creating directories if needed.
func Write_File(filePath string, content string) error {
	dir := _filepath.Dir(filePath)
	if !Path_IfDir(dir) {
		if err := _os.MkdirAll(dir, 0755); err != nil {
			return _fmt.Errorf("failed to create directory '%s': %w", dir, err)
		}
	}

	// Check if file exists and content is the same to avoid rewriting
	existingContent, err := _os.ReadFile(filePath)
	if err == nil {
		if string(existingContent) == content {
			// Contents are the same, no need to write
			return nil
		}
	} else if !_os.IsNotExist(err) {
		// An error other than file not existing occurred
		return _fmt.Errorf("failed to read existing file '%s': %w", filePath, err)
	}

	err = _os.WriteFile(filePath, []byte(content), 0644)
	if err != nil {
		return _fmt.Errorf("error writing to file '%s': %w", filePath, err)
	}
	return nil
}

// Json writes a JSON object to a file, pretty-printing it.
func Write_Json(pathString string, object any) error {
	dir := _filepath.Dir(pathString)
	if !Path_IfDir(dir) {
		if err := _os.MkdirAll(dir, 0755); err != nil {
			return _fmt.Errorf("failed to create directory '%s': %w", dir, err)
		}
	}
	jsonData, err := _json.MarshalIndent(object, "", "  ")
	if err != nil {
		return _fmt.Errorf("failed to marshal JSON object: %w", err)
	}

	existingData, err := _os.ReadFile(pathString)
	if err == nil {
		if string(existingData) == string(jsonData) {
			// JSON content unchanged, skip writing
			return nil
		}
	} else if !_os.IsNotExist(err) {
		return _fmt.Errorf("failed to read existing file '%s': %w", pathString, err)
	}

	err = _os.WriteFile(pathString, jsonData, 0644)
	if err != nil {
		return _fmt.Errorf("error writing JSON data to '%s': %w", pathString, err)
	}
	return nil
}

// Bulk writes multiple files from a map of file paths to content.
func Write_Bulk(fileContentMap map[string]string, concurrent bool) error {
	var errs = make([]error, 0, len(fileContentMap))

	if concurrent {
		var wg _sync.WaitGroup
		wg.Add(len(fileContentMap))
		for filePath, content := range fileContentMap {
			go func() {
				if e := Write_File(filePath, content); e != nil {
					errs = append(errs, e)
				}
				wg.Done()
			}()
		}
		wg.Wait()
	} else {
		for filePath, content := range fileContentMap {
			if e := Write_File(filePath, content); e != nil {
				errs = append(errs, e)
			}
		}
	}

	return _error.Join(errs...)
}
