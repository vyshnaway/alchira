package stash

import (
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	"main/internal/script"
	_target "main/internal/target"
	_model "main/models"
	O "main/package/object"
	_util "main/package/utils"
	_map "maps"
	_strconv "strconv"
)

func Target_UpdateDirs() {

	for key, data := range Cache.Targetdir {
		data.ClearFiles()
		delete(Cache.Targetdir, key)
	}
	Cache.Targetdir = map[string]*_target.Class{}

	for c, i := range _config.Style.Public___Index {
		_action.Index_Dispose(i)
		delete(_config.Style.Public___Index, c)
	}
	_config.Style.Public___Index = _model.Style_ClassIndexMap{}

	for c, i := range _config.Style.Global___Index {
		_action.Index_Dispose(i)
		delete(_config.Style.Public___Index, c)
	}
	_config.Style.Global___Index = _model.Style_ClassIndexMap{}

	i := 0
	for key, files := range _config.Saved.TargetDir_Saved {
		Cache.Targetdir[key] = _target.New(files, _util.String_EnCounter(i))
		i++
	}
}

func Target_Accumulate() (
	ContextMap map[string]*_model.File_Stash,
	Report string,
) {
	global_counter := 0
	public_counter := 0
	globals := O.New[string, []string](len(Cache.Targetdir))
	publics := O.New[string, []string](len(Cache.Targetdir))
	contextMaps := map[string]*_model.File_Stash{}

	for _, target := range Cache.Targetdir {

		C := target.Accumulator()
		global_counter += len(C.GlobalClasses)
		public_counter += len(C.PublicClasses)
		_map.Copy(contextMaps, C.ContextMap)

		globals.Set(
			"["+target.Target+" -> "+target.Source+"]: "+_strconv.Itoa(len(C.GlobalClasses)),
			C.GlobalClasses,
		)
		publics.Set(
			"["+target.Target+" -> "+target.Source+"]: "+_strconv.Itoa(len(C.PublicClasses)),
			C.PublicClasses,
		)
	}

	counter := global_counter + public_counter
	report :=
		X.List_Chart("Globals: "+_strconv.Itoa(counter)+" Symclasses", globals) +
			X.List_Chart("Publics: "+_strconv.Itoa(counter)+" Symclasses", publics)
	return contextMaps, report
}

func Target_GetTracks() _target.GetTracks_return {
	classtracks := [][]int{}
	attachments := map[int]bool{}
	rapidmap := map[int]bool{}
	finalmap := map[int]bool{}

	for _, target := range Cache.Targetdir {
		r := target.GetTracks()
		classtracks = append(classtracks, r.ClassTracks...)
		_map.Copy(attachments, r.Attachments)
		_map.Copy(rapidmap, r.RapidMap)
		_map.Copy(finalmap, r.FinalMap)
	}

	return _target.GetTracks_return{
		Attachments: attachments,
		ClassTracks: classtracks,
		RapidMap:    rapidmap,
		FinalMap:    finalmap,
	}
}

func Target_SyncClassNames() {

	var render_action script.E_Method
	if _config.Static.DEBUG {
		render_action = script.E_Method_DebugHash
	} else {
		render_action = script.E_Method_BuildHash
	}

	for _, target := range Cache.Targetdir {
		target.SyncClassnames(render_action)
	}
}
