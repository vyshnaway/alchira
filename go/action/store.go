package action

import (
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	_types_ "main/types"
	_utils_ "main/utils"
	_slices_ "slices"
	_strconv_ "strconv"
	_strings_ "strings"
)

type store_FileGroup_param int

const (
	Store_FileGroup_Library  store_FileGroup_param = 1
	Store_FileGroup_Artifact store_FileGroup_param = 2
	Store_FileGroup_Target   store_FileGroup_param = 3
)

func Store(
	fileGroup store_FileGroup_param,
	filePath string,
	content string,
	target string,
	source string,
	label string,
) _types_.File_Stash {
	isLibrary := fileGroup == Store_FileGroup_Library
	isArtifact := fileGroup == Store_FileGroup_Artifact
	fromXtylesFolder := fileGroup == Store_FileGroup_Target

	targetPath := _fileman_.Path_Join(target, filePath)
	sourcePath := _fileman_.Path_Join(source, filePath)

	parts := _strings_.Split(_fileman_.Path_BaseName(filePath), ".")
	_slices_.Reverse(parts)
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

	liblevel_int, liblevel_err := _strconv_.Atoi(liblevel)
	idn := 0
	if liblevel_err != nil && liblevel_int >= 0 && liblevel_int <= 2 {
		idn = liblevel_int
	}

	var normalFileName string
	if isArtifact {
		normalFileName = _utils_.String_Filter(artifactName, []rune{}, []rune{}, []rune{})
	} else {
		normalFileName = _cache_.Archive.Name
	}

	var lookupType _types_.File_Type
	if isArtifact {
		if extension == _cache_.Root.Extension {
			lookupType = _types_.File_Type_Artifact
		} else {
			lookupType = _types_.File_Type_Null
		}
	} else if isLibrary {
		if cluster != "" {
			lookupType = _types_.File_Type_Cluster
		} else {
			lookupType = _types_.File_Type_Axiom
		}
	} else {
		lookupType = _types_.File_Type_Target
	}

	normalCluster := _utils_.String_Filter(cluster, []rune{}, []rune{}, []rune{})
	classFront := ""

	if isArtifact {
		classFront += "/" + normalFileName + "/"
	}
	if (idn > 0) && (extension == "css") && (normalCluster != "-") {
		classFront += normalCluster
	}
	if fromXtylesFolder && extension == "css" {
		classFront += _strings_.Repeat("$", idn)
	}

	var artifact string
	if fromXtylesFolder {
		artifact = artifactName
	} else {
		artifact = _cache_.Archive.Name
	}

	debugClassfront := "\\|" + _utils_.String_Filter(targetPath, []rune{}, []rune{}, []rune{'/', '.'})
	if fromXtylesFolder {
		debugClassfront = string(lookupType) + debugClassfront
	}

	var lookupId string
	if isLibrary {
		lookupId = _strconv_.Itoa(idn)
	} else if isArtifact {
		lookupId = filePath
	} else {
		lookupId = targetPath
	}

	result := _types_.File_Stash{
		LibLevel:   idn,
		Label:      label,
		Artifact:   artifact,
		FilePath:   filePath,
		Extension:  extension,
		SourcePath: sourcePath,
		TargetPath: targetPath,
		ClassFront: classFront,
		DebugFront: debugClassfront,
		Manifest: _types_.File_LocalManifest{
			Lookup: _types_.File_Lookup{
				Id:     lookupId,
				Type:   lookupType,
				Locale: []string{},
			},
			Local:       _types_.File_MetadataMap{},
			Global:      _types_.File_MetadataMap{},
			Public:      _types_.File_MetadataMap{},
			Errors:      []string{},
			Diagnostics: []_types_.Refer_Diagnostic{},
		},
		StyleData: _types_.File_StyleData{
			UsedIn:          []int{},
			Locales:         []string{},
			Attachments:     []string{},
			ClassTracks:     [][]string{},
			LocalClasses:    _types_.Style_ClassIndexMap{},
			GlobalClasses:   _types_.Style_ClassIndexMap{},
			PublicClasses:   _types_.Style_ClassIndexMap{},
			TagReplacements: []_types_.File_TagReplacement{},
		},
		Content: content,
		Midway:  "",
		Scratch: "",
	}

	return result
}
