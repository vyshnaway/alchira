package server

import (
	"main/configs"
	// "main/internal/action"
)

type T_Component_return struct {
	Staple     string `json:"staple"`
	Summon     string `json:"summon"`
	Symclass   string `json:"symclass"`
	Attributes string `json:"attributes"`
	Rootcss    string `json:"rootcss"`
	Compcss    string `json:"compcss"`
}

func Component(symclass string) T_Component_return {
	// action.Inde

	return T_Component_return{
		Staple:     "",
		Summon:     "",
		Attributes: "",
		Rootcss:    configs.Delta.IndexBuild,
		Compcss:    "",
	}
}
