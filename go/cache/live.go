package cache

import (
	_types_ "main/types"
)

var Static = _types_.Cache_Static{
	WATCH:             false,
	MINIFY:            false,
	ProjectName:       "",
	ProjectVersion:    "",
	Command:           "",
	Argument:          "",
	RootCSS:           "",
	RootPath:          "",
	WorkPath:          "",
	ProxyMap:          []_types_.Config_ProxyMap{},
	Hashrule:          map[string]string{},
	Tweaks:            _types_.Config_Tweaks{},
	Artifacts_Saved:   map[string]string{},
	Libraries_Saved:   map[string]string{},
	TargetDir_Saved:   map[string]_types_.Config_ProxyStorage{},
	Artifacts_Sources: map[string]string{},
}

var Archive = _types_.Config_Archive{
	Name:          "",
	Author:        "",
	Version:       "",
	Vendors:       "",
	Readme:        "",
	Environment:   "",
	Licence:       "",
	ExportSheet:   "",
	Versions:      []string{},
	Constants:     map[string]string{},
	ExportClasses: []string{},
}

func Archive_Reset() {
	Archive = _types_.Config_Archive{
		Name:          "",
		Author:        "",
		Version:       "",
		Vendors:       "",
		Readme:        "",
		Environment:   "",
		Licence:       "",
		ExportSheet:   "",
		Versions:      []string{},
		Constants:     map[string]string{},
		ExportClasses: []string{},
	}
}

var Delta = _types_.Cache_Delta{
	ErrorCount:   0,
	Path:         "",
	Content:      "",
	FinalMessage: "",
	PublishError: "",
	Report: _types_.Cache_Delta_Report{
		Artifacts: "",
		Axioms:    "",
		Clusters:  "",
		TargetDir: "",
		Constants: "",
		Hashrule:  "",
		Errors:    "",
		MemChart:  "",
		Footer:    "",
	},
	Lookup: _types_.Cache_Delta_Lookup{
		Artifacts: map[string]_types_.File_Lookup{},
		Libraries: map[string]_types_.File_Lookup{},
		TargetDir: map[string]_types_.File_Lookup{},
	},
	Errors: _types_.Cache_Delta_Errors{
		Artifacts: []string{},
		Axioms:    []string{},
		Clusters:  []string{},
		Multiples: []string{},
		TargetDir: []string{},
	},
	Diagnostics: _types_.Cache_Delta_Diagnostics{
		Artifacts: []_types_.Refer_Diagnostic{},
		Axioms:    []_types_.Refer_Diagnostic{},
		Clusters:  []_types_.Refer_Diagnostic{},
		TargetDir: []_types_.Refer_Diagnostic{},
		Multiples: []_types_.Refer_Diagnostic{},
	},
}

func Delta_Reset() {
	Delta = _types_.Cache_Delta{
		ErrorCount:   0,
		Path:         "",
		Content:      "",
		FinalMessage: "",
		PublishError: "",
		Report: _types_.Cache_Delta_Report{
			Artifacts: "",
			Axioms:    "",
			Clusters:  "",
			TargetDir: "",
			Constants: "",
			Hashrule:  "",
			Errors:    "",
			MemChart:  "",
			Footer:    "",
		},
		Lookup: _types_.Cache_Delta_Lookup{
			Artifacts: map[string]_types_.File_Lookup{},
			Libraries: map[string]_types_.File_Lookup{},
			TargetDir: map[string]_types_.File_Lookup{},
		},
		Errors: _types_.Cache_Delta_Errors{
			Artifacts: []string{},
			Axioms:    []string{},
			Clusters:  []string{},
			Multiples: []string{},
			TargetDir: []string{},
		},
		Diagnostics: _types_.Cache_Delta_Diagnostics{
			Artifacts: []_types_.Refer_Diagnostic{},
			Axioms:    []_types_.Refer_Diagnostic{},
			Clusters:  []_types_.Refer_Diagnostic{},
			TargetDir: []_types_.Refer_Diagnostic{},
			Multiples: []_types_.Refer_Diagnostic{},
		},
	}
}

var Style = _types_.Cache_Style{
	Hashrules:       map[string]string{},
	Index_to_Data:   map[int]_types_.Style_ClassData{},
	Global___Index:  _types_.Style_ClassIndexMap{},
	Public___Index:  _types_.Style_ClassIndexMap{},
	Library__Index:  _types_.Style_ClassIndexMap{},
	Artifact_Index:  _types_.Style_ClassIndexMap{},
	ClassDictionary: _types_.Style_Dictionary{},
	PublishIndexMap: []_types_.Style_ClassIndexTrace{},
}

func Style_Reset() {
	Style = _types_.Cache_Style{
		Hashrules:       map[string]string{},
		Index_to_Data:   map[int]_types_.Style_ClassData{},
		Global___Index:  _types_.Style_ClassIndexMap{},
		Public___Index:  _types_.Style_ClassIndexMap{},
		Library__Index:  _types_.Style_ClassIndexMap{},
		Artifact_Index:  _types_.Style_ClassIndexMap{},
		ClassDictionary: _types_.Style_Dictionary{},
		PublishIndexMap: []_types_.Style_ClassIndexTrace{},
	}
}

var Manifest = _types_.Cache_Manifest{
	Constants:   []string{},
	Hashrules:   map[string]string{},
	Diagnostics: []_types_.Refer_Diagnostic{},
	Lookup:      map[string]_types_.File_Lookup{},
	Axiom:       map[string]_types_.File_MetadataMap{},
	Cluster:     map[string]_types_.File_MetadataMap{},
	Local:       map[string]_types_.File_MetadataMap{},
	Global:      map[string]_types_.File_MetadataMap{},
	Artifact:    map[string]_types_.File_MetadataMap{},
}

func Manifest_Reset() {
	Manifest = _types_.Cache_Manifest{
		Constants:   []string{},
		Hashrules:   map[string]string{},
		Diagnostics: []_types_.Refer_Diagnostic{},
		Lookup:      map[string]_types_.File_Lookup{},
		Axiom:       map[string]_types_.File_MetadataMap{},
		Cluster:     map[string]_types_.File_MetadataMap{},
		Local:       map[string]_types_.File_MetadataMap{},
		Global:      map[string]_types_.File_MetadataMap{},
		Artifact:    map[string]_types_.File_MetadataMap{},
	}
}
