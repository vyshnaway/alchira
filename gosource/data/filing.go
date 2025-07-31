package data

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"main/utils"
)
utils.
// --- Start of Re-implemented Utility Functions (from previous conversions) ---

// normalize processes a string by replacing spaces, handling specific characters,
// and ensuring only alphanumeric or allowed characters remain.
// This is a simplified version mirroring the behavior needed for FILING.
func normalize(s string, keepChars, skipChars, addBackSlashFor []rune) string {
	if s == "" {
		return ""
	}

	// Replace spaces with underscores
	s = regexp.MustCompile(`\s+`).ReplaceAllString(s, "_")

	var final strings.Builder
	for _, ch := range s {
		skip := false
		for _, sc := range skipChars {
			if ch == sc {
				skip = true
				break
			}
		}
		if skip {
			continue
		}

		addBackslash := false
		for _, bc := range addBackSlashFor {
			if ch == bc {
				addBackslash = true
				break
			}
		}
		if addBackslash {
			final.WriteRune('\\')
			final.WriteRune(ch)
		} else {
			if ch == '_' {
				final.WriteRune('_')
			} else if (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') {
				final.WriteRune(ch)
			} else {
				// Check if char is in keepChars
				keep := false
				for _, kc := range keepChars {
					if ch == kc {
						keep = true
						break
					}
				}
				if keep {
					final.WriteRune(ch)
				} else {
					final.WriteRune('-') // Default replacement for non-alphanumeric/non-kept chars
				}
			}
		}
	}
	return final.String()
}

// stripCssComments removes CSS multi-line comments and normalizes newlines.
func stripCssComments(content string) string {
	// Strip CSS comments /* */
	reComments := regexp.MustCompile(`/\*[\s\S]*?\*/`)
	content = reComments.ReplaceAllString(content, "")

	// Normalize newlines
	reCRLF := regexp.MustCompile(`(\s*\r\n)+`)
	content = reCRLF.ReplaceAllString(content, "\n")
	reLF := regexp.MustCompile(`(\s*\n)+`)
	content = reLF.ReplaceAllString(content, "\n")

	return strings.TrimSpace(content)
}

// --- End of Re-implemented Utility Functions ---

// FILING processes file paths and content to extract and categorize metadata.
func FILING(
	target string,
	source string,
	filePath string,
	content string,
	isXtylesFolder bool,
	isPortable bool,
) T_FilingResult {
	targetPath := filePath
	if target != "" {
		targetPath = target + "/" + filePath
	}

	sourcePath := filePath
	if source != "" {
		sourcePath = source + "/" + filePath
	}

	// Extract extension, fileName, id, cluster from targetPath
	lastSlashIndex := strings.LastIndex(targetPath, "/")
	baseName := targetPath
	if lastSlashIndex != -1 {
		baseName = targetPath[lastSlashIndex+1:]
	}

	parts := strings.Split(baseName, ".")
	var extension, fileName, cluster string
	id := 0

	// Handle different part counts (e.g., file.ext, file.id.ext, file.cluster.id.ext)
	if len(parts) >= 2 {
		extension = parts[len(parts)-1] // Last part is extension
		if len(parts) >= 3 {
			// Check if the second to last part is a number (id)
			parsedID, err := strconv.Atoi(parts[len(parts)-2])
			if err == nil {
				id = parsedID
				if len(parts) >= 4 {
					cluster = parts[len(parts)-3]
					fileName = strings.Join(parts[0:len(parts)-3], ".")
				} else {
					fileName = strings.Join(parts[0:len(parts)-2], ".")
				}
			} else { // Second to last part is not an ID, assume it's cluster
				cluster = parts[len(parts)-2]
				fileName = strings.Join(parts[0:len(parts)-2], ".")
			}
		} else {
			fileName = strings.Join(parts[0:len(parts)-1], ".")
		}
	} else {
		fileName = baseName // No extension, treat whole thing as filename
	}

	if id < 0 {
		id = 0
	}

	fileName = normalize(fileName, []rune{}, []rune{}, []rune{}) // Normalize filename

	// Determine group
	group := ""
	if isPortable {
		if extension == "css" {
			group = "binding"
		} else if extension == "xcss" {
			group = "xtyling"
		} else {
			group = "readme"
		}
	} else if isXtylesFolder {
		if cluster != "" { // Boolean(cluster)
			group = "cluster"
		} else {
			group = "axiom"
		}
	} else {
		group = "proxy"
	}

	// Determine stamp
	stamp := ""
	if isPortable {
		stamp = fmt.Sprintf("/%s/", fileName)
		if group == "binding" {
			stamp = fmt.Sprintf("/%s/$/", fileName)
		}
	}
	if !(id == 0 && extension == "css") {
		normalizedCluster := normalize(cluster, []rune{}, []rune{}, []rune{})
		stamp += normalizedCluster + strings.Repeat("$", id)
	}

	// Determine metaFront
	metaFrontPrefix := ""
	if isXtylesFolder {
		metaFrontPrefix = strings.ToUpper(group) + "|"
	}
	normalizedTargetPath := normalize(targetPath, []rune{}, []rune{'/', '.'}, []rune{})
	metaFront := metaFrontPrefix + normalizedTargetPath

	// Process content
	processedContent := content
	if isXtylesFolder && extension == "css" {
		processedContent = stripCssComments(content)
	}

	return T_FilingResult{
		ID:               id,
		Group:            group,
		Stamp:            stamp,
		Cluster:          cluster,
		FilePath:         filePath,
		FileName:         fileName,
		Extension:        extension,
		SourcePath:       sourcePath,
		TargetPath:       targetPath,
		MetaFront:        metaFront,
		Content:          processedContent,
		UsedIndexes:      make(map[int]struct{}), // Initialize as empty set
		Essentials:       []interface{}{},
		StyleGlobals:     make(map[string]interface{}),
		StyleLocals:      make(map[string]interface{}),
		StyleMap:         make(map[string]interface{}),
		ClassGroups:      []interface{}{},
		PostBinds:        []interface{}{},
		PreBinds:         []interface{}{},
		Errors:           []string{},
		Summon:           false,
		HasStyleTag:      false,
		HasStylesheetTag: false,
		HasSnippetTag:    false,
		Midway:           "",
	}
}
