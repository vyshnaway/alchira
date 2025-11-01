package handle

import (
	"main/configs"
	"main/internal/action"
	"main/models"
	"main/package/watchman"
	"maps"
	"slices"
	"strconv"
)

type R_ManifestLocal struct {
	Assignable   []string                          `json:"assignable"`
	Attachable   []string                          `json:"attachable"`
	Diagnostics  []*models.File_Diagnostic         `json:"diagnostics"`
	SymclassData map[string]*models.Style_Metadata `json:"symclassData"`
}

func Manifest_Locals(filemap map[string]string) map[string]*R_ManifestLocal {
	result := make(map[string]*R_ManifestLocal, len(filemap))
	for filePath, fileContent := range filemap {
		if fileContent != "" {
			configs.Static.Watchman.HandleEvent(watchman.E_Action_Update, filePath, fileContent)
		}
	}
	for filepath := range filemap {
		result[filepath] = Manifest_Local(filepath)
	}
	return result
}

func Manifest_Local(filepath string) *R_ManifestLocal {
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
