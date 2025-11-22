package compiler

import (
	_config "main/configs"
	_action "main/internal/action"
	K "main/internal/console"
	_order_ "main/internal/order"
	_stash "main/internal/stash"
	_style "main/internal/style"
	_target "main/internal/target"
	_model "main/models"
	C "main/package/console"
	_css "main/package/css"
	_util "main/package/utils"
	_map "maps"
	_strconv "strconv"
)

func SetReferences() {
	_config.Delta_Reset()
	_config.Style_Reset()
	_config.Manifest_Reset()

	_stash.Reset()
	_stash.Artifact_Update()
	_stash.Library_Update()
	_style.Hashrule_Upload()

	index_scanned := _style.Cssfile_String(_util.Code_Uncomment(_config.Saved.RootCSS, false, true, false), "INDEX | ")
	_config.Manifest.Constants = index_scanned.Variables.ToMap()
	for attachment := range index_scanned.Attachments {
		if res := _action.Index_Finder(attachment, _model.Style_ClassIndexMap{}); res.Index > 0 {
			_config.Delta.IndexAttach[res.Index] = true
		}
	}

	_config.Delta.IndexBuild = _css.Render_Sequence(index_scanned.Result, _config.Static.MINIFY)

	_stash.SaveHandoffErrors()
	_stash.Target_UpdateDirs()

}

func Accumulate() _target.GetTracks_return {
	filemanifest, targetReport := _stash.Target_Accumulate()
	_config.Delta.Report.TargetDir = targetReport

	_config.Manifest.Group.Local = map[string]_model.Style_ClassIndexMap{}
	_config.Manifest.Group.Global = map[string]_model.Style_ClassIndexMap{}

	_config.Delta.Error.TargetDir = []string{}
	_config.Delta.Lookup.TargetDir = map[string]*_model.File_CacheData{}
	_config.Delta.Diagnostic.TargetDir = []*_model.File_Diagnostic{}

	for key, val := range filemanifest {
		_config.Manifest.Group.Local[key] = val.Cache.LocalMap
		_config.Delta.Lookup.TargetDir[key] = val.Cache
		_config.Delta.Error.TargetDir = append(_config.Delta.Error.TargetDir, val.Errors...)
		_config.Delta.Diagnostic.TargetDir = append(_config.Delta.Diagnostic.TargetDir, val.Diagnostics...)

		mergedMap := make(_model.Style_ClassIndexMap)
		_map.Copy(mergedMap, val.Cache.PublicMap)
		_map.Copy(mergedMap, val.Cache.GlobalMap)
		_config.Manifest.Group.Global[key] = mergedMap
	}

	_config.Manifest.Lookup = map[string]*_model.File_CacheData{}
	_map.Copy(_config.Manifest.Lookup, _config.Delta.Lookup.Artifacts)
	_map.Copy(_config.Manifest.Lookup, _config.Delta.Lookup.Libraries)
	_map.Copy(_config.Manifest.Lookup, _config.Delta.Lookup.TargetDir)

	_config.Delta.Error.Multiples = []string{}
	_config.Delta.Diagnostic.Multiples = []*_model.File_Diagnostic{}
	for _, val := range _config.Style.Index_to_Styledata {
		if len(val.SrcData.Metadata.Declarations) > 1 {
			error_ := K.Error_Standard("Duplicate Declarations: "+val.SrcData.SymClass, val.SrcData.Metadata.Declarations)
			_config.Delta.Error.Multiples = append(_config.Delta.Error.Multiples, error_.Errorstring)
			_config.Delta.Diagnostic.Multiples = append(_config.Delta.Diagnostic.Multiples, &error_.Diagnostic)
		}
	}

	diagnostics := []*_model.File_Diagnostic{}
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
			C.Tag.H2(_strconv.Itoa(len(_config.Delta.Errors))+" Errors", C.Preset.Failed, C.Style.AS_Bold),
			errors,
		)
	} else {
		_config.Delta.Report.Errors = ""
	}
	return _stash.Target_GetTracks()
}

var initial = 100
var css_class_prefix = ".__"
var tag_class_prefix = "__"

func Organize() (AritfactFiles map[string]string, Attachments map[int]bool, RapidMap map[int]bool, FinalMap map[int]bool) {

	SaveClassRefs := func(stash _order_.R_Preview, cascade_counter bool) {
		for _, temp_trace := range stash.Final_Hashtrace {
			tempPubMap := []_model.Style_ClassIndexTrace{}
			for _, val := range temp_trace {
				index := val[0]
				classid := val[1]

				classname := css_class_prefix + _util.String_EnCounter(classid)
				if cascade_counter {
					classname = classname + "-" + _strconv.Itoa(initial+classid)
				}
				tempPubMap = append(tempPubMap, _model.Style_ClassIndexTrace{
					ClassName:  classname,
					ClassIndex: index,
				})
			}
			_config.Style.Publish_Ordered = append(_config.Style.Publish_Ordered, tempPubMap)
		}

		for json_array, imap := range stash.List_to_GroupId {
			_config.Style.ClassDictionary[json_array] = map[int]string{}
			for ref, classid := range stash.Group_to_Table[imap] {
				classname := tag_class_prefix + _util.String_EnCounter(classid)
				if cascade_counter {
					classname = classname + "-" + _strconv.Itoa(initial+classid)
				}
				_config.Style.ClassDictionary[json_array][ref] = classname
			}
		}
	}

	tracks := Accumulate()
	artifact_files := map[string]string{}
	_config.Delta.FinalMessage = _strconv.Itoa(len(_config.Delta.Errors)) + " Errors."

	switch _config.Static.Command {
	case "preview":
		res, _ := _order_.Optimize(tracks.ClassTracks, false, _config.Static.Argument, &_model.Config_Archive{})
		SaveClassRefs(*res.Result, true)

		if len(_config.Delta.Errors) > 0 {
			_config.Delta.FinalMessage = _strconv.Itoa(len(_config.Delta.Errors)) + " Unresolved Errors. Rectify them to proceed with 'publish' command."
		} else {
			_config.Delta.FinalMessage = "Preview verified with no major errors. Procceed to 'publish' using a valid key."
		}
	case "publish":
		if len(_config.Delta.Errors) > 0 {
			res, _ := _order_.Optimize(tracks.ClassTracks, false, _config.Static.Argument, archive_Build())
			SaveClassRefs(*res.Result, true)

			_config.Delta.FinalMessage = _strconv.Itoa(len(_config.Delta.Errors)) + " Errors. Falling back to 'preview' command."
			_config.Static.Command = "preview"
		} else {
			archive := archive_Build()
			res, _ := _order_.Optimize(tracks.ClassTracks, true, _config.Static.Argument, archive)

			if res.Status {
				SaveClassRefs(*res.Result, false)
				artifact_files = archive_Files()
				_config.Delta.FinalMessage = "Build Success."
				_config.Delta.PublishError = ""
			} else {
				SaveClassRefs(*res.Result, true)
				_config.Delta.PublishError = res.Message
				_config.Delta.FinalMessage = "Build Atttempt Failed. Falling back with Preview."
			}
		}
	}

	_map.Copy(tracks.Attachments, _config.Delta.IndexAttach)
	return artifact_files, tracks.Attachments, tracks.RapidMap, tracks.FinalMap
}
