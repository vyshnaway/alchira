package configs

import (
	_model "main/models"
	"maps"
	"slices"
)

var Static = _model.Cache_Static{
	WATCH:             false,
	DEBUG:             false,
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
	CustomTags:        slices.Collect(maps.Keys(Root.CustomTags)),
}

var Archive = _model.Config_Archive{
	Name:          "",
	Author:        "",
	Version:       "",
	Vendors:       "",
	Readme:        "",
	Changelog:     "",
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
	Path:         "",
	Content:      "",
	FinalMessage: "",
	PublishError: "",
	IndexBuild:   "",
	IndexAttach:  []int{},
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
	Errors: []string{},
	Error: _model.Cache_Delta_Errors{
		Artifacts: []string{},
		Axioms:    []string{},
		Clusters:  []string{},
		Multiples: []string{},
		TargetDir: []string{},
		Hashrules: []string{},
		Handoffs:  []string{},
	},

	Diagnostic: _model.Cache_Delta_Diagnostics{
		Artifacts: []_model.File_Diagnostic{},
		Axioms:    []_model.File_Diagnostic{},
		Clusters:  []_model.File_Diagnostic{},
		TargetDir: []_model.File_Diagnostic{},
		Multiples: []_model.File_Diagnostic{},
		Hashrules: []_model.File_Diagnostic{},
		Handoffs:  []_model.File_Diagnostic{},
	},
}

func Delta_Reset() {
	Delta = _model.Cache_Delta{
		Path:         "",
		Content:      "",
		FinalMessage: "",
		PublishError: "",
		IndexBuild:   "",
		IndexAttach:  []int{},
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
		Errors: []string{},
		Error: _model.Cache_Delta_Errors{
			Artifacts: []string{},
			Axioms:    []string{},
			Clusters:  []string{},
			Multiples: []string{},
			TargetDir: []string{},
			Hashrules: []string{},
			Handoffs:  []string{},
		},
		Diagnostic: _model.Cache_Delta_Diagnostics{
			Artifacts: []_model.File_Diagnostic{},
			Axioms:    []_model.File_Diagnostic{},
			Clusters:  []_model.File_Diagnostic{},
			TargetDir: []_model.File_Diagnostic{},
			Multiples: []_model.File_Diagnostic{},
			Hashrules: []_model.File_Diagnostic{},
			Handoffs:  []_model.File_Diagnostic{},
		},
	}
}

var Style = _model.Cache_Style{
	Hashrules:       map[string]string{},
	Index_to_Data:   map[int]*_model.Style_ClassData{},
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
		Index_to_Data:   map[int]*_model.Style_ClassData{},
		Global___Index:  _model.Style_ClassIndexMap{},
		Public___Index:  _model.Style_ClassIndexMap{},
		Library__Index:  _model.Style_ClassIndexMap{},
		Artifact_Index:  _model.Style_ClassIndexMap{},
		ClassDictionary: _model.Style_Dictionary{},
		PublishIndexMap: []_model.Style_ClassIndexTrace{},
	}
}

var Manifest = _model.Cache_Manifest{
	Constants:   map[string]string{},
	Diagnostics: []_model.File_Diagnostic{},
	Lookup:      map[string]_model.File_Lookup{},
	Group: _model.Cache_Manifest_Groups{
		Axiom:    map[string]_model.File_SymclassIndexMap{},
		Cluster:  map[string]_model.File_SymclassIndexMap{},
		Local:    map[string]_model.File_SymclassIndexMap{},
		Global:   map[string]_model.File_SymclassIndexMap{},
		Artifact: map[string]_model.File_SymclassIndexMap{},
	},
}

func Manifest_Reset() {
	Manifest = _model.Cache_Manifest{
		Constants:   map[string]string{},
		Diagnostics: []_model.File_Diagnostic{},
		Lookup:      map[string]_model.File_Lookup{},
		Group: _model.Cache_Manifest_Groups{
			Axiom:    map[string]_model.File_SymclassIndexMap{},
			Cluster:  map[string]_model.File_SymclassIndexMap{},
			Local:    map[string]_model.File_SymclassIndexMap{},
			Global:   map[string]_model.File_SymclassIndexMap{},
			Artifact: map[string]_model.File_SymclassIndexMap{},
		},
	}
}
