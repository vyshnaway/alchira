package configs

import (
	_model "main/models"
)

var Path_Folder = map[string]_model.File_Source{
	"blueprint": {
		Frags:     []string{ID},
		Essential: true,
	},
	"artifacts": {
		Frags:     []string{ID, "artifacts"},
		Essential: false,
	},
	"archive": {
		Frags:     []string{ID, "archive"},
		Essential: false,
	},
	"arcversion": {
		Frags:     []string{ID, "archive", "version"},
		Essential: false,
	},
	"libraries": {
		Frags:     []string{ID, "libraries"},
		Essential: false,
	},
	"libstatic": {
		Frags:     []string{ID, "libraries", "_scaffold_"},
		Essential: false,
	},
}

var Path_Css = map[string]_model.File_Source{
	"atrules": {
		Frags:     []string{ID, "#at-rules.css"},
		Essential: true,
	},
	"constants": {
		Frags:     []string{ID, "#constants.css"},
		Essential: true,
	},
	"elements": {
		Frags:     []string{ID, "#elements.css"},
		Essential: true,
	},
	"extends": {
		Frags:     []string{ID, "#extends.css"},
		Essential: true,
	},
}

var Path_Json = map[string]_model.File_Source{
	"configure": {
		Frags:     []string{ID, "configure.jsonc"},
		Essential: true,
	},
	"hashrule": {
		Frags:     []string{ID, "hashrules.jsonc"},
		Essential: true,
	},
	"vendors": {
		Frags:     []string{ID, "vendors.jsonc"},
		Essential: true,
	},
	"archive": {
		Frags:     []string{ID, "archive", "index.json"},
		Essential: false,
	},
}

var Path_Files = map[string]_model.File_Source{
	"readme": {
		Frags:     []string{ID, "readme.md"},
		Essential: false,
	},
	"licence": {
		Frags:     []string{ID, "licence.md"},
		Essential: false,
	},
	"changelog": {
		Frags:     []string{ID, "changelog.md"},
		Essential: false,
	},
}
