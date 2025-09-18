package fileman

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// File reads a file from disk or fetches it from a URL.
func Read_File(target string, online bool) (status bool, data string, err error) {
	if online {
		resp, err := http.Get(target)
		if err != nil {
			return false, "", fmt.Errorf("failed to fetch URL '%s': %w", target, err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return false, "", fmt.Errorf("failed to fetch URL '%s', status code: %d", target, resp.StatusCode)
		}

		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			return false, "", fmt.Errorf("failed to read response body from '%s': %w", target, err)
		}
		return true, string(bodyBytes), nil
	} else {
		if !Path_IfFile(target) {
			return false, "", fmt.Errorf("file does not exist: %s", target)
		}
		contentBytes, err := os.ReadFile(target)
		if err != nil {
			return false, "", fmt.Errorf("failed to read file '%s': %w", target, err)
		}
		return true, string(contentBytes), nil
	}
}

// Json reads a JSON file from disk or fetches it from a URL, stripping comments.
func Read_Json(target string, online bool) (status bool, data map[string]interface{}, err error) {
	var rawContent string
	var readErr error

	if online {
		status, rawContent, readErr = Read_File(target, true)
	} else {
		status, rawContent, readErr = Read_File(target, false)
	}

	if !status || readErr != nil {
		return false, nil, readErr
	}

	// Remove C-style comments (/* ... */) and single-line comments (// ...)
	// This regex is a simplified version and might not handle all edge cases perfectly.
	commentRegex := regexp.MustCompile(`(?s)/\*.*?\*/|//.*`)
	cleanContent := commentRegex.ReplaceAllString(rawContent, "")

	var jsonData map[string]interface{}
	err = json.Unmarshal([]byte(cleanContent), &jsonData)
	if err != nil {
		return false, nil, fmt.Errorf("failed to parse JSON from '%s': %w", target, err)
	}
	return true, jsonData, nil
}

// Bulk reads multiple files from a target directory based on extensions.
func Read_Bulk(target string, extensions []string) (map[string]string, error) {
	result := make(map[string]string)
	var convertedExtensions []string
	for _, ext := range extensions {
		if !strings.HasPrefix(ext, ".") {
			convertedExtensions = append(convertedExtensions, "."+ext)
		} else {
			convertedExtensions = append(convertedExtensions, ext)
		}
	}

	files, err := Path_ListFiles(target, []string{})
	if err != nil {
		return nil, fmt.Errorf("failed to list files in '%s': %w", target, err)
	}

	for _, file := range files {
		if len(convertedExtensions) == 0 || helper_Contains(convertedExtensions, filepath.Ext(file)) {
			contentBytes, err := os.ReadFile(file)
			if err != nil {
				return nil, fmt.Errorf("failed to read file '%s' during bulk read: %w", file, err)
			}
			result[file] = string(contentBytes)
		}
	}
	return result, nil
}