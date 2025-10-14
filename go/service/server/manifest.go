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
	"strings"
	"sync"
)

type R_Manifest struct {
	WebviewPort  int                               `json:"webviewport"`
	WebviewUrl   string                            `json:"webviewurl"`
	Filepath     string                            `json:"filepath"`
	Extention    string                            `json:"extention"`
	AssistFile   bool                              `json:"assistfile"`
	Environment  string                            `json:"environment"`
	FileSwitch   string                            `json:"fileswitch"`
	Locales      []string                          `json:"locales"`
	Attributes   []string                          `json:"attributes"`
	Attachable   []string                          `json:"attachable"`
	Assignable   []string                          `json:"assignable"`
	CustomTags   []string                          `json:"customtags"`
	Hashrules    map[string]string                 `json:"hashrules"`
	Constants    map[string]string                 `json:"constants"`
	Diagnostics  []models.File_Diagnostic          `json:"diagnostics"`
	SymclassData map[string]*models.Style_Metadata `json:"symclassData"`
}

func manifestFromIndex(index int) *models.Style_Metadata {
	return action.Index_Fetch(index).Metadata
}

func ManifestFile(filepath string) R_Manifest {
	var mu sync.Mutex
	mu.Lock()
	defer mu.Unlock()
	fileswitch := filepath
	extention := fileman.Path_FileExtention(filepath)
	attributes := []string{}
	for _, tv := range stash.Cache.Targetdir {
		if fileman.Path_IsSubpath(tv.Source, filepath) {
			if res, ok := tv.ExtnsProps[extention]; ok {
				attributes = res
			}
			fileswitch = strings.Replace(filepath, tv.Source, tv.Target, 1)
		}
		if fileman.Path_IsSubpath(tv.Target, filepath) {
			if res, ok := tv.ExtnsProps[extention]; ok {
				attributes = res
			}
			fileswitch = strings.Replace(filepath, tv.Target, tv.Source, 1)
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
	attachable := []string{}
	assignable := []string{}
	symclassData := map[string]*models.Style_Metadata{}
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
					attachable = append(attachable, k)
					symclassData[k] = manifestFromIndex(v)
				}
			}
		} else {
			for _, K := range convertAndSort(slices.Collect(maps.Keys(manifest.Group.Axiom))) {
				KK := strconv.Itoa(K)
				for k, v := range manifest.Group.Axiom[KK] {
					attachable = append(attachable, k)
					SymclassIndexMap[k] = v
					symclassData[k] = manifestFromIndex(v)
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
					attachable = append(attachable, k)
					SymclassIndexMap[k] = v
					symclassData[k] = manifestFromIndex(v)
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
					attachable = append(attachable, k)
					SymclassIndexMap[k] = v
					symclassData[k] = manifestFromIndex(v)
				}
			}

			for _, V := range manifest.Group.Global {
				for k, v := range V {
					attachable = append(attachable, k)
					SymclassIndexMap[k] = v
					symclassData[k] = manifestFromIndex(v)
				}
			}

			if nav.Type != models.File_Type_Stylesheet {
				if stash, er := manifest.Group.Local[nav.Id]; er {
					for k, v := range stash {
						attachable = append(attachable, k)
						SymclassIndexMap[k] = v
						symclassData[k] = manifestFromIndex(v)
					}
				}
			}
		}
	}

Return:
	DATA.SymclassIndexMap = SymclassIndexMap
	diagnostics := manifest.Diagnostics
	hashrules := configs.Style.Hashrules
	return R_Manifest{
		Filepath:     filepath,
		WebviewUrl:   DATA.Url,
		WebviewPort:  DATA.Port,
		Attributes:   attributes,
		Extention:    extention,
		Constants:    constants,
		AssistFile:   assistfile,
		CustomTags:   configs.Static.CustomTags,
		Environment:  configs.Archive.Environment,
		Hashrules:    hashrules,
		FileSwitch:   fileswitch,
		Attachable:   attachable,
		Assignable:   assignable,
		SymclassData: symclassData,
		Locales:      locales,
		Diagnostics:  diagnostics,
	}
}
