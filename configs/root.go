package configs

import (
	"main/models"
	"main/package/watchman"
	"maps"
	"slices"
	"sync"
	"sync/atomic"
)

const (
	id     = "xcss"
	domain = "xcss.io"
)

var Lodash_rune rune = '_'

var Root = models.Cache_Root{
	Name:            id,
	Version:         "0.0.0",
	Extension:       id,
	PollingInterval: 600,
	WaitingInterval: 60,
	WebsocketPort:   1,

	Url: models.Cache_Url{
		Site:      "https://www." + domain + "/",
		Docs:      "https://www." + domain + "/cdn/",
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
	Tweaks: models.Config_Tweaks{
		"staple-prefix": "",
		// prefix for staple replacement tags
		"staple-suffix": "",
		// suffix for staple replacement tags
		"styles-prefix": "",
		// prefix for styles replacement tags
		"styles-suffix": "",
		// suffix for styles replacement tags
		
		// EXPERIMENTAL
		"reload-period": 0,
		// rebuild interval in seconds (min 10)
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
		"hyphen": '-',
		"lodash": Lodash_rune,
	},
	CustomAtrules: map[string]string{
		"attach": "@--attach",
		"assign": "@--assign",
	},
}

var Static = models.Cache_Static{
	WATCH:          false,
	DEBUG:          false,
	MINIFY:         false,
	SERVER:         false,
	EXPORT:         false,
	IAMAI:          false,
	Command:        "",
	Argument:       "",
	RootPath:       "",
	WorkPath:       "",
	ProjectName:    "",
	ProjectVersion: "",
	CustomTags:     slices.Collect(maps.Keys(Root.CustomTags)),
	ReplacementTags: func() map[string]int {
		res := map[string]int{}
		for k, v := range Root.CustomTags {
			res["<!--"+k+"-->"] = v
			res["<!--"+k+" -->"] = v
			res["<!-- "+k+"-->"] = v
			res["<!-- "+k+" -->"] = v
			res["<"+k+" />"] = v
			res["<"+k+"/>"] = v
		}
		return res
	}(),
	Watchman:      watchman.New(),
	ExecuteMutex:  sync.Mutex{},
	RebuildFlag:   atomic.Bool{},
	RebuildTicker: nil,
}

var Root_Scaffold = map[string]models.File_Source{
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
	"source": {
		Frags:     []string{"source"},
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
