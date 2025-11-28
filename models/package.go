package models

type Package_Configs struct {
	Compiler string `json:"compiler,omitempty"`
	Redirect struct {
		Blueprint string `json:"blueprint,omitempty"`
		Libraries string `json:"libraries,omitempty"`
		Sandbox   string `json:"sandbox,omitempty"`
	} `json:"redirect"`
}

type Package_Json struct {
	Name    string          `json:"name,omitempty"`
	Version string          `json:"version,omitempty"`
	Configs Package_Configs `json:"configs"`
}
