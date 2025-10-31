package handle

import "encoding/json"

type T_Sandbox_State JsonRPCRequest[struct {
	Key string `json:"key"`
	Val string `json:"value"`
}]

var D_Sandbox_State = map[string]any{}

func Sandbox_State(reqbyte []byte) (response any, broadcast bool) {
	var req T_Sandbox_State
	if err := json.Unmarshal(reqbyte, &req); err != nil {
		return
	}

	var key string
	var value any
	if val, exist := D_Sandbox_State[req.Params.Key]; exist {
		value = val
	} else {
		D_Sandbox_State[key] = value
	}

	return map[string]any{"key": key, "value": value}, true
}
