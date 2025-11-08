package configs

import (
	_model "main/models"
)

var Sync_References = map[string]_model.File_Source{
	"readme": {
		Title:   "Documentation",
		Url:     "pages/readme.md",
		Path:    "",
		Frags:   []string{"readme.md"},
		Content: "",
	},
	"alerts": {
		Title:   "Notifications",
		Url:     "pages/alerts.md",
		Path:    "",
		Frags:   []string{"alerts.md"},
		Content: "",
	},
	"changelog": {
		Title:   "Changelog",
		Url:     "pages/changelog.md",
		Path:    "",
		Frags:   []string{"changelog.md"},
		Content: "",
	},
	"agent": {
		Title:   "For AiAgents",
		Url:     "pages/agent.md",
		Path:    "",
		Frags:   []string{"agent.md"},
		Content: "",
	},
}

var Sync_Agreements = map[string]_model.File_Source{
	"license": {
		Title:   "License",
		Url:     "pages/license.md",
		Path:    "",
		Frags:   []string{"license.md"},
		Content: "",
	},
	"terms": {
		Title:   "Terms & Conditions",
		Url:     "pages/terms.md",
		Path:    "",
		Frags:   []string{"terms.md"},
		Content: "",
	},
	"privacy": {
		Title:   "Privacy Policy",
		Url:     "pages/privacy.md",
		Path:    "",
		Frags:   []string{"privacy.md"},
		Content: "",
	},
}
