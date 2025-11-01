package server

import (
	"encoding/json"
	"main/configs"
	"main/internal/action"
)

var InteractiveRegistar = map[string]struct {
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
		m := map[string]any{}
		for k, v := range Registery {
			m[k] = v.Instructions
		}
		result = m
	} else if s, e := Registery[command]; e {
		result = s.Interactive(arguments)
	}

	var r []byte
	if broadcast {
		r, _ = json.Marshal(JsonRPCResponse{
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

// JSON-RPC message structures
type JsonRPCRequest[T any] struct {
	JSONRPC string `json:"jsonrpc"`
	ID      any    `json:"id"`
	Method  string `json:"method"`
	Params  T      `json:"params"`
}

type JsonRPCResponse struct {
	JSONRPC string `json:"jsonrpc"`
	ID      any    `json:"id,omitempty"`
	Method  string `json:"method"`
	Result  any    `json:"result,omitempty"`
	Error   any    `json:"error,omitempty"`
}

type T_RegisterEntry struct {
	Instructions []string
	Interactive  func(arguments []string) any
	JsonStream   func(req []byte) (response any, broadcast bool)
}

func CreateMethod[T any](
	minargs int,
	Interactive func(arguments []string) any,
	JsonStream func(params T) any,
	Instructions []string,
	broadcast bool,
) T_RegisterEntry {
	template, _ := json.Marshal(new(T))
	return T_RegisterEntry{
		JsonStream: func(reqbyte []byte) (response any, broadcast bool) {
			var req JsonRPCRequest[T]
			if err := json.Unmarshal(reqbyte, &req); err != nil {
				return nil, false
			}
			return JsonStream(req.Params), broadcast
		},
		Interactive: func(arguments []string) any {
			if len(arguments) < minargs {
				return nil
			}
			return Interactive(arguments)
		},
		Instructions: append(Instructions, "Params: "+string(template)),
	}
}
