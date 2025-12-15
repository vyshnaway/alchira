package models

type Compiler_Flavor struct {
	Name      string `json:"name"`
	Version   string `json:"version"`
	Sandbox   string `json:"sandbox"`
	Blueprint string `json:"blueprint"`
	Libraries string `json:"libraries"`
}

type Compiler_Config struct {
	Name    string `json:"name"`
	Version string `json:"version"`

	Flavour struct {
		Default   Compiler_Flavor            `json:"default"`
		Workspace map[string]Compiler_Flavor `json:"workspace"`
	} `json:"flavour"`
}
 