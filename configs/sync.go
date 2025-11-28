package configs

import (
	_model "main/models"
)

var Sync_References = map[string]_model.File_Source{
	"readme": {
		Title:   "Documentation",
		Url:     "documentation.md",
		Path:    "",
		Frags:   []string{"README.md"},
		Content: "",
	},
	"notices": {
		Title:   "Notifications",
		Url:     "notifications.md",
		Path:    "",
		Frags:   []string{"NOTICES.md"},
		Content: "",
	},
	"agent": {
		Title:   "For AiAgents",
		Url:     "agent-prompt.md",
		Path:    "",
		Frags:   []string{"PROMPT.md"},
		Content: "",
	},
}

var Sync_Agreements = map[string]_model.File_Source{
	"license": {
		Title:   "License",
		Url:     "agreements/license.md",
		Path:    "",
		Frags:   []string{"LICENSE.md"},
		Content: "",
	},
	"terms": {
		Title:   "Terms & Conditions",
		Url:     "agreements/terms.md",
		Path:    "",
		Frags:   []string{"TERMS.md"},
		Content: "",
	},
	"privacy": {
		Title:   "Privacy Policy",
		Url:     "agreements/privacy.md",
		Path:    "",
		Frags:   []string{"PRIVACY.md"},
		Content: "",
	},
}
