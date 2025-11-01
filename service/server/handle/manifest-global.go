package handle

import (
	"main/configs"
	"main/internal/action"
	"main/internal/stash"
	"main/models"
	"maps"
	"slices"
)

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
