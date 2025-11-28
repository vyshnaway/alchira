package models

type Package_Flavour struct {
	Name      string `json:"name,omitempty"`
	Version   string `json:"version,omitempty"`
	Sandbox   string `json:"sandbox,omitempty"`
	Blueprint string `json:"blueprint,omitempty"`
	Libraries string `json:"libraries,omitempty"`
}

type Package_Json struct {
	Name    string          `json:"name,omitempty"`
	Version string          `json:"version,omitempty"`
	Flavour Package_Flavour `json:"flavour"`
}
