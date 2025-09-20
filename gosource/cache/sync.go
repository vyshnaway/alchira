package cache

import (
	_types_ "main/types"
)

var Sync = map[string]map[string]_types_.File_Source{
	"MARKDOWN": {
		"readme": {
			Title:   "README",
			Url:     "readme.md",
			Path:    "",
			Frags:   []string{"readme.md"},
			Content: "",
		},
		"alerts": {
			Title:   "ALERTS",
			Url:     "alerts.md",
			Path:    "",
			Frags:   []string{"documents", "alerts.md"},
			Content: "",
		},
		"changelog": {
			Title:   "CHANGELOG",
			Url:     "changelog.md",
			Path:    "",
			Frags:   []string{"documents", "changelog.md"},
			Content: "",
		},
		"guildelines": {
			Title:   "guildelines",
			Url:     "agentic.md",
			Path:    "",
			Frags:   []string{"documents", "guildelines.md"},
			Content: "",
		},
	},
	"AGREEMENT": {
		"license": {
			Title:   "LICENSE",
			Url:     "agreements-txt/license.txt",
			Path:    "",
			Frags:   []string{"agreements", "license.txt"},
			Content: "",
		},
		"terms": {
			Title:   "TERMS & CONDITIONS",
			Url:     "agreements-txt/terms.txt",
			Path:    "",
			Frags:   []string{"agreements", "terms.txt"},
			Content: "",
		},
		"privacy": {
			Title:   "PRIVACY POLICY",
			Url:     "agreements-txt/privacy.txt",
			Path:    "",
			Frags:   []string{"agreements", "privacy.txt"},
			Content: "",
		},
	},
}
