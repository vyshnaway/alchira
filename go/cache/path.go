package cache

import (
	_types_ "main/types"
)

var Path = map[string]map[string]_types_.File_Source{
	"blueprint": {
		"scaffold": {
			Frags:     []string{"blueprint", "scaffold"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"libraries": {
			Frags:     []string{"blueprint", "libraries"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
	},
	"folder": {
		"scaffold": {
			Frags:     []string{id},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"autogen": {
			Frags:     []string{id, "autogen"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
		"artifacts": {
			Frags:     []string{id, "artifacts"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
		"archive": {
			Frags:     []string{id, "archive"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
		"arcversion": {
			Frags:     []string{id, "archive", "version"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
		"libraries": {
			Frags:     []string{id, "libraries"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
	},
	"css": {
		"atrules": {
			Frags:     []string{id, "#at-rules.css"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"constants": {
			Frags:     []string{id, "#constants.css"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"elements": {
			Frags:     []string{id, "#elements.css"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"extends": {
			Frags:     []string{id, "#extends.css"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
	},
	"json": {
		"configure": {
			Frags:     []string{id, "configure.jsonc"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"hashrule": {
			Frags:     []string{id, "hashrules.jsonc"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"vendors": {
			Frags:     []string{id, "vendors.jsonc"},
			Path:      "",
			Content:   "",
			Essential: true,
		},
		"archive": {
			Frags:     []string{id, "archive", "index.json"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
	},
	"md": {
		"readme": {
			Frags:     []string{id, "readme.md"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
		"licence": {
			Frags:     []string{id, "licence.md"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
		"reference": {
			Frags:     []string{id, "autogen", "reference.md"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
		"guildelines": {
			Frags:     []string{id, "autogen", "guildelines.md"},
			Path:      "",
			Content:   "",
			Essential: false,
		},
	},
	"autogen": {
		"index": {
			Path:      "",
			Frags:     []string{id, "autogen", "preview", "index.css"},
			Content:   "",
			Essential: false,
		},
		"watch": {
			Path:      "",
			Frags:     []string{id, "autogen", "preview", "watch.css"},
			Content:   "",
			Essential: false,
		},
		"staple": {
			Path:      "",
			Frags:     []string{id, "autogen", "preview", "staple.htm"},
			Content:   "",
			Essential: false,
		},
		"ignore": {
			Path:      "",
			Frags:     []string{id, ".gitignore"},
			Content:   "autogen",
			Essential: false,
		},
		"manifest": {
			Path:      "",
			Frags:     []string{id, "autogen", "manifest.json"},
			Content:   "{}",
			Essential: false,
		},
	},
}
