package configs

import (
	_model "main/models"
)

var Static = _model.Cache_Static{
	WATCH:             false,
	MINIFY:            false,
	ProjectName:       "",
	ProjectVersion:    "",
	Command:           "",
	Argument:          "",
	RootCSS:           "",
	RootPath:          "",
	WorkPath:          "",
	ProxyMap:          []_model.Config_ProxyMap{},
	Hashrule:          map[string]string{},
	Tweaks:            _model.Config_Tweaks{},
	Artifacts_Saved:   map[string]string{},
	Libraries_Saved:   map[string]string{},
	TargetDir_Saved:   map[string]_model.Config_ProxyStorage{},
	Artifacts_Sources: map[string]string{},
}

var Archive = _model.Config_Archive{
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
	Archive = _model.Config_Archive{
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

var Delta = _model.Cache_Delta{
	ErrorCount:   0,
	Path:         "",
	Content:      "",
	FinalMessage: "",
	PublishError: "",
	Report: _model.Cache_Delta_Report{
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
	Lookup: _model.Cache_Delta_Lookup{
		Artifacts: map[string]_model.File_Lookup{},
		Libraries: map[string]_model.File_Lookup{},
		TargetDir: map[string]_model.File_Lookup{},
	},
	Errors: _model.Cache_Delta_Errors{
		Artifacts: []string{},
		Axioms:    []string{},
		Clusters:  []string{},
		Multiples: []string{},
		TargetDir: []string{},
	},
	Diagnostics: _model.Cache_Delta_Diagnostics{
		Artifacts: []_model.Refer_Diagnostic{},
		Axioms:    []_model.Refer_Diagnostic{},
		Clusters:  []_model.Refer_Diagnostic{},
		TargetDir: []_model.Refer_Diagnostic{},
		Multiples: []_model.Refer_Diagnostic{},
	},
}

func Delta_Reset() {
	Delta = _model.Cache_Delta{
		ErrorCount:   0,
		Path:         "",
		Content:      "",
		FinalMessage: "",
		PublishError: "",
		Report: _model.Cache_Delta_Report{
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
		Lookup: _model.Cache_Delta_Lookup{
			Artifacts: map[string]_model.File_Lookup{},
			Libraries: map[string]_model.File_Lookup{},
			TargetDir: map[string]_model.File_Lookup{},
		},
		Errors: _model.Cache_Delta_Errors{
			Artifacts: []string{},
			Axioms:    []string{},
			Clusters:  []string{},
			Multiples: []string{},
			TargetDir: []string{},
		},
		Diagnostics: _model.Cache_Delta_Diagnostics{
			Artifacts: []_model.Refer_Diagnostic{},
			Axioms:    []_model.Refer_Diagnostic{},
			Clusters:  []_model.Refer_Diagnostic{},
			TargetDir: []_model.Refer_Diagnostic{},
			Multiples: []_model.Refer_Diagnostic{},
		},
	}
}

var Style = _model.Cache_Style{
	Hashrules:       map[string]string{},
	Index_to_Data:   map[int]_model.Style_ClassData{},
	Global___Index:  _model.Style_ClassIndexMap{},
	Public___Index:  _model.Style_ClassIndexMap{},
	Library__Index:  _model.Style_ClassIndexMap{},
	Artifact_Index:  _model.Style_ClassIndexMap{},
	ClassDictionary: _model.Style_Dictionary{},
	PublishIndexMap: []_model.Style_ClassIndexTrace{},
}

func Style_Reset() {
	Style = _model.Cache_Style{
		Hashrules:       map[string]string{},
		Index_to_Data:   map[int]_model.Style_ClassData{},
		Global___Index:  _model.Style_ClassIndexMap{},
		Public___Index:  _model.Style_ClassIndexMap{},
		Library__Index:  _model.Style_ClassIndexMap{},
		Artifact_Index:  _model.Style_ClassIndexMap{},
		ClassDictionary: _model.Style_Dictionary{},
		PublishIndexMap: []_model.Style_ClassIndexTrace{},
	}
}

var Manifest = _model.Cache_Manifest{
	Constants:   []string{},
	Hashrules:   map[string]string{},
	Diagnostics: []_model.Refer_Diagnostic{},
	Lookup:      map[string]_model.File_Lookup{},
	Axiom:       map[string]_model.File_MetadataMap{},
	Cluster:     map[string]_model.File_MetadataMap{},
	Local:       map[string]_model.File_MetadataMap{},
	Global:      map[string]_model.File_MetadataMap{},
	Artifact:    map[string]_model.File_MetadataMap{},
}

func Manifest_Reset() {
	Manifest = _model.Cache_Manifest{
		Constants:   []string{},
		Hashrules:   map[string]string{},
		Diagnostics: []_model.Refer_Diagnostic{},
		Lookup:      map[string]_model.File_Lookup{},
		Axiom:       map[string]_model.File_MetadataMap{},
		Cluster:     map[string]_model.File_MetadataMap{},
		Local:       map[string]_model.File_MetadataMap{},
		Global:      map[string]_model.File_MetadataMap{},
		Artifact:    map[string]_model.File_MetadataMap{},
	}
}
