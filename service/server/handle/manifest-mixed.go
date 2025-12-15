package handle

import (
	"main/configs"
	"main/package/watchman"
)

type R_Manifest_Mixed struct {
	Global *R_ManifestGlobal           `json:"global"`
	Locals map[string]*R_ManifestLocal `json:"locals"`
}

type T_Manifest_Mixed struct {
	ActiveFilepath string              `json:"filepath"`
	ActiveSymclass string              `json:"symclass"`
	FileMap        []T_Manifest_Locals `json:"filemap"`
}

func Manifest_Mixed(req T_Manifest_Mixed) R_Manifest_Mixed {
	localManifest := map[string]*R_ManifestLocal{}
	for _, f := range req.FileMap {
		if f.Content != "" {
			configs.Static.Watchman.HandleEvent(watchman.E_Method_Update, f.AbsPath, f.Content)
		}
	}
	for _, f := range req.FileMap {
		if f.RelPath == req.ActiveFilepath {
			localManifest[f.RelPath] = Manifest_Local(f.RelPath, req.ActiveSymclass)
		} else {
			localManifest[f.RelPath] = Manifest_Local(f.RelPath, "")
		}
	}
	return R_Manifest_Mixed{
		Global: Manifest_Global(),
		Locals: localManifest,
	}
}
