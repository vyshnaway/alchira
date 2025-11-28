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

var Root = models.Cache_Root{
	Name:            id,
	Version:         "0.0.0",
	Extension:       id,
	PollingInterval: 200,
	WaitingInterval: 20,
	WebsocketPort:   1,
	Flavour: models.Package_Flavour{
		Name:      "",
		Version:   "",
		Sandbox:   "",
		Blueprint: "",
		Libraries: "",
	},
	Url: models.Cache_Url{
		Site:      "https://www." + domain + "/",
		Docs:      "https://www." + domain + "/cdn/",
		Worker:    "https://worker." + domain + "/",
		Console:   "https://console." + domain + "/",
		Vendors:   "https://vendors." + domain + "/",
		Artifacts: "https://artifact." + domain + "/",
	},
	Commands: map[string]string{
		"void":    "Void run, no execution.",
		"init":    "Initiate or Update & Verify setup.",
		"iamai":   "Let ai agents start here.",
		"debug":   "Live build for developer environment",
		"server":  "LSP Communication Brige.",
		"preview": "Test build. Pass test for \"publish\" command.",
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
		"strict": '!', // Rigid assign
		"assign": '=', // Final assign
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

var Root_Navigate = map[string]*models.File_Source{
	"blueprint": {
		Frags:     []string{"scaffold", "blueprint"},
		Path:      "",
		Essential: true,
	},
	"libraries": {
		Frags:     []string{"scaffold", "libraries"},
		Path:      "",
		Essential: true,
	},
	"sandbox": {
		Frags:     []string{"scaffold", "sandbox"},
		Path:      "",
		Essential: true,
	},
	"index": {
		Frags:     []string{"compiler", "index.go"},
		Path:      "",
		Essential: true,
	},
}
