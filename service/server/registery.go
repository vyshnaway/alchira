package server

import (
	"main/configs"
	"main/service/server/handle"
)

var Registery = map[string]T_RegisterEntry{
	"manifest-global": RegisterMethod(
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
	"manifest-locals": RegisterMethod(
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
	"manifest-Mixed": RegisterMethod(
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
	"sandbox-state-set": RegisterMethod(
		1,
		func(args []string) any {
			if len(args) > 1 {
				return handle.Sandbox_State_Set(args[0], args[1])
			}
			return handle.Sandbox_State_Mem[args[0]]
		},
		func(params struct {
			Key string `json:"key"`
			Val any    `json:"value"`
		}) any {
			return handle.Sandbox_State_Set(params.Key, params.Val)
		},
		[]string{
			`returns component-sandbox option states`,
		},
		true,
	),
	"sandbox-state-init": RegisterMethod(
		1,
		func(args []string) any {
			if len(args) > 1 {
				return handle.Sandbox_State_Init(args[0], args[1])
			}
			return handle.Sandbox_State_Mem[args[0]]
		},
		func(params struct {
			Key string `json:"key"`
			Val any    `json:"value"`
		}) any {
			return handle.Sandbox_State_Init(params.Key, params.Val)
		},
		[]string{
			`returns component-sandbox option states`,
		},
		true,
	),
	"sandbox-states": RegisterMethod(
		0,
		func(args []string) any {
			return handle.Sandbox_State_Mem
		},
		func(params any) any {
			return handle.Sandbox_State_Mem
		},
		[]string{
			`returns component-sandbox option states`,
		},
		true,
	),
	"sandbox-show": RegisterMethod(
		2,
		func(args []string) any {
			return handle.Sandbox_View(args[0], args[1])
		},
		func(params struct {
			Filepath string `json:"filepath"`
			Symclass string `json:"symclass"`
		}) any {
			return handle.Sandbox_View(params.Filepath, params.Symclass)
		},
		[]string{
			`sandbox-view {relative-filepath} {symclass}`,
		},
		true,
	),
	"sandbox-view": RegisterMethod(
		2,
		func(args []string) any {
			return handle.Sandbox_View(args[0], args[1])
		},
		func(params struct {
			Filepath string `json:"filepath"`
			Symclass string `json:"symclass"`
		}) any {
			return handle.Sandbox_View_Last
		},
		[]string{
			`sandbox-view {relative-filepath} {symclass}`,
		},
		true,
	),
	"symclass-summon": RegisterMethod(
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
		[]string{
			`symclass-summon {relative-filepath} {symclass}`,
		},
		false,
	),
	"sandbox-url": RegisterMethod(
		0,
		func(args []string) any {
			return "http://" + Session_Url
		},
		func(params any) any {
			return "http://" + Session_Url
		},
		[]string{
			`returns component-sandbox url`,
		},
		false,
	),
	"websocket-url": RegisterMethod(
		0,
		func(args []string) any {
			return "ws://" + Session_Url + "/ws"
		},
		func(params any) any {
			return "ws://" + Session_Url + "/ws"
		},
		[]string{
			`returns websocket url`,
		},
		false,
	),
	"session-port": RegisterMethod(
		0,
		func(args []string) any {
			return Session_Port
		},
		func(params any) any {
			return Session_Port
		},
		[]string{
			`returns session port`,
		},
		false,
	),
	"diagnostics": RegisterMethod(
		0,
		func(args []string) any {
			return configs.Manifest.Diagnostics
		},
		func(params any) any {
			return configs.Manifest.Diagnostics
		},
		[]string{
			`returns list of current diagnostics`,
		},
		false,
	),
}
