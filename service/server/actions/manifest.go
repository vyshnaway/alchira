package actions

import (
	"main/configs"
	"main/internal/action"
	"main/internal/stash"
	"main/models"
	"main/package/fileman"
	"maps"
	"slices"
	"strconv"
)

type R_Manifest_IO struct {
	Attributes []string `json:"attributes"`
}

type R_ManifestGlobal struct {
	WebviewPort int                               `json:"webviewport"`
	WebviewUrl  string                            `json:"webviewurl"`
	Environment string                            `json:"environment"`
	CustomTags  []string                          `json:"customtags"`
	LiveCursor  bool                              `json:"livecursor"`
	SwitchMap   map[string]string                 `json:"switchmap"`
	Hashrules   map[string]string                 `json:"hashrules"`
	Constants   map[string]string                 `json:"constants"`
	Symclasses  map[string]*models.Style_Metadata `json:"symclasses"`
}

type R_ManifestLocal struct {
	AssistFile       bool                          `json:"assistfile"`
	SwitchMap        map[string]string             `json:"switchmap"`
	Hashrules        map[string]string             `json:"hashrules"`
	Constants        map[string]string             `json:"constants"`
	GlobalAssignable []string                      `json:"globalAssignable"`
	LocalAssignable  []string                      `json:"localAssignable"`
	GlobalAttachable []string                      `json:"globalAttachable"`
	LocalAttachable  []string                      `json:"localAttachable"`
	Symclasses       map[string]int                `json:"symclasses"`
	Diagnostics      []*models.File_Diagnostic     `json:"diagnostics"`
	SymclassData     map[int]models.Style_Metadata `json:"symclassData"`
}

func ManifestGlobal() R_ManifestGlobal {
	configs.Static.ExecuteMutex.Lock()
	defer configs.Static.ExecuteMutex.Unlock()

	MetadataFromIndex := func(index int) models.Style_Metadata {
		return *action.Index_Fetch(index).SrcData.Metadata
	}

	attributes := []string{}
	switchmap := map[string]string{}
	extention := fileman.Path_FileExtention(filepath)
	for _, tv := range stash.Cache.Targetdir {
		switchmap[tv.Source] = tv.Target
		switchmap[tv.Target] = tv.Source
		if res, ok := tv.ExtnsProps[extention]; ok {
			attributes = res
		}
	}

	convertAndSort := func(keys []string) []int {
		var result []int
		for _, k := range keys {
			if i, err := strconv.Atoi(k); err == nil {
				result = append(result, i)
			}
		}
		slices.Sort(result)
		return result
	}

	manifest := configs.Manifest
	assignable := []string{}
	_symclasses := []string{}
	_symclassData := map[string]models.Style_Metadata{}
	SymclassIndexMap := map[string]int{}
	lodashes := []string{}

	if nav.Type == models.File_Type_Artifact {
		if stash, er := manifest.Group.Artifact[nav.Id]; er {
			for k, v := range stash {
				_symclasses = append(_symclasses, k)
				_symclassData[k] = MetadataFromIndex(v)
			}
		}
	} else {
		for _, K := range convertAndSort(slices.Collect(maps.Keys(manifest.Group.Axiom))) {
			KK := strconv.Itoa(K)
			for k, v := range manifest.Group.Axiom[KK] {
				_symclasses = append(_symclasses, k)
				SymclassIndexMap[k] = v
				_symclassData[k] = MetadataFromIndex(v)
			}
			if nav.Id == KK {
				goto Return
			}
			for k := range manifest.Group.Axiom[KK] {
				assignable = append(assignable, k)
			}
		}

		for _, K := range convertAndSort(slices.Collect(maps.Keys(manifest.Group.Cluster))) {
			KK := strconv.Itoa(K)
			for k, v := range manifest.Group.Cluster[KK] {
				_symclasses = append(_symclasses, k)
				SymclassIndexMap[k] = v
				_symclassData[k] = MetadataFromIndex(v)
			}
			if nav.Id == KK {
				goto Return
			}
			for k := range manifest.Group.Cluster[KK] {
				assignable = append(assignable, k)
			}
		}

		for _, V := range manifest.Group.Artifact {
			for k, v := range V {
				_symclasses = append(_symclasses, k)
				SymclassIndexMap[k] = v
				_symclassData[k] = MetadataFromIndex(v)
			}
		}

		for _, V := range manifest.Group.Global {
			for k, v := range V {
				_symclasses = append(_symclasses, k)
				SymclassIndexMap[k] = v
				_symclassData[k] = MetadataFromIndex(v)
			}
		}

		if nav.Type != models.File_Type_Stylesheet {
			if stash, er := manifest.Group.Local[nav.Id]; er {
				for k, v := range stash {
					_symclasses = append(_symclasses, k)
					SymclassIndexMap[k] = v
					_symclassData[k] = MetadataFromIndex(v)
				}
			}
		}
	}

Return:
	watchfiles := []string{}
	for k := range configs.Manifest.Lookup {
		watchfiles = append(watchfiles, k)
	}

	symclasses := map[string]int{}
	symclassdata := map[int]models.Style_Metadata{}
	for i, v := range _symclasses {
		symclasses[v] = i
		symclassdata[i] = _symclassData[v]
	}

	constants := manifest.Constants
	diagnostics := manifest.Diagnostics
	hashrules := configs.Style.Hashrules
	return R_Manifest_IO{
			Attributes:  attributes,
			CustomTags:  configs.Static.CustomTags,
			Environment: configs.Archive.Environment,
		}, R_Manifest_WS{
			SwitchMap:    switchmap,
			Hashrules:    hashrules,
			Constants:    constants,
			Assignable:   assignable,
			Symclasses:   symclasses,
			SymclassData: symclassdata,
			Lodashes:     lodashes,
			Diagnostics:  diagnostics,
		}
}

func ManifestFile(filepath string) (R_Manifest_IO, R_Manifest_WS) {
	configs.Static.ExecuteMutex.Lock()
	defer configs.Static.ExecuteMutex.Unlock()

	MetadataFromIndex := func(index int) models.Style_Metadata {
		return *action.Index_Fetch(index).SrcData.Metadata
	}

	attributes := []string{}
	switchmap := map[string]string{}
	extention := fileman.Path_FileExtention(filepath)
	for _, tv := range stash.Cache.Targetdir {
		switchmap[tv.Source] = tv.Target
		switchmap[tv.Target] = tv.Source
		if res, ok := tv.ExtnsProps[extention]; ok {
			attributes = res
		}
	}

	convertAndSort := func(keys []string) []int {
		var result []int
		for _, k := range keys {
			if i, err := strconv.Atoi(k); err == nil {
				result = append(result, i)
			}
		}
		slices.Sort(result)
		return result
	}

	manifest := configs.Manifest
	assignable := []string{}
	_symclasses := []string{}
	_symclassData := map[string]models.Style_Metadata{}
	SymclassIndexMap := map[string]int{}
	lodashes := []string{}
	assistfile := false

	if nav, ok := configs.Manifest.Lookup[filepath]; ok {
		assistfile = true

		if nav.Type == models.File_Type_Artifact {
			if stash, er := manifest.Group.Artifact[nav.Id]; er {
				for k, v := range stash {
					_symclasses = append(_symclasses, k)
					_symclassData[k] = MetadataFromIndex(v)
				}
			}
		} else {
			for _, K := range convertAndSort(slices.Collect(maps.Keys(manifest.Group.Axiom))) {
				KK := strconv.Itoa(K)
				for k, v := range manifest.Group.Axiom[KK] {
					_symclasses = append(_symclasses, k)
					SymclassIndexMap[k] = v
					_symclassData[k] = MetadataFromIndex(v)
				}
				if nav.Id == KK {
					goto Return
				}
				for k := range manifest.Group.Axiom[KK] {
					assignable = append(assignable, k)
				}
			}

			for _, K := range convertAndSort(slices.Collect(maps.Keys(manifest.Group.Cluster))) {
				KK := strconv.Itoa(K)
				for k, v := range manifest.Group.Cluster[KK] {
					_symclasses = append(_symclasses, k)
					SymclassIndexMap[k] = v
					_symclassData[k] = MetadataFromIndex(v)
				}
				if nav.Id == KK {
					goto Return
				}
				for k := range manifest.Group.Cluster[KK] {
					assignable = append(assignable, k)
				}
			}

			for _, V := range manifest.Group.Artifact {
				for k, v := range V {
					_symclasses = append(_symclasses, k)
					SymclassIndexMap[k] = v
					_symclassData[k] = MetadataFromIndex(v)
				}
			}

			for _, V := range manifest.Group.Global {
				for k, v := range V {
					_symclasses = append(_symclasses, k)
					SymclassIndexMap[k] = v
					_symclassData[k] = MetadataFromIndex(v)
				}
			}

			if nav.Type != models.File_Type_Stylesheet {
				if stash, er := manifest.Group.Local[nav.Id]; er {
					for k, v := range stash {
						_symclasses = append(_symclasses, k)
						SymclassIndexMap[k] = v
						_symclassData[k] = MetadataFromIndex(v)
					}
				}
			}
		}
	}

Return:
	watchfiles := []string{}
	for k := range configs.Manifest.Lookup {
		watchfiles = append(watchfiles, k)
	}

	symclasses := map[string]int{}
	symclassdata := map[int]models.Style_Metadata{}
	for i, v := range _symclasses {
		symclasses[v] = i
		symclassdata[i] = _symclassData[v]
	}

	constants := manifest.Constants
	Refer.SymclassIndexMap = SymclassIndexMap
	diagnostics := manifest.Diagnostics
	hashrules := configs.Style.Hashrules
	return R_Manifest_IO{
			WebviewUrl:  Refer.Url,
			WebviewPort: Refer.Port,
			Attributes:  attributes,
			CustomTags:  configs.Static.CustomTags,
			Environment: configs.Archive.Environment,
			SwitchMap:   switchmap,
			WatchFiles:  watchfiles,
			AssistFile:  assistfile,
			LiveCursor:  Refer.LiveCursor,
		}, R_Manifest_WS{
			Hashrules:    hashrules,
			Constants:    constants,
			Assignable:   assignable,
			Symclasses:   symclasses,
			SymclassData: symclassdata,
			Lodashes:     lodashes,
			Diagnostics:  diagnostics,
		}
}
