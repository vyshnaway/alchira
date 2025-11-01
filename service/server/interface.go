package server

import (
	"encoding/json"
	"main/configs"
	"main/internal/action"
	"main/service/server/handle"
)

var InteractiveRegistary = map[string]struct {
	Info string
	Func func([]string) any
}{
	"summon": {
		Func: func(args []string) any {
			if len(args) == 2 {
				filepath, symclass := args[0], args[1]
				if context, ok := configs.Style.Filepath_to_Context[filepath]; ok {
					if res := action.Index_Finder(symclass, context.StyleData.LocalMap); res.Index > 0 {
						return res.Data.SrcData.SummonSnippet
					}
				}
			}
			return nil
		},
		Info: `summon {relative-filepath} {symclass}`,
	},
	"manifest-locals": {
		Func: func(args []string) any {
			filemap := map[string]string{}
			for _, f := range filemap {
				filemap[f] = ""
			}
			return handle.Manifest_Locals(filemap)
		},
		Info: `manifest-locals {follow with maultiple filepaths to be refered}`,
	},
	"manifest-global": {
		Func: func(args []string) any {
			return handle.Manifest_Global()
		},
		Info: `returns global-manifest of working directory`,
	},
	"sandbox-state": {
		Func: func(args []string) any {
			return handle.Sandbox_State_Memory
		},
		Info: `returns component-sandbox option states`,
	},
	"sandbox-url": {
		Func: func(args []string) any {
			return WS_Url
		},
		Info: `returns component-sandbox url`,
	},
	"websocket-url": {
		Func: func(args []string) any {
			return WS_Url + "/ws"
		},
		Info: `returns component-sandbox url`,
	},
	"diagnostics": {
		Func: func(args []string) any {
			return configs.Manifest.Diagnostics
		},
		Info: `returns list of current diagnostics`,
	},
}

func Interactive(command string, arguments []string, broadcast bool) (Response []byte) {
	var result any
	var err string

	if command == "help" {
		m := map[string]string{}
		for k, v := range InteractiveRegistary {
			m[k] = v.Info
		}
		result = m
	} else if s, e := InteractiveRegistary[command]; e {
		result = s.Func(arguments)
	}

	var r []byte
	if broadcast {
		r, _ = json.Marshal(handle.JsonRPCResponse{
			JSONRPC: "2.0",
			ID:      0,
			Method:  command,
			Result:  result,
			Error:   err,
		})
		WS_Broadcast <- r
	} else {
		r, _ = json.MarshalIndent(result, "", " ")
	}
	return r
}
