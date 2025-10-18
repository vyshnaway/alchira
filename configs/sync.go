package configs

import (
	_model "main/models"
)

var Sync_References = map[string]_model.File_Source{
	"readme": {
		Title:   "Documentation",
		Url:     "readme.md",
		Path:    "",
		Frags:   []string{"readme.md"},
		Content: "",
	},
	"alerts": {
		Title:   "Notifications",
		Url:     "alerts.md",
		Path:    "",
		Frags:   []string{"alerts.md"},
		Content: "",
	},
	"changelog": {
		Title:   "Changelog",
		Url:     "changelog.md",
		Path:    "",
		Frags:   []string{"changelog.md"},
		Content: "",
	},
	"agent": {
		Title:   "For AiAgents",
		Url:     "agent.md",
		Path:    "",
		Frags:   []string{"agent.md"},
		Content: "",
	},
}

var Sync_Agreements = map[string]_model.File_Source{
	"license": {
		Title:   "License",
		Url:     "license.md",
		Path:    "",
		Frags:   []string{"license.md"},
		Content: "",
	},
	"terms": {
		Title:   "Terms & Conditions",
		Url:     "terms.md",
		Path:    "",
		Frags:   []string{"terms.md"},
		Content: "",
	},
	"privacy": {
		Title:   "Privacy Policy",
		Url:     "privacy.md",
		Path:    "",
		Frags:   []string{"privacy.md"},
		Content: "",
	},
}

var Sync_Scaffold = map[string]_model.File_Source{
	"xcaffold": {
		Frags:     []string{"scaffold", "xcaffold"},
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
}
