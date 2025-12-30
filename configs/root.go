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
	ID     = "alchira"
	TLD    = "io"
	EXT    = "al"
	DOMAIN = ID + "." + TLD
)

var Root = models.Cache_Root{
	Name:            ID,
	Version:         VERSION,
	Extension:       EXT,
	PollingInterval: 1000,
	WaitingInterval: 100,
	WebsocketPort:   1,
	Flavor: models.Compiler_Flavor{
		Name:      "",
		Version:   "",
		Sketchpad: "",
		Blueprint: "",
		Libraries: "",
	},
	Url: models.Cache_Url{
		Cdn:       "https://cdn." + DOMAIN + "/",
		Site:      "https://www." + DOMAIN + "/",
		Worker:    "https://worker." + DOMAIN + "/",
		Console:   "https://console." + DOMAIN + "/",
		Vendors:   "https://vendors." + DOMAIN + "/",
		Artifacts: "https://artifact." + DOMAIN + "/",
	},
	Commands: map[string]string{
		"void":    "Void run, no execution.",
		"init":    "Initiate or Update & Verify setup.",
		"debug":   "Verbose output compilation.",
		"watch":   "Preview command in live watch mode.",
		"server":  "LSP Communication Brige.",
		"preview": "Test build. Pass test for \"publish\" command.",
		// "iamai":   "Let ai agents start here.",
		// "publish": "Optimized build, uses web-api.",
		// "install": "Install external artifacts.",
	},
	Tweaks: models.Config_Tweaks{
		"sketch-prefix": "",
		// prefix for sketch replacement tags
		"sketch-suffix": "",
		// suffix for sketch replacement tags
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
		"sketch": 2,
	},
	CustomOp: map[string]rune{
		"apply":  '+', // Rigid assign
		"attach": '~', // Rapid assign
		"assign": '=', // Final assign
		"lodash": '#', // Load file-hash
	},
	CustomDirective: map[string]string{
		"apply":  "@--apply",
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
	"sketchpad": {
		Frags:     []string{},
		Path:      "",
		Essential: true,
	},
}
