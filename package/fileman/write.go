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
		if err := _os.MkdirAll(dir, 0755); err != nil { // 0755 permissions
			return _fmt.Errorf("failed to create directory '%s': %w", dir, err)
		}
	}
	err := _os.WriteFile(filePath, []byte(content), 0644) // 0644 permissions
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
	jsonData, err := _json.MarshalIndent(object, "", "  ") // Pretty print with 2 spaces
	if err != nil {
		return _fmt.Errorf("failed to marshal JSON object: %w", err)
	}
	err = _os.WriteFile(pathString, jsonData, 0644)
	if err != nil {
		return _fmt.Errorf("error writing JSON data to '%s': %w", pathString, err)
	}
	return nil
}

// Bulk writes multiple files from a map of file paths to content.
func Write_Bulk(fileContentMap map[string]string) error {
	var wg _sync.WaitGroup
	var errs = make([]error, 0, len(fileContentMap))
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
	return _error.Join(errs...)
}
