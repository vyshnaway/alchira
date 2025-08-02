package main

// T_PackageJson represents the structure of a package.json file
type T_PackageJson struct {
	Name     string                 `json:"name"`
	Version  string                 `json:"version"`
	Scripts  map[string]string      `json:"scripts"`
	Homepage string                 `json:"homepage"`
	Bin      map[string]interface{} `json:"bin"` // Can be string or map
	// Add other fields from your package.json as needed
}

// T_RootPackageEssential holds essential information from the root package.json
type T_RootPackageEssential struct {
	Name    string
	Version string
	Scripts map[string]string
	Website string
	Command []string // Keys from the 'bin' field
}
