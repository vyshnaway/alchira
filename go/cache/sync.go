package cache

import (
	_types_ "main/types"
)

var Sync = map[string]map[string]_types_.File_Source{
	"references": {
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
			Frags:   []string{"alerts.md"},
			Content: "",
		},
		"changelog": {
			Title:   "CHANGELOG",
			Url:     "changelog.md",
			Path:    "",
			Frags:   []string{"changelog.md"},
			Content: "",
		},
		"guildelines": {
			Title:   "GUIDELINES",
			Url:     "agentic.md",
			Path:    "",
			Frags:   []string{"guildelines.md"},
			Content: "",
		},
	},
	"agreements": {
		"license": {
			Title:   "LICENSE",
			Url:     "agreements-txt/license.md",
			Path:    "",
			Frags:   []string{"license.md"},
			Content: "",
		},
		"terms": {
			Title:   "TERMS & CONDITIONS",
			Url:     "agreements-txt/terms.md",
			Path:    "",
			Frags:   []string{"terms.md"},
			Content: "",
		},
		"privacy": {
			Title:   "PRIVACY POLICY",
			Url:     "agreements-txt/privacy.md",
			Path:    "",
			Frags:   []string{"privacy.md"},
			Content: "",
		},
	},
}
