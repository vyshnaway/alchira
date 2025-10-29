package fileman

import (
	_error "errors"
	_fmt "fmt"
	_io "io"
	_utils "main/package/utils"
	_http "net/http"
	_os "os"
	_filepath "path/filepath"
	_slice "slices"
	_strings "strings"
)

// File reads a file from disk or fetches it from a URL.
func Read_File(target string, online bool) (string, error) {
	if online {
		resp, err := _http.Get(target)
		if err != nil {
			return "", _fmt.Errorf("failed to fetch URL '%s': %w", target, err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != _http.StatusOK {
			return "", _fmt.Errorf("failed to fetch URL '%s', status code: %d", target, resp.StatusCode)
		}

		bodyBytes, err := _io.ReadAll(resp.Body)
		if err != nil {
			return "", _fmt.Errorf("failed to read response body from '%s': %w", target, err)
		}
		return string(bodyBytes), nil
	} else {
		if !Path_IfFile(target) {
			return "", _fmt.Errorf("file does not exist: %s", target)
		}
		contentBytes, err := _os.ReadFile(target)
		if err != nil {
			return "", _fmt.Errorf("failed to read file '%s': %w", target, err)
		}
		return string(contentBytes), nil
	}
}

// Json reads a JSON file from disk or fetches it from a URL, stripping comments.
func Read_Json(target string, online bool) (any, error) {
	var rawContent string
	var readErr error

	if online {
		rawContent, readErr = Read_File(target, true)
	} else {
		rawContent, readErr = Read_File(target, false)
	}

	if readErr != nil {
		return nil, readErr
	}

	jsonData, err := _utils.Code_JsoncParse[any](rawContent)
	if err != nil {
		return nil, _fmt.Errorf("failed to parse JSON from '%s': %w", target, err)
	}
	return jsonData, nil
}

// Bulk reads multiple files from a target directory based on extensions.
func Read_Bulk(target string, extensions []string) (map[string]string, error) {
	var convertedExtensions []string
	for _, ext := range extensions {
		if !_strings.HasPrefix(ext, ".") {
			convertedExtensions = append(convertedExtensions, "."+ext)
		} else {
			convertedExtensions = append(convertedExtensions, ext)
		}
	}

	files, err := Path_ListFiles(target, []string{})
	if err != nil {
		return nil, _fmt.Errorf("failed to list files in '%s': %w", target, err)
	}

	errs := make([]error, 0, len(files))
	result := make(map[string]string, len(files))
	for _, file := range files {
		if len(convertedExtensions) == 0 || _slice.Contains(convertedExtensions, _filepath.Ext(file)) {
			contentBytes, err := _os.ReadFile(file)
			if err != nil {
				errs = append(errs, _fmt.Errorf("failed to read file '%s' during bulk read: %w", file, err))
				continue
			}
			result[file] = string(contentBytes)
		}
	}

	return result, _error.Join(errs...)
}
