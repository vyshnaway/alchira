package fileman

import (
	_fmt_ "fmt"
	_os_ "os"
	_filepath_ "path/filepath"
	_strings_ "strings"
)

// File synchronizes a file from a URL or local path.
func Sync_File(url, path string) (string, error) {
	latestData, err := Read_File(url, true)
	if err == nil {
		if writeErr := Write_File(path, latestData); writeErr != nil {
			return "", _fmt_.Errorf("failed to write latest data to '%s': %w", path, writeErr)
		}
		return latestData, nil
	}
	// If online fetch fails, try reading local file
	currentData, err := Read_File(path, false)
	if err == nil {
		return currentData, nil
	}
	return "", _fmt_.Errorf("failed to sync file from URL '%s' and local path '%s': %w", url, path, err)
}

// Json synchronizes a JSON file from a URL or local path.
func Sync_Json(url, path string) (map[string]interface{}, error) {
	latestData, err := Read_Json(url, true)
	if err == nil {
		if writeErr := Write_Json(path, latestData); writeErr != nil {
			return nil, _fmt_.Errorf("failed to write latest JSON data to '%s': %w", path, writeErr)
		}
		return latestData, nil
	}
	// If online fetch fails, try reading local file
	currentData, err := Read_Json(path, false)
	if err == nil {
		return currentData, nil
	}
	return nil, _fmt_.Errorf("failed to sync JSON from URL '%s' and local path '%s': %w", url, path, err)
}

// Bulk synchronizes two directories, handling inclusions, exclusions, and unsynced extensions.
func Sync_Bulk(source, target string, extInclude, extnUnsync, fileExcludes []string) (map[string]string, error) {
	resultFileContents := make(map[string]string)

	// Normalize extensions to include leading dot
	normalizeExts := func(exts []string) []string {
		var normalized []string
		for _, ext := range exts {
			if !_strings_.HasPrefix(ext, ".") {
				normalized = append(normalized, "."+ext)
			} else {
				normalized = append(normalized, ext)
			}
		}
		return normalized
	}
	extInclude = normalizeExts(extInclude)
	extnUnsync = normalizeExts(extnUnsync)

	sourceExists := Path_IfDir(source)
	targetExists := Path_IfDir(target)

	// Initial synchronization to ensure both directories exist and have basic content
	if !sourceExists && !targetExists {
		return nil, _fmt_.Errorf("neither source '%s' nor target '%s' directories exist", source, target)
	}
	if !targetExists && sourceExists {
		if err := Clone_Safe(source, target, []string{}); err != nil {
			return nil, _fmt_.Errorf("failed to safely clone source to target when target did not exist: %w", err)
		}
	}
	if !sourceExists && targetExists {
		if err := Clone_Safe(target, source, []string{}); err != nil { // Note: original code clones target to source here
			return nil, _fmt_.Errorf("failed to safely clone target to source when source did not exist: %w", err)
		}
	}

	// List files and filter by exclusions
	targetFiles, err := Path_ListFiles(target, []string{})
	if err != nil {
		return nil, _fmt_.Errorf("failed to list target files: %w", err)
	}
	relativeTargetFiles := make([]string, 0, len(targetFiles))
	for _, file := range targetFiles {
		relPath, err := _filepath_.Rel(target, file)
		if err != nil {
			return nil, _fmt_.Errorf("failed to get relative path for target file '%s': %w", file, err)
		}
		if !helper_IsExcluded(relPath, fileExcludes) {
			relativeTargetFiles = append(relativeTargetFiles, relPath)
		}
	}

	sourceFiles, err := Path_ListFiles(source, []string{})
	if err != nil {
		return nil, _fmt_.Errorf("failed to list source files: %w", err)
	}
	relativeSourceFiles := make([]string, 0, len(sourceFiles))
	for _, file := range sourceFiles {
		relPath, err := _filepath_.Rel(source, file)
		if err != nil {
			return nil, _fmt_.Errorf("failed to get relative path for source file '%s': %w", file, err)
		}
		if !helper_IsExcluded(relPath, fileExcludes) {
			relativeSourceFiles = append(relativeSourceFiles, relPath)
		}
	}

	// Delete files in target that are not in source or are marked as unsyncable
	for _, relFile := range relativeTargetFiles {
		targetFilePath := _filepath_.Join(target, relFile)

		// Check if file exists in source
		sourceFileExists := false
		for _, sf := range relativeSourceFiles {
			if sf == relFile {
				sourceFileExists = true
				break
			}
		}

		// Check if extension is in unsync list
		isUnsyncable := helper_Contains(extnUnsync, _filepath_.Ext(relFile))

		if !sourceFileExists || isUnsyncable {
			if err := _os_.Remove(targetFilePath); err != nil && !_os_.IsNotExist(err) {
				return nil, _fmt_.Errorf("failed to delete target file '%s': %w", targetFilePath, err)
			}
		}
	}

	// Copy files from source to target and read contents for included extensions
	for _, relFile := range relativeSourceFiles {
		sourceFilePath := _filepath_.Join(source, relFile)
		targetFilePath := _filepath_.Join(target, relFile)

		// Ensure parent directory exists in target
		targetDir := _filepath_.Dir(targetFilePath)
		if !Path_IfDir(targetDir) {
			if err := _os_.MkdirAll(targetDir, 0755); err != nil {
				return nil, _fmt_.Errorf("failed to create target directory '%s': %w", targetDir, err)
			}
		}

		if helper_Contains(extInclude, _filepath_.Ext(relFile)) {
			contentBytes, err := _os_.ReadFile(sourceFilePath)
			if err != nil {
				return nil, _fmt_.Errorf("failed to read source file '%s' for inclusion: %w", sourceFilePath, err)
			}
			resultFileContents[relFile] = string(contentBytes)
		} else {
			// Copy file if not in extInclude (and not deleted in previous step)
			if err := helper_CopyFile(sourceFilePath, targetFilePath); err != nil {
				return nil, _fmt_.Errorf("failed to copy file from '%s' to '%s': %w", sourceFilePath, targetFilePath, err)
			}
		}
	}

	// Delete empty folders in target that no longer have corresponding source folders
	targetFolders, err := Path_ListFolders(target, []string{})
	if err != nil {
		return nil, _fmt_.Errorf("failed to list target folders: %w", err)
	}
	sourceFolders, err := Path_ListFolders(source, []string{})
	if err != nil {
		return nil, _fmt_.Errorf("failed to list source folders: %w", err)
	}

	for _, targetFolder := range targetFolders {
		relFolder, err := _filepath_.Rel(target, targetFolder)
		if err != nil {
			return nil, _fmt_.Errorf("failed to get relative path for target folder '%s': %w", targetFolder, err)
		}
		sourceFolderPath := _filepath_.Join(source, relFolder)

		// Check if the corresponding source folder exists
		sourceFolderExists := false
		for _, sf := range sourceFolders {
			if sf == sourceFolderPath {
				sourceFolderExists = true
				break
			}
		}

		// If target folder is empty and no corresponding source folder, remove it
		// (Note: This logic is simplified from Node.js version which checks if sourceFolderPath exists based on target path)
		// A more robust solution would involve checking if the target folder became empty after file deletions.
		// For simplicity, we'll remove if source equivalent doesn't exist AND target folder is empty.
		isEmpty, _ := helper_IsDirEmpty(targetFolder) // Ignore error, assume not empty if error
		if !sourceFolderExists && isEmpty {
			if err := _os_.RemoveAll(targetFolder); err != nil && !_os_.IsNotExist(err) {
				return nil, _fmt_.Errorf("failed to remove empty target folder '%s': %w", targetFolder, err)
			}
		}
	}

	return resultFileContents, nil
}
