package fileman

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// File writes content to a file, creating directories if needed.
func Write_File(filePath string, content string) error {
	dir := filepath.Dir(filePath)
	if !Path_IfFolder(dir) {
		if err := os.MkdirAll(dir, 0755); err != nil { // 0755 permissions
			return fmt.Errorf("failed to create directory '%s': %w", dir, err)
		}
	}
	err := os.WriteFile(filePath, []byte(content), 0644) // 0644 permissions
	if err != nil {
		return fmt.Errorf("error writing to file '%s': %w", filePath, err)
	}
	return nil
}

// Json writes a JSON object to a file, pretty-printing it.
func Write_Json(pathString string, object map[string]interface{}) error {
	dir := filepath.Dir(pathString)
	if !Path_IfFolder(dir) {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return fmt.Errorf("failed to create directory '%s': %w", dir, err)
		}
	}
	jsonData, err := json.MarshalIndent(object, "", "  ") // Pretty print with 2 spaces
	if err != nil {
		return fmt.Errorf("failed to marshal JSON object: %w", err)
	}
	err = os.WriteFile(pathString, jsonData, 0644)
	if err != nil {
		return fmt.Errorf("error writing JSON data to '%s': %w", pathString, err)
	}
	return nil
}

// Bulk writes multiple files from a map of file paths to content.
func Write_Bulk(fileContentObject map[string]string) error {
	for filePath, content := range fileContentObject {
		if err := Write_File(filePath, content); err != nil {
			return err // Propagate the first error encountered
		}
	}
	return nil
}