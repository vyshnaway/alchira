package cache

import (
	_types_ "main/types"
)

var Static = _types_.Cache_Static{
	WATCH:           false,
	DEBUG:           false,
	ProjectName:     "",
	ProjectVersion:  "",
	Command:         "",
	Argument:        "",
	RootCSS:         "",
	RootPath:        "",
	WorkPath:        "",
	Vendors:         []string{},
	ProxyMap:        []_types_.Config_ProxyMap{},
	Hashrule:        map[string]string{},
	Tweaks:          _types_.Config_Tweaks{},
	Artifacts_Saved: map[string]string{},
	Libraries_Saved: map[string]string{},
	Targetdir_Saved: map[string]_types_.Config_ProxyStorage{},
	Archive: _types_.Config_Archive{
		Name:          "",
		Version:       "",
		Vendors:       "",
		Readme:        "",
		Licence:       "",
		ExportSheet:   "",
		Artifacts:     map[string]string{},
		ProxyMap:      []_types_.Config_ProxyMap{},
		ExportClasses: []string{},
	},
}

var Delta = _types_.Cache_Delta{
	ErrorCount:   0,
	DeltaPath:    "",
	DeltaContent: "",
	FinalMessage: "",
	PublishError: "",
	Report: _types_.Cache_Delta_Report{
		Artifacts: "",
		Libraries: "",
		Archives:  "",
		Constants: "",
		Hashrule:  "",
		Errors:    "",
		MemChart:  "",
		Footer:    "",
	},
	Lookup: _types_.Cache_Delta_Lookup{
		Libraries: map[string]_types_.File_Lookup{},
		Artifacts: map[string]_types_.File_Lookup{},
		Archives:  map[string]_types_.File_Lookup{},
	},
	Errors: _types_.Cache_Delta_Errors{
		Archives:  []string{},
		Libraries: []string{},
		Artifacts: []string{},
		Multiples: []string{},
	},
	Diagnostics: _types_.Cache_Delta_Diagnostics{
		Archives:  []_types_.Support_Diagnostic{},
		Libraries: []_types_.Support_Diagnostic{},
		Artifacts: []_types_.Support_Diagnostic{},
		Multiples: []_types_.Support_Diagnostic{},
	},
}

var Manifest = _types_.Cache_Manifest{
	Constants:  []string{},
	Hashrule:   map[string]string{},
	Filelookup: map[string]_types_.File_Lookup{},
	AXIOM:      map[string]_types_.File_ClassMetaMap{},
	CLUSTER:    map[string]_types_.File_ClassMetaMap{},
	LOCAL:      map[string]_types_.File_ClassMetaMap{},
	GLOBAL:     map[string]_types_.File_ClassMetaMap{},
	ARTIFACT:   map[string]_types_.File_ClassMetaMap{},
	Errors:     []_types_.Support_Diagnostic{},
}

var Class = _types_.Cache_Class{
	Hashrule:        map[string]string{},
	Index_to_Data:   map[int]_types_.Style_ClassData{},
	Global___Index:  _types_.Style_ClassIndexMap{},
	Public___Index:  _types_.Style_ClassIndexMap{},
	Library__Index:  _types_.Style_ClassIndexMap{},
	Artifact_Index:  _types_.Style_ClassIndexMap{},
	ClassDictionary: _types_.Style_Dictionary{},
	PublishIndexMap: []_types_.Style_ClassIndexTrace{},
}

var Files = _types_.Cache_Files{
	LIBRARIES: map[string]_types_.File_Storage{},
	ARTIFACTS: map[string]_types_.File_Storage{},
	TARGETDIR: map[string]_types_.Script_Target{},
}
