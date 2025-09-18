package types

type Config_Tweaks map[string]bool;

// ProxyMap represents the mapping configuration for proxying
type Config_ProxyMap struct {
    Source      string              `json:"source"`
    Target      string              `json:"target"`
    Stylesheet  string              `json:"stylesheet"`
    Extensions  map[string][]string `json:"extensions"`
}

// ProxyStorage extends ProxyMap with additional storage fields
type Config_ProxyStorage struct {
    Config_ProxyMap
    FileContents      map[string]string `json:"fileContents"`
    StylesheetContent string            `json:"stylesheetContent"`
}

// Base contains common fields for configuration types
type Config_Base struct {
    Name    string `json:"name"`
    Version string `json:"version"`
}

// Raw represents the raw configuration structure
type Config_Raw struct {
    Config_Base
    Vendors   string            `json:"vendors"`
    Artifacts map[string]string `json:"artifacts"`
    ProxyMap  []Config_ProxyMap `json:"proxymap"`
    Tweaks    Config_Tweaks     `json:"tweaks"`
}

// Archive represents the archive configuration structure
type Config_Archive struct {
    Config_Base
    Tweaks        *Config_Tweaks    `json:"tweaks,omitempty"`
    Vendors       *string           `json:"vendors,omitempty"`
    ProxyMap      []Config_ProxyMap `json:"proxymap,omitempty"`
    Artifacts     map[string]string `json:"artifacts,omitempty"`
    Readme        *string           `json:"readme,omitempty"`
    Licence       *string           `json:"licence,omitempty"`
    ExportSheet   *string           `json:"exportsheet,omitempty"`
    ExportClasses []string          `json:"exportclasses,omitempty"`
    Libraries     map[string]string `json:"libraries,omitempty"`
}