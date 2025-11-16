package configs

import (
	_model "main/models"
)

var Sync_References = map[string]_model.File_Source{
	"readme": {
		Title:   "Documentation",
		Url:     "documentation.md",
		Path:    "",
		Frags:   []string{"readme.md"},
		Content: "",
	},
	"alerts": {
		Title:   "Notifications",
		Url:     "notifications.md",
		Path:    "",
		Frags:   []string{"alerts.md"},
		Content: "",
	},
	"agent": {
		Title:   "For AiAgents",
		Url:     "agent-prompt.md",
		Path:    "",
		Frags:   []string{"agent.md"},
		Content: "",
	},
}

var Sync_Agreements = map[string]_model.File_Source{
	"license": {
		Title:   "License",
		Url:     "agreements/license.md",
		Path:    "",
		Frags:   []string{"license.md"},
		Content: "",
	},
	"terms": {
		Title:   "Terms & Conditions",
		Url:     "agreements/terms.md",
		Path:    "",
		Frags:   []string{"terms.md"},
		Content: "",
	},
	"privacy": {
		Title:   "Privacy Policy",
		Url:     "agreements/privacy.md",
		Path:    "",
		Frags:   []string{"privacy.md"},
		Content: "",
	},
}
