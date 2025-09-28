package cache

import (
	_types_ "main/types"
)

var Sync = map[string]map[string]_types_.File_Source{
	"DOCUMENTS": {
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
			Frags:   []string{"doc", "alerts.md"},
			Content: "",
		},
		"changelog": {
			Title:   "CHANGELOG",
			Url:     "changelog.md",
			Path:    "",
			Frags:   []string{"doc", "changelog.md"},
			Content: "",
		},
		"guildelines": {
			Title:   "GUIDELINES",
			Url:     "agentic.md",
			Path:    "",
			Frags:   []string{"doc", "guildelines.md"},
			Content: "",
		},
	},
	"AGREEMENT": {
		"license": {
			Title:   "LICENSE",
			Url:     "agreements-txt/license.txt",
			Path:    "",
			Frags:   []string{"license.txt"},
			Content: "",
		},
		"terms": {
			Title:   "TERMS & CONDITIONS",
			Url:     "agreements-txt/terms.txt",
			Path:    "",
			Frags:   []string{"terms.txt"},
			Content: "",
		},
		"privacy": {
			Title:   "PRIVACY POLICY",
			Url:     "agreements-txt/privacy.txt",
			Path:    "",
			Frags:   []string{"privacy.txt"},
			Content: "",
		},
	},
}
