package cache

import (
	_types_ "main/types"
)

var Sync_References = map[string]_types_.File_Source{
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
}

var Sync_Agreements = map[string]_types_.File_Source{
	"license": {
		Title:   "LICENSE",
		Url:     "license.md",
		Path:    "",
		Frags:   []string{"license.md"},
		Content: "",
	},
	"terms": {
		Title:   "TERMS & CONDITIONS",
		Url:     "terms.md",
		Path:    "",
		Frags:   []string{"terms.md"},
		Content: "",
	},
	"privacy": {
		Title:   "PRIVACY POLICY",
		Url:     "privacy.md",
		Path:    "",
		Frags:   []string{"privacy.md"},
		Content: "",
	},
}

var Sync_Blueprint = map[string]_types_.File_Source{
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
}
