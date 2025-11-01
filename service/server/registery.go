package server

import (
	"main/service/server/handle"
)

var Registery = map[string]T_RegisterEntry{
	"manifest-global": CreateMethod(
		0,
		func(args []string) any {
			return handle.Manifest_Global()
		},
		func(params any) any {
			return handle.Manifest_Global
		},
		[]string{
			`returns global-manifest of working directory`,
		},
		false,
	),
	"manifest-locals": CreateMethod(
		1,
		func(args []string) any {
			filemap := map[string]string{}
			for _, f := range filemap {
				filemap[f] = ""
			}
			return handle.Manifest_Locals(filemap)
		},
		func(params struct {
			FileMap map[string]string `json:"filemap"`
		}) any {
			return handle.Manifest_Locals(params.FileMap)
		},
		[]string{
			`manifest-locals {follow with maultiple filepaths to be refered}`,
		},
		false,
	),
	"manifest-Mixed": CreateMethod(
		0,
		func(args []string) any {
			return ""
		},
		func(params struct {
			FileMap map[string]string `json:"filemap"`
		}) any {
			return handle.Manifest_Mixed(params.FileMap)
		},
		[]string{},
		false,
	),
	"sandbox-state": CreateMethod(
		0,
		func(args []string) any {
			return handle.Sandbox_State_Memory
		},
		func(params struct {
			Key string `json:"key"`
			Val string `json:"value"`
		}) any {
			return handle.Sandbox_State(params.Key, params.Val)
		},
		[]string{
			`returns component-sandbox option states`,
		},
		true,
	),
	"sandbox-view": CreateMethod(
		2,
		func(args []string) any {
			return ""
		},
		func(params struct {
			Symclass string `json:"symclass"`
			Filepath string `json:"filepath"`
		}) any {
			return handle.Sandbox_View(params.Symclass, params.Filepath)
		},
		[]string{},
		true,
	),
	"symclass-summon": CreateMethod(
		2,
		func(args []string) any {
			return handle.Symclass_Summon(args[0], args[1])
		},
		func(params struct {
			Symclass string
			Filepath string
		}) any {
			return handle.Symclass_Summon(params.Symclass, params.Filepath)
		},
		[]string{},
		false,
	),
	"sandbox-url": CreateMethod(
		0,
		func(args []string) any {
			return ""
		},
		func(params struct {
			Symclass string
			Filepath string
		}) any {
			return handle.Symclass_Summon(params.Symclass, params.Filepath)
		},
		[]string{},
		false,
	),
}
