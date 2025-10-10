package service

import (
	_config "main/configs"
	X "main/internal/console"
	_order_ "main/internal/order"
	_stash "main/internal/stash"
	_model "main/models"
	S "main/package/console"
	_util "main/package/utils"
	_map "maps"
	_strconv "strconv"
)

func accumulate() {
	accumulated := _stash.Target_Accumulate()

	_config.Style.Global___Index = accumulated.GlobalClasses
	_config.Style.Public___Index = accumulated.PublicClasses
	_config.Delta.Report.TargetDir = accumulated.Report

	_config.Manifest.Group.Local = map[string]_model.File_MetadataMap{}
	_config.Manifest.Group.Global = map[string]_model.File_MetadataMap{}

	_config.Delta.Errors.TargetDir = []string{}
	_config.Delta.Lookup.TargetDir = map[string]_model.File_Lookup{}
	_config.Delta.Diagnostics.TargetDir = []_model.Refer_Diagnostic{}

	for key, val := range accumulated.FileManifests {
		_config.Manifest.Group.Local[key] = val.Local
		_config.Delta.Lookup.TargetDir[key] = val.Lookup
		_config.Delta.Errors.TargetDir = append(_config.Delta.Errors.TargetDir, val.Errors...)
		_config.Delta.Diagnostics.TargetDir = append(_config.Delta.Diagnostics.TargetDir, val.Diagnostics...)

		mergedMap := make(_model.File_MetadataMap)
		_map.Copy(mergedMap, val.Public)
		_map.Copy(mergedMap, val.Global)
		_config.Manifest.Group.Global[key] = mergedMap
	}

	_config.Manifest.Lookup = map[string]_model.File_Lookup{}
	_map.Copy(_config.Manifest.Lookup, _config.Delta.Lookup.Artifacts)
	_map.Copy(_config.Manifest.Lookup, _config.Delta.Lookup.Libraries)
	_map.Copy(_config.Manifest.Lookup, _config.Delta.Lookup.TargetDir)

	_config.Delta.Errors.Multiples = []string{}
	_config.Delta.Diagnostics.Multiples = []_model.Refer_Diagnostic{}
	for _, val := range _config.Style.Index_to_Data {
		if len(val.Metadata.Declarations) > 1 {
			error_ := X.Error_Standard("Duplicate Declarations: "+val.SymClass, val.Metadata.Declarations)
			_config.Delta.Errors.Multiples = append(_config.Delta.Errors.Multiples, error_.Errorstring)
			_config.Delta.Diagnostics.Multiples = append(_config.Delta.Diagnostics.Multiples, error_.Diagnostic)
		}
	}

	diagnostics := []_model.Refer_Diagnostic{}
	diagnostics = append(diagnostics, _config.Delta.Diagnostics.Hashrules...)
	diagnostics = append(diagnostics, _config.Delta.Diagnostics.Artifacts...)
	diagnostics = append(diagnostics, _config.Delta.Diagnostics.Handoffs...)
	diagnostics = append(diagnostics, _config.Delta.Diagnostics.Axioms...)
	diagnostics = append(diagnostics, _config.Delta.Diagnostics.Clusters...)
	diagnostics = append(diagnostics, _config.Delta.Diagnostics.Multiples...)
	diagnostics = append(diagnostics, _config.Delta.Diagnostics.TargetDir...)
	_config.Manifest.Diagnostics = diagnostics

	errorlist := []string{}
	errorlist = append(errorlist, _config.Delta.Errors.Handoffs...)
	errorlist = append(errorlist, _config.Delta.Errors.Hashrules...)
	errorlist = append(errorlist, _config.Delta.Errors.Artifacts...)
	errorlist = append(errorlist, _config.Delta.Errors.Axioms...)
	errorlist = append(errorlist, _config.Delta.Errors.Clusters...)
	errorlist = append(errorlist, _config.Delta.Errors.Multiples...)
	errorlist = append(errorlist, _config.Delta.Errors.TargetDir...)
	_config.Delta.ErrorCount = len(diagnostics)

	_config.Delta.Report.Errors = ""
	if _config.Delta.ErrorCount > 0 {
		_config.Delta.Report.Errors = S.MAKE(
			S.Tag.H2(_strconv.Itoa(_config.Delta.ErrorCount)+" Errors", S.Preset.Failed),
			errorlist,
		)
	}
}

func Organize() (AritfactFiles map[string]string, Attachments []int) {

	_config.Style.ClassDictionary = _model.Style_Dictionary{}
	_config.Style.PublishIndexMap = []_model.Style_ClassIndexTrace{}

	SaveClassRefs := func(stash _order_.R_Preview) {
		for _, val := range stash.Final_Hashtrace {
			index := val[0]
			classid := val[1]
			classname := "_" + _util.String_EnCounter(classid)
			_config.Style.PublishIndexMap = append(_config.Style.PublishIndexMap, _model.Style_ClassIndexTrace{
				ClassName:  classname,
				ClassIndex: index,
			})
		}

		for json_array, imap := range stash.List_to_GroupId {
			_config.Style.ClassDictionary[json_array] = map[int]string{}
			for ref, id := range stash.Group_to_Table[imap] {
				_config.Style.ClassDictionary[json_array][ref] = "_" + _util.String_EnCounter(id)
			}
		}
	}

	accumulate()
	artifact_files := map[string]string{}
	tracks_ := _stash.Target_GetTracks()

	if _config.Static.WATCH {
		_config.Delta.FinalMessage = _strconv.Itoa(_config.Delta.ErrorCount) + " Errors."
	} else if _config.Static.Command == "preview" {
		res, _ := _order_.Optimize(tracks_.ClassTracks, false, _config.Static.Argument, _model.Config_Archive{})
		SaveClassRefs(*res.Result)

		if _config.Delta.ErrorCount > 0 {
			_config.Delta.FinalMessage = _strconv.Itoa(_config.Delta.ErrorCount) + " Unresolved Errors. Rectify them to proceed with 'publish' command."
		} else {
			_config.Delta.FinalMessage = "Preview verified with no major errors. Procceed to 'publish' using your key."
		}
	} else if _config.Static.Command == "publish" {
		if _config.Delta.ErrorCount > 0 {
			res, _ := _order_.Optimize(tracks_.ClassTracks, false, _config.Static.Argument, _model.Config_Archive{})
			SaveClassRefs(*res.Result)

			_config.Delta.FinalMessage = "Errors in " + _strconv.Itoa(_config.Delta.ErrorCount) + " Tags. Falling back to 'preview' command."
			_config.Static.Command = "preview"
		} else {
			archive := archive_Build()
			res, _ := _order_.Optimize(tracks_.ClassTracks, true, _config.Static.Argument, archive)
			SaveClassRefs(*res.Result)

			if res.Status {
				artifact_files = archive_Deploy()
				_config.Delta.FinalMessage = "Build Success."
			} else {
				_config.Delta.PublishError = res.Message
				_config.Delta.FinalMessage = "Build Atttempt Failed. Fallback with Preview."
			}
		}
	}

	return artifact_files, tracks_.Attachments
}
