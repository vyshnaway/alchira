package css

import (
	_fileman "main/package/fileman"
	_reader "main/package/reader"
	_util "main/package/utils"
	_filepath "path/filepath"
	_string "strings"
)

func getImportPath(str, rel string) string {
	var result _string.Builder
	quotes := []rune{'\'', '`', '"'}

	inQuote := false
	activeQuote := rune(0)

	for _, ch := range str {
		if inQuote {
			if ch == activeQuote {
				inQuote = false
			} else {
				result.WriteRune(ch)
			}
		} else {
			for _, q := range quotes {
				if ch == q {
					inQuote = true
					activeQuote = q
					break
				}
			}
		}
	}

	return _filepath.Join(_filepath.Dir(rel), _filepath.Clean(result.String()))
}

func read_File(currentpath string, ignorepaths map[string]bool) string {
	ignorepaths[currentpath] = true
	content := ""
	if r, e := _fileman.Read_File(currentpath, false); e == nil {
		content = r
	}
	var builder _string.Builder
	importsnippet := ""
	cursor := _reader.New(_util.Code_Uncomment(content, false, true, false))
	for ch, streaming := cursor.Active.Char, cursor.Streaming; streaming; ch, streaming = cursor.Increment() {

		if len(importsnippet) > 0 {
			importsnippet += string(ch)
			if _string.HasPrefix("@import", importsnippet) || _string.HasPrefix(importsnippet, "@import") {
				if ch == ';' {
					importingpath := getImportPath(importsnippet, currentpath)
					if !ignorepaths[importingpath] {
						builder.WriteString(read_File(importingpath, ignorepaths))
					}
					importsnippet = ""
				}
				continue
			}

			builder.WriteString(importsnippet)
			importsnippet = ""
			continue

		}
		if ch == '@' {
			importsnippet = "@"
		} else {
			builder.WriteRune(ch)
		}
	}
	result := builder.String()
	return result
}

func Read_Files(filepath_array []string) string {
	reading := []string{}

	resolved_files := make(map[string]bool)
	resolved_array := make([]string, len(filepath_array))

	for _, filepath := range filepath_array {
		if abspath, err := _fileman.Path_Resolves(filepath); err == nil && _fileman.Path_IfFile(abspath) {
			resolved_files[abspath] = true
			resolved_array = append(resolved_array, abspath)
		}
	}

	for _, filePath := range resolved_array {
		reading = append(reading, read_File(filePath, resolved_files))
	}

	return _string.Join(reading, "\n")
}
