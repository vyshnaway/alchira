package handle

import (
	"main/configs"
	"main/internal/action"
	"main/internal/stash"
	"main/models"
	"main/package/watchman"
	"maps"
	"slices"
	"strconv"
)

type R_Manifest_IO struct {
	Attributes []string `json:"attributes"`
}

type R_ManifestGlobal struct {
	WatchFiles   []string                          `json:"watchfiles"`
	Environment  string                            `json:"environment"`
	CustomTags   []string                          `json:"customtags"`
	SwitchMap    map[string]string                 `json:"switchmap"`
	Hashrules    map[string]string                 `json:"hashrules"`
	Constants    map[string]string                 `json:"constants"`
	Symclasses   map[string]*models.Style_Metadata `json:"symclasses"`
	AttrubuteMap map[string]map[string][]string    `json:"attributemap"`
	Diagnostics  []*models.File_Diagnostic         `json:"diagnostics"`
}

func ManifestGlobal() *R_ManifestGlobal {
	configs.Static.ExecuteMutex.Lock()
	defer configs.Static.ExecuteMutex.Unlock()

	attributeMap := map[string]map[string][]string{}
	switchmap := map[string]string{}
	for _, tv := range stash.Cache.Targetdir {
		switchmap[tv.Source] = tv.Target
		switchmap[tv.Target] = tv.Source
		attributeMap[tv.Target] = tv.ExtnsProps
	}

	symclassData := map[string]*models.Style_Metadata{}
	AppendIndexMap := func(refMap models.Style_ClassIndexMap) {
		for k, v := range refMap {
			symclassData[k] = action.Index_Fetch(v).SrcData.Metadata
		}
	}
	AppendIndexMap(configs.Style.Global___Index)
	AppendIndexMap(configs.Style.Public___Index)
	AppendIndexMap(configs.Style.Library__Index)
	AppendIndexMap(configs.Style.Artifact_Index)

	return &R_ManifestGlobal{
		WatchFiles:   slices.Collect(maps.Keys(configs.Style.Filepath_to_Context)),
		Environment:  configs.Archive.Environment,
		CustomTags:   configs.Static.CustomTags,
		SwitchMap:    switchmap,
		Hashrules:    configs.Style.Hashrules,
		Constants:    configs.Manifest.Constants,
		Symclasses:   symclassData,
		AttrubuteMap: attributeMap,
		Diagnostics:  configs.Manifest.Diagnostics,
	}
}

type R_ManifestLocal struct {
	Assignable   []string                          `json:"assignable"`
	Attachable   []string                          `json:"attachable"`
	Diagnostics  []*models.File_Diagnostic         `json:"diagnostics"`
	SymclassData map[string]*models.Style_Metadata `json:"symclassData"`
}

func ManifestLocal(filepath string) *R_ManifestLocal {
	configs.Static.ExecuteMutex.Lock()
	defer configs.Static.ExecuteMutex.Unlock()

	MetadataFromIndex := func(index int) *models.Style_Metadata {
		return action.Index_Fetch(index).SrcData.Metadata
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
	attachable := []string{}
	symclassData := map[string]*models.Style_Metadata{}

	if nav, ok := configs.Manifest.Lookup[filepath]; ok {

		if nav.Type == models.File_Type_Artifact {
			if stash, er := manifest.Group.Artifact[nav.Id]; er {
				for k := range stash {
					attachable = append(attachable, k)
				}
			}
		} else {
			for _, K := range convertAndSort(slices.Collect(maps.Keys(manifest.Group.Axiom))) {
				KK := strconv.Itoa(K)
				for k := range manifest.Group.Axiom[KK] {
					attachable = append(attachable, k)
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
				for k := range manifest.Group.Cluster[KK] {
					attachable = append(attachable, k)
				}
				if nav.Id == KK {
					goto Return
				}
				for k := range manifest.Group.Cluster[KK] {
					assignable = append(assignable, k)
				}
			}

			for _, V := range manifest.Group.Artifact {
				for k := range V {
					attachable = append(attachable, k)
				}
			}

			for _, V := range manifest.Group.Global {
				for k := range V {
					attachable = append(attachable, k)
				}
			}

			if nav.Type != models.File_Type_Stylesheet {
				if stash, er := manifest.Group.Local[nav.Id]; er {
					for k, v := range stash {
						attachable = append(attachable, k)
						symclassData[k] = MetadataFromIndex(v)
					}
				}
			}
		}
	}

Return:
	return &R_ManifestLocal{
		Assignable:   assignable,
		Attachable:   attachable,
		SymclassData: symclassData,
	}
}

type R_Manifest struct {
	Global *R_ManifestGlobal           `json:"global"`
	Locals map[string]*R_ManifestLocal `json:"locals"`
}

func Manifest(filepaths map[string]string) R_Manifest {
	localManifest := map[string]*R_ManifestLocal{}
	for filepath, filecontent := range filepaths {
		if configs.Style.Filepath_to_Context[filepath] != nil {
			if filecontent != "" {
				configs.Static.Watchman.HandleEvent(watchman.E_Action_Update, filepath, filecontent)
			}
			localManifest[filepath] = ManifestLocal(filepath)
		}
	}
	return R_Manifest{
		Global: ManifestGlobal(),
		Locals: localManifest,
	}
}
