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
	ID     = "xcss"
	TLD    = "io"
	DOMAIN = ID + "." + TLD
)

var Root = models.Cache_Root{
	Name:            ID,
	Version:         VERSION,
	Extension:       ID,
	PollingInterval: 1000,
	WaitingInterval: 100,
	WebsocketPort:   1,
	Flavor: models.Compiler_Flavor{
		Name:      "",
		Version:   "",
		Sandbox:   "",
		Blueprint: "",
		Libraries: "",
	},
	Url: models.Cache_Url{
		Site:      "https://www." + DOMAIN + "/",
		Docs:      "https://www." + DOMAIN + "/cdn/",
		Worker:    "https://worker." + DOMAIN + "/",
		Console:   "https://console." + DOMAIN + "/",
		Vendors:   "https://vendors." + DOMAIN + "/",
		Artifacts: "https://artifact." + DOMAIN + "/",
	},
	Commands: map[string]string{
		"void":    "Void run, no execution.",
		"init":    "Initiate or Update & Verify setup.",
		"debug":   "Live build for developer environment",
		"server":  "LSP Communication Brige.",
		"preview": "Test build. Pass test for \"publish\" command.",
		// "iamai":   "Let ai agents start here.",
		// "publish": "Optimized build, uses web-api.",
		// "install": "Install external artifacts.",
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
		"style":  1,
		"staple": 2,
		"summon": 3,
	},
	CustomOp: map[string]rune{
		"attach": '~', // Rapid assign
		"strict": '+', // Rigid assign
		"assign": '=', // Final assign
		"append": '&', // Place assign
		"lodash": '#', // Load file-hash
	},
	CustomDirective: map[string]string{
		"attach": "@--attach",
		"assign": "@--assign",
	},
}

var Static = models.Cache_Static{
	WATCH:          false,
	DEBUG:          false,
	IAMAI:          false,
	MINIFY:         false,
	SERVER:         false,
	PREVIEW:        false,
	Command:        "",
	Argument:       "",
	RootPath:       "",
	WorkPath:       "",
	ProjectName:    "-",
	ProjectVersion: "0.0",
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

var Root_Flavor = map[string]*models.File_Source{
	"blueprint": {
		Frags:     []string{},
		Path:      "",
		Essential: true,
	},
	"libraries": {
		Frags:     []string{},
		Path:      "",
		Essential: true,
	},
	"sandbox": {
		Frags:     []string{},
		Path:      "",
		Essential: true,
	},
}
