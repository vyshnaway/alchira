package handle

import (
	"main/configs"
	"main/internal/action"
	"main/internal/stash"
	"main/models"
)

type R_ManifestGlobal struct {
	FileAttributes map[string][]string               `json:"fileToAttributes"`
	Environment    string                            `json:"environment"`
	CustomTags     []string                          `json:"customtags"`
	SwitchMap      map[string]string                 `json:"switchmap"`
	Hashrules      map[string]string                 `json:"hashrules"`
	Constants      map[string]string                 `json:"constants"`
	Symclasses     map[string]*models.Style_Metadata `json:"symclasses"`
	Diagnostics    []*models.File_Diagnostic         `json:"diagnostics"`
}

func Manifest_Global() *R_ManifestGlobal {
	configs.Static.ExecuteMutex.Lock()
	defer configs.Static.ExecuteMutex.Unlock()

	switchmap := map[string]string{}
	for _, tv := range stash.Cache.Targetdir {
		switchmap[tv.Source] = tv.Target
		switchmap[tv.Target] = tv.Source
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

	file_attribs := make(map[string][]string, len(configs.Style.Filepath_to_Context))
	for filepath, context := range configs.Style.Filepath_to_Context {
		file_attribs[filepath] = context.WatchAttrs
	}

	return &R_ManifestGlobal{
		FileAttributes: file_attribs,
		Environment:    configs.Archive.Environment,
		CustomTags:     configs.Static.CustomTags,
		SwitchMap:      switchmap,
		Hashrules:      configs.Style.Hashrules,
		Constants:      configs.Manifest.Constants,
		Symclasses:     symclassData,
		Diagnostics:    configs.Manifest.Diagnostics,
	}
}
