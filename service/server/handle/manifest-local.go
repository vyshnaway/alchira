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
	Lodashes   []string                          `json:"hashes"`
	Assignable []string                          `json:"assignable"`
	Attachable []string                          `json:"attachable"`
	Symlinks   map[string]*models.Style_Metadata `json:"symlinks"`
}

type T_Manifest_Locals struct {
	AbsPath string `json:"abspath"`
	RelPath string `json:"relpath"`
	Content string `json:"content"`
}

func Manifest_Locals(filemap []T_Manifest_Locals, symlink string) map[string]*R_ManifestLocal {
	result := make(map[string]*R_ManifestLocal, len(filemap))
	for _, file := range filemap {
		if file.Content != "" {
			configs.Static.Watchman.HandleEvent(watchman.E_Method_Update, file.AbsPath, file.Content)
		}
	}
	for _, file := range filemap {
		result[file.RelPath] = Manifest_Local(file.RelPath, symlink)
	}
	return result
}

func Manifest_Local(filepath string, symlink string) *R_ManifestLocal {
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
	symlinkData := map[string]*models.Style_Metadata{}
	symlinkIndex := map[string]int{}
	lodashes := []string{}

	if nav, ok := configs.Manifest.Lookup[filepath]; ok {
		for h := range nav.Loadashes {
			lodashes = append(lodashes, h)
		}

		if nav.Type == models.File_Type_Artifact {
			if stash, er := manifest.Group.Artifact[nav.Id]; er {
				for k, i := range stash {
					symlinkIndex[k] = i
					attachable = append(attachable, k)
				}
			}
		} else {
			for _, K := range convertAndSort(slices.Collect(maps.Keys(manifest.Group.Axiom))) {
				KK := strconv.Itoa(K)
				for k, i := range manifest.Group.Axiom[KK] {
					symlinkIndex[k] = i
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
					symlinkIndex[k] = i
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
					symlinkIndex[k] = i
					attachable = append(attachable, k)
				}
			}

			for _, V := range manifest.Group.Global {
				for k, i := range V {
					symlinkIndex[k] = i
					attachable = append(attachable, k)
				}
			}

			if nav.Type != models.File_Type_Stylesheet {
				if stash, er := manifest.Group.Local[nav.Id]; er {
					for k, i := range stash {
						symlinkIndex[k] = i
						attachable = append(attachable, k)
						symlinkData[k] = MetadataFromIndex(i)
					}
				}
			}
		}
	}

	if index, ok := symlinkIndex[symlink]; ok {
		Sketchpad_Save(index)
	}

Return:
	return &R_ManifestLocal{
		Assignable: assignable,
		Attachable: attachable,
		Lodashes:   lodashes,
		Symlinks:   symlinkData,
	}
}
