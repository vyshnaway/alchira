package handle

import "encoding/json"

func Initialize() {
}

var Registery = map[string]func(req []byte) (response any, broadcast bool){
	"manifest-global": CreateMethod(
		false,
		func(params any) any {
			return Manifest_Global
		},
	),
	"manifest-locals": CreateMethod(
		false,
		func(params struct {
			FileMap map[string]string `json:"filemap"`
		}) any {
			return Manifest_Locals(params.FileMap)
		},
	),
	"manifest-Mixed": CreateMethod(
		false,
		func(params struct {
			FileMap map[string]string `json:"filemap"`
		}) any {
			return Manifest_Mixed(params.FileMap)
		},
	),
	"sandbox-state": CreateMethod(
		true,
		func(params struct {
			Key string `json:"key"`
			Val string `json:"value"`
		}) any {
			return Sandbox_State(params.Key, params.Val)
		},
	),
	"sandbox-view": CreateMethod(
		true,
		func(params struct {
			Symclass string `json:"symclass"`
			Filepath string `json:"filepath"`
		}) any {
			return Sandbox_View(params.Symclass, params.Filepath)
		},
	),
	"symclass-summon": CreateMethod(
		false,
		func(params struct {
			Symclass string
			Filepath string
		}) any {
			return Symclass_Summon(params.Symclass, params.Filepath)
		},
	),
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

func CreateMethod[T any](
	broadcast bool,
	function func(params T) any,
) func(reqbyte []byte) (response any, broadcast bool) {
	r := func(reqbyte []byte) (response any, broadcast bool) {
		var req JsonRPCRequest[T]
		if err := json.Unmarshal(reqbyte, &req); err != nil {
			return nil, false
		}
		return function(req.Params), broadcast
	}
	return r
}
