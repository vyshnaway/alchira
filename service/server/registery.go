package server

import (
	"main/configs"
	"main/service/server/handle"
)

var Registery = map[string]*T_RegisterEntry{
	"manifest-global": RegisterMethod(
		0,
		func(args []string) any {
			return handle.Manifest_Global()
		},
		func(params any) any {
			return handle.Manifest_Global()
		},
		[]string{
			`returns global-manifest of working directory`,
		},
		false,
	),
	"manifest-locals": RegisterMethod(
		1,
		func(args []string) any {
			filemap := make([]handle.T_Manifest_Locals, len(args))
			for _, f := range filemap {
				filemap = append(filemap, handle.T_Manifest_Locals{
					RelPath: f.RelPath,
					AbsPath: f.AbsPath,
				})
			}
			return handle.Manifest_Locals(filemap, "")
		},
		func(params struct {
			FileMap []handle.T_Manifest_Locals `json:"filemap"`
		}) any {
			return handle.Manifest_Locals(params.FileMap, "")
		},
		[]string{
			`manifest-locals {follow with maultiple filepaths to be refered}`,
		},
		false,
	),
	"manifest-mixed": RegisterMethod(
		0,
		func(args []string) any {
			return ""
		},
		func(params handle.T_Manifest_Mixed) any {
			res := handle.Manifest_Mixed(params)
			return res
		},
		[]string{},
		false,
	),
	"sketchpad-load": RegisterMethod(
		2,
		func(args []string) any {
			return handle.Sketchpad_Load(args[0], args[1])
		},
		func(params struct {
			Filepath string `json:"filepath"`
			Symlink  string `json:"symlink"`
		}) any {
			return handle.Sketchpad_Load(params.Filepath, params.Symlink)
		},
		[]string{
			`sketchpad-load {relative-filepath} {symlink}`,
		},
		true,
	),
	// XXX Mission 1: Sketchpad | Uncomment to Unlock
	// "sketchpad-view": RegisterMethod(
	// 	0,
	// 	func(args []string) any {
	// 		return handle.Sketchpad_View_Component
	// 	},
	// 	func(params any) any {
	// 		return handle.Sketchpad_View_Component
	// 	},
	// 	[]string{},
	// 	true,
	// ),
	"server-state-set": RegisterMethod(
		1,
		func(args []string) any {
			if len(args) > 1 {
				return handle.Sketchpad_State_Set(args[0], args[1])
			}
			return handle.Sketchpad_State_Mem[args[0]]
		},
		func(params struct {
			Key string `json:"key"`
			Val any    `json:"value"`
		}) any {
			return handle.Sketchpad_State_Set(params.Key, params.Val)
		},
		[]string{
			`returns component-sketchpad option states`,
		},
		true,
	),
	"server-state-init": RegisterMethod(
		1,
		func(args []string) any {
			if len(args) > 1 {
				return handle.Sketchpad_State_Init(args[0], args[1])
			}
			return handle.Sketchpad_State_Mem[args[0]]
		},
		func(params struct {
			Key string `json:"key"`
			Val any    `json:"value"`
		}) any {
			return handle.Sketchpad_State_Init(params.Key, params.Val)
		},
		[]string{
			`returns component-sketchpad option states`,
		},
		true,
	),
	"server-state-list": RegisterMethod(
		0,
		func(args []string) any {
			return handle.Sketchpad_State_Mem
		},
		func(params any) any {
			return handle.Sketchpad_State_Mem
		},
		[]string{
			`returns component-sketchpad option states`,
		},
		false,
	),
	"sketchpad-url": RegisterMethod(
		0,
		func(args []string) any {
			return "http://" + Session_Url
		},
		func(params any) any {
			return "http://" + Session_Url
		},
		[]string{
			`returns component-sketchpad url`,
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
	"rebuild": RegisterMethod(
		0,
		func(args []string) any {
			configs.Static.RebuildFlag.Store(true)
			return nil
		},
		func(params any) any {
			configs.Static.RebuildFlag.Store(true)
			return nil
		},
		[]string{
			`returns list of current diagnostics`,
		},
		false,
	),
}
