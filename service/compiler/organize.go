package compiler

import (
	_config "main/configs"
	K "main/internal/console"
	_order_ "main/internal/order"
	_stash "main/internal/stash"
	_model "main/models"
	C "main/package/console"
	_util "main/package/utils"
	_map "maps"
	_strconv "strconv"
)

func Accumulate() {
	accumulated := _stash.Target_Accumulate()

	_config.Style.Global___Index = accumulated.GlobalClasses
	_config.Style.Public___Index = accumulated.PublicClasses
	_config.Delta.Report.TargetDir = accumulated.Report

	_config.Manifest.Group.Local = map[string]_model.File_SymclassIndexMap{}
	_config.Manifest.Group.Global = map[string]_model.File_SymclassIndexMap{}

	_config.Delta.Error.TargetDir = []string{}
	_config.Delta.Lookup.TargetDir = map[string]_model.File_Lookup{}
	_config.Delta.Diagnostic.TargetDir = []_model.File_Diagnostic{}

	for key, val := range accumulated.FileManifests {
		_config.Manifest.Group.Local[key] = val.Local
		_config.Delta.Lookup.TargetDir[key] = val.Lookup
		_config.Delta.Error.TargetDir = append(_config.Delta.Error.TargetDir, val.Errors...)
		_config.Delta.Diagnostic.TargetDir = append(_config.Delta.Diagnostic.TargetDir, val.Diagnostics...)

		mergedMap := make(_model.File_SymclassIndexMap)
		_map.Copy(mergedMap, val.Public)
		_map.Copy(mergedMap, val.Global)
		_config.Manifest.Group.Global[key] = mergedMap
	}

	_config.Manifest.Lookup = map[string]_model.File_Lookup{}
	_map.Copy(_config.Manifest.Lookup, _config.Delta.Lookup.Artifacts)
	_map.Copy(_config.Manifest.Lookup, _config.Delta.Lookup.Libraries)
	_map.Copy(_config.Manifest.Lookup, _config.Delta.Lookup.TargetDir)

	_config.Delta.Error.Multiples = []string{}
	_config.Delta.Diagnostic.Multiples = []_model.File_Diagnostic{}
	for _, val := range _config.Style.Index_to_Data {
		if len(val.SrcData.Metadata.Declarations) > 1 {
			error_ := K.Error_Standard("Duplicate Declarations: "+val.SrcData.SymClass, val.SrcData.Metadata.Declarations)
			_config.Delta.Error.Multiples = append(_config.Delta.Error.Multiples, error_.Errorstring)
			_config.Delta.Diagnostic.Multiples = append(_config.Delta.Diagnostic.Multiples, error_.Diagnostic)
		}
	}

	diagnostics := []_model.File_Diagnostic{}
	diagnostics = append(diagnostics, _config.Delta.Diagnostic.Hashrules...)
	diagnostics = append(diagnostics, _config.Delta.Diagnostic.Artifacts...)
	diagnostics = append(diagnostics, _config.Delta.Diagnostic.Handoffs...)
	diagnostics = append(diagnostics, _config.Delta.Diagnostic.Axioms...)
	diagnostics = append(diagnostics, _config.Delta.Diagnostic.Clusters...)
	diagnostics = append(diagnostics, _config.Delta.Diagnostic.Multiples...)
	diagnostics = append(diagnostics, _config.Delta.Diagnostic.TargetDir...)
	_config.Manifest.Diagnostics = diagnostics

	errors := []string{}
	errors = append(errors, _config.Delta.Error.Handoffs...)
	errors = append(errors, _config.Delta.Error.Hashrules...)
	errors = append(errors, _config.Delta.Error.Artifacts...)
	errors = append(errors, _config.Delta.Error.Axioms...)
	errors = append(errors, _config.Delta.Error.Clusters...)
	errors = append(errors, _config.Delta.Error.Multiples...)
	errors = append(errors, _config.Delta.Error.TargetDir...)
	_config.Delta.Errors = errors

	_config.Delta.Report.Errors = ""
	if len(_config.Delta.Errors) > 0 {
		_config.Delta.Report.Errors = C.MAKE(
			C.Tag.H2(_strconv.Itoa(len(_config.Delta.Errors))+" Errors", C.Preset.Failed),
			errors,
		)
	} else {
		_config.Delta.Report.Errors = C.MAKE(
			C.Tag.H2("Zero Errors", C.Preset.Text),
			errors,
		)
	}
}

var css_class_prefix = "." + string(_config.Root.CustomOps["locale"])
var tag_class_prefix = string(_config.Root.CustomOps["locale"])

func Organize() (AritfactFiles map[string]string, Attachments []int) {

	_config.Style.ClassDictionary = _model.Style_Dictionary{}
	_config.Style.PublishIndexMap = []_model.Style_ClassIndexTrace{}

	SaveClassRefs := func(stash _order_.R_Preview) {
		for _, val := range stash.Final_Hashtrace {
			index := val[0]
			classid := val[1]
			classname := css_class_prefix + _util.String_EnCounter(classid)
			_config.Style.PublishIndexMap = append(_config.Style.PublishIndexMap, _model.Style_ClassIndexTrace{
				ClassName:  classname,
				ClassIndex: index,
			})
		}

		for json_array, imap := range stash.List_to_GroupId {
			_config.Style.ClassDictionary[json_array] = map[int]string{}
			for ref, id := range stash.Group_to_Table[imap] {
				_config.Style.ClassDictionary[json_array][ref] = tag_class_prefix + _util.String_EnCounter(id)
			}
		}
	}

	Accumulate()
	artifact_files := map[string]string{}
	tracks_ := _stash.Target_GetTracks()
	// _config.Delta.FinalMessage = "Confirm a clean state before triggering the production build."
	if _config.Static.WATCH {
		_config.Delta.FinalMessage = _strconv.Itoa(len(_config.Delta.Errors)) + " Errors."
	} else if _config.Static.Command == "preview" {
		res, _ := _order_.Optimize(tracks_.ClassTracks, false, _config.Static.Argument, _model.Config_Archive{})
		SaveClassRefs(*res.Result)

		if len(_config.Delta.Errors) > 0 {
			_config.Delta.FinalMessage = _strconv.Itoa(len(_config.Delta.Errors)) + " Unresolved Errors. Rectify them to proceed with 'publish' command."
		} else {
			_config.Delta.FinalMessage = "Preview verified with no major errors. Procceed to 'publish' using a valid key."
		}
	} else if _config.Static.Command == "publish" {
		if len(_config.Delta.Errors) > 0 {
			res, _ := _order_.Optimize(tracks_.ClassTracks, false, _config.Static.Argument, archive_Build())
			SaveClassRefs(*res.Result)

			_config.Delta.FinalMessage = _strconv.Itoa(len(_config.Delta.Errors)) + " Errors. Falling back to 'preview' command."
			_config.Static.Command = "preview"
		} else {
			archive := archive_Build()
			res, _ := _order_.Optimize(tracks_.ClassTracks, true, _config.Static.Argument, archive)
			SaveClassRefs(*res.Result)

			if res.Status {
				artifact_files = archive_Files()
				_config.Delta.FinalMessage = "Build Success."
			} else {
				_config.Delta.PublishError = res.Message
				_config.Delta.FinalMessage = "Build Atttempt Failed. Fallback with Preview."
			}
		}
	}

	return artifact_files, tracks_.Attachments
}
