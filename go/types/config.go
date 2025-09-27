package types

type Config_Tweaks map[string]any

type Config_ProxyMap struct {
	Source     string              `json:"source"`
	Target     string              `json:"target"`
	Stylesheet string              `json:"stylesheet"`
	Extensions map[string][]string `json:"extensions"`
}

type Config_ProxyStorage struct {
	Source              string              
	Target              string              
	Stylesheet          string              
	Extensions          map[string][]string 
	StylesheetContent   string              
	Filepath_to_Content map[string]string   
}

type Config_Raw struct {
	Name      string            `json:"name"`
	Version   string            `json:"version"`
	Vendors   string            `json:"vendors"`
	Artifacts map[string]string `json:"artifacts"`
	ProxyMap  []Config_ProxyMap `json:"proxymap"`
	Tweaks    Config_Tweaks     `json:"tweaks"`
}

type Config_Archive struct {
	Name          string            `json:"name"`
	Version       string            `json:"version"`
	Tweaks        Config_Tweaks     `json:"tweaks,omitempty"`
	Vendors       string            `json:"vendors,omitempty"`
	Readme        string            `json:"readme,omitempty"`
	Licence       string            `json:"licence,omitempty"`
	ExportSheet   string            `json:"exportsheet,omitempty"`
	Artifacts     map[string]string `json:"artifacts,omitempty"`
	ProxyMap      []Config_ProxyMap `json:"proxymap,omitempty"`
	ExportClasses []string          `json:"exportclasses,omitempty"`
}
