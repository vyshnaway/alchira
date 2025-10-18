package server

import (
	"main/configs"
	"main/internal/action"
	"main/internal/stash"
	"main/models"
	"main/package/fileman"
	"maps"
	"slices"
	"strconv"
	"sync"
)

type R_Manifest struct {
	LiveCursor   bool                           `json:"livecursor"`
	WebviewPort  int                            `json:"webviewport"`
	WebviewUrl   string                         `json:"webviewurl"`
	Filepath     string                         `json:"filepath"`
	Extention    string                         `json:"extention"`
	AssistFile   bool                           `json:"assistfile"`
	Environment  string                         `json:"environment"`
	WatchFiles   []string                       `json:"watchfiles"`
	Locales      []string                       `json:"locales"`
	Attributes   []string                       `json:"attributes"`
	CustomTags   []string                       `json:"customtags"`
	Assignable   []string                       `json:"assignable"`
	Symclasses   map[string]int                 `json:"symclasses"`
	SwitchMap    map[string]string              `json:"switchmap"`
	Hashrules    map[string]string              `json:"hashrules"`
	Constants    map[string]string              `json:"constants"`
	Diagnostics  []models.File_Diagnostic       `json:"diagnostics"`
	SymclassData map[int]*models.Style_Metadata `json:"symclassData"`
}

func ManifestFile(filepath string) R_Manifest {
	MetadataFromIndex := func(index int) *models.Style_Metadata {
		return action.Index_Fetch(index).SrcData.Metadata
	}

	var mu sync.Mutex
	mu.Lock()
	defer mu.Unlock()
	extention := fileman.Path_FileExtention(filepath)

	attributes := []string{}
	switchmap := map[string]string{}
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

	constants := configs.Manifest.Constants
	manifest := configs.Manifest
	assignable := []string{}
	_symclasses := []string{}
	_symclassData := map[string]*models.Style_Metadata{}
	SymclassIndexMap := map[string]int{}
	locales := []string{}
	assistfile := false

	if nav, ok := configs.Manifest.Lookup[filepath]; ok {
		assistfile = true
		if nav.Locale != nil {
			locales = nav.Locale
		}

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
	symclassdata := map[int]*models.Style_Metadata{}
	for i, v := range _symclasses {
		symclasses[v] = i
		symclassdata[i] = _symclassData[v]
	}

	REFER.SymclassIndexMap = SymclassIndexMap
	diagnostics := manifest.Diagnostics
	hashrules := configs.Style.Hashrules
	return R_Manifest{
		WatchFiles:   watchfiles,
		LiveCursor:   REFER.LiveCursor,
		Filepath:     filepath,
		WebviewUrl:   REFER.Url,
		WebviewPort:  REFER.Port,
		Attributes:   attributes,
		Extention:    extention,
		Constants:    constants,
		AssistFile:   assistfile,
		CustomTags:   configs.Static.CustomTags,
		Environment:  configs.Archive.Environment,
		Hashrules:    hashrules,
		SwitchMap:    switchmap,
		Assignable:   assignable,
		Symclasses:   symclasses,
		SymclassData: symclassdata,
		Locales:      locales,
		Diagnostics:  diagnostics,
	}
}
