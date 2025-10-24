package compiler

import (
	_config "main/configs"
	_action "main/internal/action"
	K "main/internal/console"
	_order_ "main/internal/order"
	_stash "main/internal/stash"
	_style "main/internal/style"
	_model "main/models"
	C "main/package/console"
	_css "main/package/css"
	_util "main/package/utils"
	_map "maps"
	_strconv "strconv"
)

func Update_Cache() {
	_action.Index_Reset(0)

	_config.Style_Reset()
	_config.Delta_Reset()
	_config.Manifest_Reset()

	_stash.Reset()
	_stash.Artifact_Update()
	_stash.Library_Update()

	index_scanned := _style.Cssfile_String(_util.Code_Uncomment(_config.Static.RootCSS, false, true, false), "INDEX | ")
	_config.Manifest.Constants = index_scanned.Variables.ToMap()
	for attachment := range index_scanned.Attachments {
		if res := _action.Index_Find(attachment, _model.Style_ClassIndexMap{}); res.Index > 0 {
			_config.Delta.IndexAttach[res.Index] = true
		}
	}
	_config.Delta.IndexBuild = _css.Render_Sequence(index_scanned.Result, _config.Static.MINIFY)
	_style.Hashrule_Upload()
	_stash.Target_UpdateDirs()
}

func Accumulate() {
	filemanifest, targetReport := _stash.Target_Accumulate()
	_config.Delta.Report.TargetDir = targetReport

	_config.Manifest.Group.Local = map[string]_model.File_SymclassIndexMap{}
	_config.Manifest.Group.Global = map[string]_model.File_SymclassIndexMap{}

	_config.Delta.Error.TargetDir = []string{}
	_config.Delta.Lookup.TargetDir = map[string]_model.File_Lookup{}
	_config.Delta.Diagnostic.TargetDir = []_model.File_Diagnostic{}

	for key, val := range filemanifest {
		_config.Manifest.Group.Local[key] = val.LocalMap
		_config.Delta.Lookup.TargetDir[key] = val.Lookup
		_config.Delta.Error.TargetDir = append(_config.Delta.Error.TargetDir, val.Errors...)
		_config.Delta.Diagnostic.TargetDir = append(_config.Delta.Diagnostic.TargetDir, val.Diagnostics...)

		mergedMap := make(_model.File_SymclassIndexMap)
		_map.Copy(mergedMap, val.PublicMap)
		_map.Copy(mergedMap, val.GlobalMap)
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
			C.Tag.H2(_strconv.Itoa(len(_config.Delta.Errors))+" Errors", C.Preset.Failed, C.Style.AS_Bold),
			errors,
		)
	} else {
		_config.Delta.Report.Errors = ""
	}
}

var css_class_prefix = "." + string(_config.Root.CustomOps["lodash"])
var tag_class_prefix = string(_config.Root.CustomOps["lodash"])

func Organize() (AritfactFiles map[string]string, Attachments map[int]bool) {

	_config.Style.ClassDictionary = _model.Style_Dictionary{}
	_config.Style.PublishIndexMap = [][]_model.Style_ClassIndexTrace{}

	SaveClassRefs := func(stash _order_.R_Preview) {
		for _, temp_trace := range stash.Final_Hashtrace {
			tempPubMap := []_model.Style_ClassIndexTrace{}
			for _, val := range temp_trace {
				index := val[0]
				classid := val[1]

				classname := css_class_prefix + _util.String_EnCounter(classid)
				tempPubMap = append(tempPubMap, _model.Style_ClassIndexTrace{
					ClassName:  classname,
					ClassIndex: index,
				})
			}
			_config.Style.PublishIndexMap = append(_config.Style.PublishIndexMap, tempPubMap)
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
	_config.Delta.FinalMessage = _strconv.Itoa(len(_config.Delta.Errors)) + " Errors."

	switch _config.Static.Command {
	case "preview":
		res, _ := _order_.Optimize(tracks_.ClassTracks, false, _config.Static.Argument, _model.Config_Archive{})
		SaveClassRefs(*res.Result)

		if len(_config.Delta.Errors) > 0 {
			_config.Delta.FinalMessage = _strconv.Itoa(len(_config.Delta.Errors)) + " Unresolved Errors. Rectify them to proceed with 'publish' command."
		} else {
			_config.Delta.FinalMessage = "Preview verified with no major errors. Procceed to 'publish' using a valid key."
		}
	case "publish":
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

	attachments := tracks_.Attachments
	_map.Copy(attachments, _config.Delta.IndexAttach)

	return artifact_files, attachments
}
