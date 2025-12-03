package configs

import (
	_model "main/models"
)

var Path_Folder = map[string]_model.File_Source{
	"blueprint": {
		Frags:     []string{id},
		Essential: true,
	},
	"artifacts": {
		Frags:     []string{id, "artifacts"},
		Essential: false,
	},
	"archive": {
		Frags:     []string{id, "archive"},
		Essential: false,
	},
	"arcversion": {
		Frags:     []string{id, "archive", "version"},
		Essential: false,
	},
	"libraries": {
		Frags:     []string{id, "libraries"},
		Essential: false,
	},
	"libstatic": {
		Frags:     []string{id, "libraries", "_scaffold_"},
		Essential: false,
	},
}

var Path_Css = map[string]_model.File_Source{
	"atrules": {
		Frags:     []string{id, "#at-rules.css"},
		Essential: true,
	},
	"constants": {
		Frags:     []string{id, "#constants.css"},
		Essential: true,
	},
	"elements": {
		Frags:     []string{id, "#elements.css"},
		Essential: true,
	},
	"extends": {
		Frags:     []string{id, "#extends.css"},
		Essential: true,
	},
}

var Path_Json = map[string]_model.File_Source{
	"configure": {
		Frags:     []string{id, "configure.jsonc"},
		Essential: true,
	},
	"hashrule": {
		Frags:     []string{id, "hashrules.jsonc"},
		Essential: true,
	},
	"vendors": {
		Frags:     []string{id, "vendors.jsonc"},
		Essential: true,
	},
	"archive": {
		Frags:     []string{id, "archive", "index.json"},
		Essential: false,
	},
}

var Path_Files = map[string]_model.File_Source{
	"readme": {
		Frags:     []string{id, "readme.md"},
		Essential: false,
	},
	"licence": {
		Frags:     []string{id, "licence.md"},
		Essential: false,
	},
	"changelog": {
		Frags:     []string{id, "changelog.md"},
		Essential: false,
	},
}
