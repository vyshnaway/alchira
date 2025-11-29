package models

type Package_Flavour struct {
	Name      string `json:"name"`
	Version   string `json:"version"`
	Sandbox   string `json:"sandbox"`
	Blueprint string `json:"blueprint"`
	Libraries string `json:"libraries"`
}

type Package_Json struct {
	Name    string          `json:"name"`
	Version string          `json:"version"`
	Flavour Package_Flavour `json:"flavour"`
}
