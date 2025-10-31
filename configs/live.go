package configs

import (
	_model "main/models"
	"runtime"
)

var Saved *_model.Cache_Saved

func Saved_Reset() {
	Saved = &_model.Cache_Saved{
		RootCSS:           "",
		ProxyMap:          []_model.Config_ProxyMap{},
		Hashrule:          map[string]string{},
		Tweaks:            _model.Config_Tweaks{},
		Artifacts_Saved:   map[string]string{},
		Libraries_Saved:   map[string]string{},
		TargetDir_Saved:   map[string]_model.Config_ProxyStorage{},
		Artifacts_Sources: map[string]string{},
	}
}

var Archive *_model.Config_Archive

func Archive_Reset() {
	Archive = &_model.Config_Archive{
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

var Delta *_model.Cache_Delta

func Delta_Reset() {
	Delta = &_model.Cache_Delta{
		FinalMessage: "",
		PublishError: "",
		IndexBuild:   "",
		IndexAttach:  map[int]bool{},
		Errors:       []string{},
		Report: _model.Cache_Delta_Report{
			Artifacts: "",
			Axioms:    "",
			Clusters:  "",
			TargetDir: "",
			Constants: "",
			Hashrule:  "",
			Errors:    "",
			MemChart:  "",
		},
		Lookup: _model.Cache_Delta_Lookup{
			Artifacts: map[string]*_model.File_Lookup{},
			Libraries: map[string]*_model.File_Lookup{},
			TargetDir: map[string]*_model.File_Lookup{},
		},
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
			Artifacts: []*_model.File_Diagnostic{},
			Axioms:    []*_model.File_Diagnostic{},
			Clusters:  []*_model.File_Diagnostic{},
			TargetDir: []*_model.File_Diagnostic{},
			Multiples: []*_model.File_Diagnostic{},
			Hashrules: []*_model.File_Diagnostic{},
			Handoffs:  []*_model.File_Diagnostic{},
		},
	}
}

var Style *_model.Cache_Style

func Style_Reset() {
	Style = &_model.Cache_Style{
		Index_Now:           0,
		Index_Bin:           map[int]bool{},
		Hashrules:           map[string]string{},
		Global___Index:      _model.Style_ClassIndexMap{},
		Public___Index:      _model.Style_ClassIndexMap{},
		Library__Index:      _model.Style_ClassIndexMap{},
		Artifact_Index:      _model.Style_ClassIndexMap{},
		ClassDictionary:     _model.Style_Dictionary{},
		PublishIndexMap:     [][]_model.Style_ClassIndexTrace{},
		Index_to_Styledata:  map[int]*_model.Cache_SymclassData{},
		Filepath_to_Context: map[string]*_model.File_Stash{},
	}
}

var Manifest *_model.Cache_Manifest

func Manifest_Reset() {
	Manifest = &_model.Cache_Manifest{
		Constants:   map[string]string{},
		Diagnostics: []*_model.File_Diagnostic{},
		Lookup:      map[string]*_model.File_Lookup{},
		Group: _model.Cache_Manifest_Groups{
			Axiom:    map[string]_model.Style_ClassIndexMap{},
			Cluster:  map[string]_model.Style_ClassIndexMap{},
			Local:    map[string]_model.Style_ClassIndexMap{},
			Global:   map[string]_model.Style_ClassIndexMap{},
			Artifact: map[string]_model.Style_ClassIndexMap{},
		},
	}
}

func Reset(ReclaimMemory bool) {
	Saved_Reset()
	Archive_Reset()
	Delta_Reset()
	Style_Reset()
	Manifest_Reset()

	if ReclaimMemory {
		runtime.GC()
		Static.Watchman.Reset()
		Static.RebuildFlag.Store(false)
	}
}
