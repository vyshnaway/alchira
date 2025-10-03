package craft

import (
	_cache_ "main/cache"
	_order_ "main/order"
	S "main/shell"
	_stash_ "main/stash"
	_types_ "main/types"
	_utils_ "main/utils"
	X "main/xhell"
	_maps_ "maps"
	_slices_ "slices"
	_strconv_ "strconv"
)

func accumulate() {
	accumulated := _stash_.Target_Accumulate()
	_cache_.Style.Global___Index = accumulated.GlobalClasses
	_cache_.Style.Public___Index = accumulated.PublicClasses
	_cache_.Delta.Report.TargetDir = S.MAKE("", accumulated.Report)

	_cache_.Manifest.Local = map[string]_types_.File_MetadataMap{}
	_cache_.Manifest.Global = map[string]_types_.File_MetadataMap{}

	_cache_.Delta.Errors.TargetDir = []string{}
	_cache_.Delta.Lookup.TargetDir = map[string]_types_.File_Lookup{}
	_cache_.Delta.Diagnostics.TargetDir = []_types_.Refer_Diagnostic{}

	for key, val := range accumulated.FileManifests {
		_cache_.Manifest.Local[key] = val.Local
		_cache_.Delta.Lookup.TargetDir[key] = val.Lookup
		_cache_.Delta.Errors.TargetDir = append(_cache_.Delta.Errors.TargetDir, val.Errors...)
		_cache_.Delta.Diagnostics.TargetDir = append(_cache_.Delta.Diagnostics.TargetDir, val.Diagnostics...)

		mergedMap := make(_types_.File_MetadataMap)
		for k, v := range val.Public {
			mergedMap[k] = v
		}
		for k, v := range val.Global {
			mergedMap[k] = v
		}
		_cache_.Manifest.Global[key] = mergedMap
	}

	_cache_.Manifest.Lookup = map[string]_types_.File_Lookup{}
	_maps_.Copy(_cache_.Manifest.Lookup, _cache_.Delta.Lookup.Artifacts)
	_maps_.Copy(_cache_.Manifest.Lookup, _cache_.Delta.Lookup.Libraries)
	_maps_.Copy(_cache_.Manifest.Lookup, _cache_.Delta.Lookup.TargetDir)

	_cache_.Delta.Errors.Multiples = []string{}
	_cache_.Delta.Diagnostics.Multiples = []_types_.Refer_Diagnostic{}
	for _, val := range _cache_.Style.Index_to_Data {
		if len(val.Metadata.Declarations) > 1 {
			error_ := X.Error_Write("Duplicate Declarations: "+val.SymClass, val.Metadata.Declarations)
			_cache_.Delta.Errors.Multiples = append(_cache_.Delta.Errors.Multiples, error_.Errorstring)
			_cache_.Delta.Diagnostics.Multiples = append(_cache_.Delta.Diagnostics.Multiples, error_.Diagnostic)
		}
	}

	_cache_.Manifest.Diagnostics = []_types_.Refer_Diagnostic{}
	_slices_.Concat(_cache_.Manifest.Diagnostics, _cache_.Delta.Diagnostics.Artifacts)
	_slices_.Concat(_cache_.Manifest.Diagnostics, _cache_.Delta.Diagnostics.Axioms)
	_slices_.Concat(_cache_.Manifest.Diagnostics, _cache_.Delta.Diagnostics.Clusters)
	_slices_.Concat(_cache_.Manifest.Diagnostics, _cache_.Delta.Diagnostics.Multiples)
	_slices_.Concat(_cache_.Manifest.Diagnostics, _cache_.Delta.Diagnostics.TargetDir)
	_cache_.Delta.ErrorCount = len(_cache_.Manifest.Diagnostics)

	errorlist := []string{}
	_slices_.Concat(errorlist, _cache_.Delta.Errors.Artifacts)
	_slices_.Concat(errorlist, _cache_.Delta.Errors.Axioms)
	_slices_.Concat(errorlist, _cache_.Delta.Errors.Clusters)
	_slices_.Concat(errorlist, _cache_.Delta.Errors.Multiples)
	_slices_.Concat(errorlist, _cache_.Delta.Errors.TargetDir)
	_cache_.Delta.Report.Errors = ""

	if _cache_.Delta.ErrorCount > 0 {
		S.MAKE(
			S.Tag.H2(_strconv_.Itoa(_cache_.Delta.ErrorCount)+" Errors", S.Preset.Failed),
			errorlist,
		)
	}
}

func Organize() (AritfactFiles map[string]string, Attachments []int) {

	_cache_.Style.ClassDictionary = _types_.Style_Dictionary{}
	_cache_.Style.PublishIndexMap = []_types_.Style_ClassIndexTrace{}

	SaveClassRefs := func(stash _types_.Refer_SortedOutput) {
		for _, val := range stash.RecompClasslist {
			index := val[0]
			classid := val[1]
			classname := "_" + _utils_.String_EnCounter(classid)
			_cache_.Style.PublishIndexMap = append(_cache_.Style.PublishIndexMap, _types_.Style_ClassIndexTrace{
				ClassName:  classname,
				ClassIndex: index,
			})
		}

		for json_array, imap := range stash.ReferenceMap {
			_cache_.Style.ClassDictionary[json_array] = map[int]string{}
			for ref, id := range imap {
				_cache_.Style.ClassDictionary[json_array][ref] = "_" + _utils_.String_EnCounter(id)
			}
		}
	}

	accumulate()
	artifact_files := map[string]string{}
	tracks_ := _stash_.Target_GetTracks()

	if _cache_.Static.WATCH {
		_cache_.Delta.FinalMessage = _strconv_.Itoa(_cache_.Delta.ErrorCount) + " Errors."
	} else if _cache_.Static.Command == "preview" {
		res, _ := _order_.Order(tracks_.ClassTracks, "preview", _cache_.Static.Argument, _types_.Config_Archive{})
		SaveClassRefs(*res.Result)

		if _cache_.Delta.ErrorCount > 0 {
			_cache_.Delta.FinalMessage = _strconv_.Itoa(_cache_.Delta.ErrorCount) + " Unresolved Errors. Rectify them to proceed with 'publish' command."
		} else {
			_cache_.Delta.FinalMessage = "Preview verified with no major errors. Procceed to 'publish' using your key."
		}
	} else if _cache_.Static.Command == "publish" {
		if _cache_.Delta.ErrorCount > 0 {
			res, _ := _order_.Order(tracks_.ClassTracks, "preview", _cache_.Static.Argument, _types_.Config_Archive{})
			SaveClassRefs(*res.Result)

			_cache_.Delta.FinalMessage = "Errors in " + _strconv_.Itoa(_cache_.Delta.ErrorCount) + " Tags. Falling back to 'preview' command."
			_cache_.Static.Command = "preview"
		} else {
			archive := archive_Build()
			res, _ := _order_.Order(tracks_.ClassTracks, "publish", _cache_.Static.Argument, archive)
			SaveClassRefs(*res.Result)

			if res.Status {
				artifact_files = archive_Deploy()
				_cache_.Delta.FinalMessage = "Build Success."
			} else {
				_cache_.Delta.PublishError = res.Message
				_cache_.Delta.FinalMessage = "Build Atttempt Failed. Fallback with Preview."
			}
		}
	}

	return artifact_files, tracks_.Attachments
}
