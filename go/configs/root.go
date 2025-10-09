package cache

import (
	_model "main/models"
)

const (
	id     = "xcss"
	tld    = "io"
	domain = id + "." + tld
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
		"debug":   "Live build for developer environment",
		"preview": "Test build. Pass test for \"publish\" command.",
		"publish": "Optimized build, uses web-api.",
		"install": "Install external artifacts.",
		"version": "Returns version.",
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
		"locale": '-',
	},
	CustomAtrules: map[string]string{
		"attach": "@--attach",
		"assign": "@--assign",
	},
}
