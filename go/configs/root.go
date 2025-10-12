package configs

import (
	_model "main/models"
)

const (
	id     = "xcss"
	domain = "xcss.io"
)

var Root = _model.Cache_Root{
	Name:      id,
	Version:   "0.0.0",
	Extension: id,
	Url: _model.Cache_Url{
		Site:      "https://www." + domain + "/",
		Docs:      "https://docs." + domain + "/",
		Worker:    "https://worker." + domain + "/",
		Console:   "https://console." + domain + "/",
		Vendors:   "https://vendors." + domain + "/",
		Artifacts: "https://artifact." + domain + "/",
	},
	Commands: map[string]string{
		"init":    "Initiate or Update & Verify setup.",
		"server":  "LSP Brige trigger.",
		"debug":   "Live build for developer environment",
		"preview": "Test build. Pass test for \"publish\" command.",
		"publish": "Optimized build, uses web-api.",
		"install": "Install external artifacts.",
	},
	Tweaks: _model.Config_Tweaks{
		"CacheUsage": false,
	},
	CustomElements: map[string]int{
		"style":  1,
		"staple": 2,
		"summon": 3,
	},
	CustomOperations: map[string]rune{
		"attach": '~',
		"assign": '=',
		"locale": '_',
	},
	CustomAtrules: map[string]string{
		"attach": "@--attach",
		"assign": "@--assign",
	},
}
