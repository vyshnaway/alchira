package action

import (
	_config "main/configs"
	_model "main/models"
	_fileman "main/package/fileman"
	_util "main/package/utils"
	_slice "slices"
	_strconv "strconv"
	_string "strings"
)

type store_FileGroup_param int

const (
	Store_FileGroup_Library store_FileGroup_param = iota
	Store_FileGroup_Artifact
	Store_FileGroup_Target
)

func Store(
	fileGroup store_FileGroup_param,
	filePath string,
	content string,
	target string,
	source string,
	label string,
) _model.File_Stash {
	isLibrary := fileGroup == Store_FileGroup_Library
	isArtifact := fileGroup == Store_FileGroup_Artifact
	fromXcaffold := fileGroup != Store_FileGroup_Target

	targetPath := _fileman.Path_Join(target, filePath)
	sourcePath := _fileman.Path_Join(source, filePath)

	parts := _string.Split(_fileman.Path_BaseName(filePath), ".")
	_slice.Reverse(parts)
	var extension, artifactName, liblevel, cluster string
	if len(parts) > 0 {
		extension = parts[0]
	}
	if len(parts) > 1 {
		artifactName = parts[1]
	}
	if len(parts) > 2 {
		liblevel = parts[2]
	}
	if len(parts) > 3 {
		cluster = parts[3]
	}

	idn := 0
	if num, err := _strconv.Atoi(liblevel); err == nil && num >= 0 && num <= 2 {
		idn = num
	}

	var norm_artifact string
	if isArtifact {
		norm_artifact = _util.String_Filter(artifactName, []rune{}, []rune{}, []rune{})
	} else {
		norm_artifact = _config.Archive.Name
	}

	var lookupType _model.File_Type
	if isArtifact {
		if extension == _config.Root.Extension {
			lookupType = _model.File_Type_Artifact
		} else {
			lookupType = _model.File_Type_Null
		}
	} else if isLibrary {
		if cluster != "" {
			lookupType = _model.File_Type_Cluster
		} else {
			lookupType = _model.File_Type_Axiom
		}
	} else {
		lookupType = _model.File_Type_Target
	}

	norm_cluster := _util.String_Filter(cluster, []rune{}, []rune{}, []rune{})
	classFront := ""

	if isArtifact {
		classFront += "/" + norm_artifact + "/"
	}
	if (idn > 0) && (extension == "css") && (norm_cluster != "-") {
		classFront += norm_cluster
	}
	if fromXcaffold && extension == "css" {
		classFront += _string.Repeat("$", idn)
	}

	debugClassfront := "\\|" + _util.String_Filter(targetPath, []rune{}, []rune{}, []rune{'/', '.'})
	if fromXcaffold {
		debugClassfront = string(lookupType) + debugClassfront
	}

	var lookupId string
	if isLibrary {
		lookupId = _strconv.Itoa(idn)
	} else if isArtifact {
		lookupId = filePath
	} else {
		lookupId = targetPath
	}

	result := _model.File_Stash{
		LibLevel:   idn,
		Label:      label,
		Artifact:   norm_artifact,
		FilePath:   filePath,
		Extension:  extension,
		SourcePath: sourcePath,
		TargetPath: targetPath,
		ClassFront: classFront,
		DebugFront: debugClassfront,
		Manifest: _model.File_LocalManifest{
			Lookup: _model.File_Lookup{
				Id:     lookupId,
				Type:   lookupType,
				Locale: []string{},
			},
			Local:       _model.File_SymclassIndexMap{},
			Global:      _model.File_SymclassIndexMap{},
			Public:      _model.File_SymclassIndexMap{},
			Errors:      []string{},
			Diagnostics: []_model.File_Diagnostic{},
		},
		StyleData: _model.File_StyleData{
			UsedIn:          []int{},
			Locales:         []string{},
			Attachments:     []string{},
			ClassTracks:     [][]string{},
			LocalClasses:    _model.Style_ClassIndexMap{},
			GlobalClasses:   _model.Style_ClassIndexMap{},
			PublicClasses:   _model.Style_ClassIndexMap{},
			TagReplacements: []_model.File_TagReplacement{},
		},
		Content: content,
		Midway:  "",
		Scratch: "",
	}

	return result
}
