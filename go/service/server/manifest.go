package server

import (
	_config "main/configs"
	"main/internal/stash"
	_models "main/models"
	"main/package/console"
	"main/package/fileman"
	"maps"
	"slices"
	"strconv"
	"strings"
)

type R_Manifest struct {
	Environment  string                             `json:"enviranment"`
	FileSwitch   string                             `json:"fileswitch"`
	Attributes   []string                           `json:"attributes"`
	CustomTags   []string                           `json:"customtags"`
	Attachable   []string                           `json:"attachable"`
	Assignable   []string                           `json:"assignable"`
	SymclassData map[string]*_models.Style_Metadata `json:"symclassData"`
	Locales      []string                           `json:"locales"`
	Diagnostics  []_models.File_Diagnostic          `json:"diagnostics"`
	Hashrules    map[string]string                  `json:"hashrules"`
	Constants    map[string]string                  `json:"constants"`
}

func ManifestFile(filepath string) R_Manifest {
	fileswitch := filepath
	for _, tv := range stash.Cache.Targetdir {
		if fileman.Path_IsSubpath(tv.Source, filepath) {
			fileswitch = strings.Replace(filepath, tv.Source, tv.Target, 1)
		}
		if fileman.Path_IsSubpath(tv.Target, filepath) {
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

	manifest := _config.Manifest
	attachable := []string{}
	assignable := []string{}
	symclassData := map[string]*_models.Style_Metadata{}
	locales := []string{}

	if nav, ok := _config.Manifest.Lookup[filepath]; ok {
		console.Render.Raw(nav)
		if nav.Locale != nil {
			locales = nav.Locale
		}

		if nav.Type == _models.File_Type_Artifact {
			if stash, er := manifest.Group.Artifact[nav.Id]; er {
				for k, v := range stash {
					attachable = append(attachable, k)
					symclassData[k] = v
				}
			}
		} else {
			for _, K := range convertAndSort(slices.Collect(maps.Keys(manifest.Group.Axiom))) {
				KK := strconv.Itoa(K)
				for k, v := range manifest.Group.Axiom[KK] {
					attachable = append(attachable, k)
					symclassData[k] = v
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
					symclassData[k] = v
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
					symclassData[k] = v
				}
			}

			for _, V := range manifest.Group.Global {
				for k, v := range V {
					attachable = append(attachable, k)
					symclassData[k] = v
				}
			}

			if nav.Type != _models.File_Type_Stylesheet {
				if stash, er := manifest.Group.Local[nav.Id]; er {
					for k, v := range stash {
						attachable = append(attachable, k)
						symclassData[k] = v
					}
				}
			}
		}
	}

Return:
	errors := manifest.Diagnostics
	hashrules := _config.Style.Hashrules
	return R_Manifest{
		CustomTags:   CustomTags,
		Environment:  _config.Archive.Environment,
		Hashrules:    hashrules,
		FileSwitch:   fileswitch,
		Attachable:   attachable,
		Assignable:   assignable,
		SymclassData: symclassData,
		Locales:      locales,
		Diagnostics:  errors,
	}
}

var CustomTags = slices.Collect(maps.Keys(_config.Root.CustomAtrules))
