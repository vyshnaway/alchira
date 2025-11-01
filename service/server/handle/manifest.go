package handle

import (
	"main/configs"
	"main/package/watchman"
)

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
