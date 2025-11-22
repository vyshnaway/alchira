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
	Assignable []string                          `json:"assignable"`
	Attachable []string                          `json:"attachable"`
	Symclasses map[string]*models.Style_Metadata `json:"symclasses"`
	lodashes   []string                          `json:"lodashes"`
}

type T_Manifest_Locals struct {
	AbsPath string `json:"abspath"`
	RelPath string `json:"relpath"`
	Content string `json:"content"`
}

func Manifest_Locals(filemap []T_Manifest_Locals, symclass string) map[string]*R_ManifestLocal {
	result := make(map[string]*R_ManifestLocal, len(filemap))
	for _, file := range filemap {
		if file.Content != "" {
			configs.Static.Watchman.HandleEvent(watchman.E_Method_Update, file.AbsPath, file.Content)
		}
	}
	for _, file := range filemap {
		result[file.RelPath] = Manifest_Local(file.RelPath, symclass)
	}
	return result
}

func Manifest_Local(filepath string, symclass string) *R_ManifestLocal {
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
	symclassIndex := map[string]int{}
	lodashes := []string{}

	if nav, ok := configs.Manifest.Lookup[filepath]; ok {

		if nav.Type == models.File_Type_Artifact {
			if stash, er := manifest.Group.Artifact[nav.Id]; er {
				for k, i := range stash {
					symclassIndex[k] = i
					attachable = append(attachable, k)
				}
			}
		} else {
			for _, K := range convertAndSort(slices.Collect(maps.Keys(manifest.Group.Axiom))) {
				KK := strconv.Itoa(K)
				for k, i := range manifest.Group.Axiom[KK] {
					symclassIndex[k] = i
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
				for k, i := range manifest.Group.Cluster[KK] {
					symclassIndex[k] = i
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
				for k, i := range V {
					symclassIndex[k] = i
					attachable = append(attachable, k)
				}
			}

			for _, V := range manifest.Group.Global {
				for k, i := range V {
					symclassIndex[k] = i
					attachable = append(attachable, k)
				}
			}

			if nav.Type != models.File_Type_Stylesheet {
				if stash, er := manifest.Group.Local[nav.Id]; er {
					for k, i := range stash {
						symclassIndex[k] = i
						attachable = append(attachable, k)
						symclassData[k] = MetadataFromIndex(i)
					}
				}
			}
		}
	}

	if index, ok := symclassIndex[symclass]; ok {
		Sandbox_Index(index)
	}

Return:
	return &R_ManifestLocal{
		Assignable: assignable,
		Attachable: attachable,
		lodashes:   lodashes,
		Symclasses: symclassData,
	}
}
