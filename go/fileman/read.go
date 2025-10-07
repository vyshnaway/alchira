package fileman

import (
	_fmt_ "fmt"
	_io_ "io"
	_utils_ "main/utils"
	_http_ "net/http"
	_os_ "os"
	_filepath_ "path/filepath"
	_strings_ "strings"
)

// File reads a file from disk or fetches it from a URL.
func Read_File(target string, online bool) (data string, err error) {
	if online {
		resp, err := _http_.Get(target)
		if err != nil {
			return "", _fmt_.Errorf("failed to fetch URL '%s': %w", target, err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != _http_.StatusOK {
			return "", _fmt_.Errorf("failed to fetch URL '%s', status code: %d", target, resp.StatusCode)
		}

		bodyBytes, err := _io_.ReadAll(resp.Body)
		if err != nil {
			return "", _fmt_.Errorf("failed to read response body from '%s': %w", target, err)
		}
		return string(bodyBytes), nil
	} else {
		if !Path_IfFile(target) {
			return "", _fmt_.Errorf("file does not exist: %s", target)
		}
		contentBytes, err := _os_.ReadFile(target)
		if err != nil {
			return "", _fmt_.Errorf("failed to read file '%s': %w", target, err)
		}
		return string(contentBytes), nil
	}
}

// Json reads a JSON file from disk or fetches it from a URL, stripping comments.
func Read_Json(target string, online bool) (data any, err error) {
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

	jsonData, err := _utils_.Code_JsonParse[any](rawContent)
	if err != nil {
		return nil, _fmt_.Errorf("failed to parse JSON from '%s': %w", target, err)
	}
	return jsonData, nil
}

// Bulk reads multiple files from a target directory based on extensions.
func Read_Bulk(target string, extensions []string) (map[string]string, error) {
	result := make(map[string]string)
	var convertedExtensions []string
	for _, ext := range extensions {
		if !_strings_.HasPrefix(ext, ".") {
			convertedExtensions = append(convertedExtensions, "."+ext)
		} else {
			convertedExtensions = append(convertedExtensions, ext)
		}
	}

	files, err := Path_ListFiles(target, []string{})
	if err != nil {
		return nil, _fmt_.Errorf("failed to list files in '%s': %w", target, err)
	}

	for _, file := range files {
		if len(convertedExtensions) == 0 || helper_Contains(convertedExtensions, _filepath_.Ext(file)) {
			contentBytes, err := _os_.ReadFile(file)
			if err != nil {
				return nil, _fmt_.Errorf("failed to read file '%s' during bulk read: %w", file, err)
			}
			result[file] = string(contentBytes)
		}
	}
	return result, nil
}