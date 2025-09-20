package cache

import (
	_types_ "main/types"
)

const (
	id     = "xcss"
	domain = id + ".io"
)

var Root = _types_.Cache_Root{
	Bin:       "",
	Name:      id,
	Version:   "0.0.0",
	Extension: id,
	Url: _types_.Cache_Url{
		Cdn:       "https://cdn." + domain + "/",
		Site:      "https://www." + domain + "/",
		Worker:    "https://worker." + domain + "/",
		Console:   "https://console." + domain + "/",
		Prefixes:  "https://prefix." + domain + "/",
		Artifacts: "https://artifact." + domain + "/",
	},
	Commands: map[string]string{
		"init":    "Initiate or Update & Verify setup.",
		"debug":   "Live build for developer environment",
		"preview": "Test build. Pass test for \"publish\" command.",
		"publish": "Optimized build, uses web-api.",
		"install": "Install external artifacts.",
	},
	Scripts: map[string]string{
		"init":    "init",
		"debug":   "debug watch",
		"watch":   "preview watch",
		"preview": "preview",
		"publish": "publish",
		"install": "install",
	},
	Tweaks: _types_.Config_Tweaks{
		"CacheUsage": false,
	},
	CustomElements: map[string]int{
		"style":  1,
		"staple": 2,
		"summon": 3,
	},
	CustomOperations: map[string]string{
		"attach": "~",
		"assign": "=",
	},
	CustomAtrules: map[string]string{
		"attach": "@--attach",
		"assign": "@--assign",
	},
}

var Prefix = _types_.Cache_Prefix{
	Atrules:    map[string]map[string]string{},
	Attributes: map[string]map[string]string{},
	Pseudos:    map[string]map[string]string{},
	Classes:    map[string]map[string]string{},
	Elements:   map[string]map[string]string{},
	Values:     map[string]map[string]map[string]string{},
}
