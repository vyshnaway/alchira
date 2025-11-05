package server

import (
	"encoding/json"
)

func Interactive(command string, arguments []string, broadcast bool) (Response []byte) {
	var result any
	var err string

	if s, e := Registery[command]; e {
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
	ID      any    `json:"id"`
	Method  string `json:"method"`
	Result  any    `json:"result"`
	Error   any    `json:"error"`
}

type T_RegisterEntry struct {
	Instructions []string
	Interactive  func(arguments []string) any
	JsonStream   func(req []byte) (response any, broadcast bool)
}

func RegisterMethod[T any](
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
			resp := JsonStream(req.Params)
			return resp, broadcast
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
