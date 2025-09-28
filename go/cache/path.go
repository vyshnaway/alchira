package cache

import (
	_types_ "main/types"
)

var Path = map[string]map[string]_types_.File_Source{
	"blueprint": {
		"scaffold": {
			Frags:     []string{"template", "scaffold"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"libraries": {
			Frags:     []string{"template", "libraries"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
	},
	"folder": {
		"scaffold": {
			Frags:     []string{"xtyles"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"autogen": {
			Frags:     []string{"xtyles", "autogen"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
		"artifacts": {
			Frags:     []string{"xtyles", "artifacts"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
		"archive": {
			Frags:     []string{"xtyles", "archive"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
		"arcversion": {
			Frags:     []string{"xtyles", "archive", "version"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
		"libraries": {
			Frags:     []string{"xtyles", "libraries"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
	},
	"css": {
		"atrules": {
			Frags:     []string{"xtyles", "#at-rules.css"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"constants": {
			Frags:     []string{"xtyles", "#constants.css"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"elements": {
			Frags:     []string{"xtyles", "#elements.css"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"extends": {
			Frags:     []string{"xtyles", "#extends.css"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
	},
	"json": {
		"configure": {
			Frags:     []string{"xtyles", "configure.jsonc"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"hashrule": {
			Frags:     []string{"xtyles", "hashrules.jsonc"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"archive": {
			Frags:     []string{"xtyles", "archive", "index.json"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
	},
	"md": {
		"readme": {
			Frags:     []string{"xtyles", "readme.md"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
		"licence": {
			Frags:     []string{"xtyles", "licence.md"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
		"reference": {
			Frags:     []string{"xtyles", "autogen", "reference.md"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
		"guildelines": {
			Frags:     []string{"xtyles", "autogen", "guildelines.md"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
	},
	"autogen": {
		"index": {
			Path:      "",
			Frags:     []string{"xtyles", "autogen", "preview", "index.css"},
			Content:   "",
			Essential: false,
		},
		"watch": {
			Path:      "",
			Frags:     []string{"xtyles", "autogen", "preview", "watch.css"},
			Content:   "",
			Essential: false,
		},
		"staple": {
			Path:      "",
			Frags:     []string{"xtyles", "autogen", "preview", "staple.htm"},
			Content:   "",
			Essential: false,
		},
		"ignore": {
			Path:      "",
			Frags:     []string{"xtyles", ".gitignore"},
			Content:   "autogen",
			Essential: false,
		},
		"manifest": {
			Path:      "",
			Frags:     []string{"xtyles", "autogen", "manifest.json"},
			Content:   "{}",
			Essential: false,
		},
	},
}
