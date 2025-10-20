package configs

import (
	_model "main/models"
)

const (
	id     = "xcss"
	domain = "xcss.io"
)

var locale_rune = '-'

var Root = _model.Cache_Root{
	Name:      id,
	Version:   "0.0.0",
	Extension: id,
	Interval: 200,
	Url: _model.Cache_Url{
		Site:      "https://www." + domain + "/",
		Docs:      "https://docs." + domain + "/",
		Worker:    "https://worker." + domain + "/",
		Console:   "https://console." + domain + "/",
		Vendors:   "https://vendors." + domain + "/",
		Artifacts: "https://artifact." + domain + "/",
	},
	Commands: map[string]string{
		"init":     "Initiate or Update & Verify setup.",
		"debug":    "Live build for developer environment",
		"server":   "LSP Communication Brige.",
		"preview":  "Test build. Pass test for \"publish\" command.",
		"publish":  "Optimized build, uses web-api.",
		"install":  "Install external artifacts.",
	},
	Tweaks: _model.Config_Tweaks{
		"CacheUsage": false,
	},
	CustomTags: map[string]int{
		"style":  1,
		"staple": 2,
		"summon": 3,
		string(locale_rune): 4,
	},
	CustomOperations: map[string]rune{
		"attach": '~',
		"assign": '=',
		"locale": locale_rune,
	},
	CustomAtrules: map[string]string{
		"attach": "@--attach",
		"assign": "@--assign",
	},
}
