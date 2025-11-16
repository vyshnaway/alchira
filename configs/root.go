package configs

import (
	"main/models"
	"main/package/watchman"
	"maps"
	"slices"
	"sync"
	"sync/atomic"
	"time"
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
	RebuildInterval: 60000,
	PollingInterval: 600,
	WaitingInterval: 60,
	WebsocketPort:   0,

	Url: models.Cache_Url{
		Cdn:       "https://cdn." + domain + "/",
		Site:      "https://www." + domain + "/",
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
	RebuildTicker: &time.Ticker{},
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
