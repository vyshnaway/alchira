package configs

import (
	_model "main/models"
)

const (
	id     = "xcss"
	domain = "xcss.io"
)

var Lodash_rune rune = '_'

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
		"iamai":   "Let ai agents start here.",
		"debug":   "Live build for developer environment",
		"server":  "LSP Communication Brige.",
		"preview": "Test build. Pass test for \"publish\" command.",
		"publish": "Optimized build, uses web-api.",
		"install": "Install external artifacts.",
	},
	Tweaks: _model.Config_Tweaks{
		"CacheUsage": false,
	},
	CustomTags: map[string]int{
		"style":             1,
		"staple":            2,
		"summon":            3,
		string(Lodash_rune): 4,
	},
	CustomOps: map[string]rune{
		"attach": '~',
		"assign": '=',
		"lodash": Lodash_rune,
	},
	CustomAtrules: map[string]string{
		"attach": "@--attach",
		"assign": "@--assign",
	},
}

var Root_Scaffold = map[string]_model.File_Source{
	"blueprint": {
		Frags:     []string{"scaffold", "blueprint"},
		Path:      "",
		Content:   "",
		Essential: true,
	},
	"libraries": {
		Frags:     []string{"scaffold", "libraries"},
		Path:      "",
		Content:   "",
		Essential: true,
	},
	"webview": {
		Frags:     []string{"webview"},
		Path:      "",
		Content:   "",
		Essential: true,
	},
}
