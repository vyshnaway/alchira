package server

import (
	"encoding/json"
	"main/service/compiler"
	"time"
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

func IO_Json(reqbyte []byte) []byte {
	var req JsonRPCRequest[any]
	if err := json.Unmarshal(reqbyte, &req); err != nil {
		return []byte{}
	}

	var broadcast_bool bool
	var resp JsonRPCResponse
	resp.JSONRPC = "2.0"
	resp.ID = req.ID
	resp.Method = req.Method

	if entry, exist := Registery[req.Method]; exist {
		if res, duration := entry.JsonStream(reqbyte); res != nil {
			resp.Result = res
			resp.Duration = duration
			broadcast_bool = entry.Broadcast
		}
	} else {
		resp.Error = "invalid method"
	}

	if r, e := json.Marshal(resp); e == nil && len(r) > 0 {
		if broadcast_bool {
			WS_Broadcast <- r
		}
		return r
	}
	return []byte{}
}

// JSON-RPC message structures
type JsonRPCRequest[T any] struct {
	JSONRPC string `json:"jsonrpc"`
	ID      any    `json:"id"`
	Method  string `json:"method"`
	Params  T      `json:"params"`
}

type JsonRPCResponse struct {
	JSONRPC  string `json:"jsonrpc"`
	ID       any    `json:"id"`
	Method   string `json:"method"`
	Result   any    `json:"result"`
	Error    string `json:"error"`
	Duration int    `json:"duration"`
}

type T_RegisterEntry struct {
	Instructions []string
	Interactive  func(arguments []string) any
	JsonStream   func(req []byte) (response any, duration int)
	Broadcast    bool
	Duration     int64
}

func RegisterMethod[T any](
	minargs int,
	Interactive func(arguments []string) any,
	JsonStream func(params T) any,
	Instructions []string,
	broadcast bool,
) *T_RegisterEntry {
	template, _ := json.Marshal(new(T))
	e := &T_RegisterEntry{
		Broadcast:    broadcast,
		Instructions: append(Instructions, "Params: "+string(template)),
	}

	e.Interactive = func(arguments []string) any {
		if len(arguments) < minargs {
			return nil
		}
		res := Interactive(arguments)
		return res
	}

	e.JsonStream = func(reqbyte []byte) (response any, dutation int) {
		var req JsonRPCRequest[T]
		if err := json.Unmarshal(reqbyte, &req); err != nil {
			return nil, 0
		}
		start := time.Now()
		res := JsonStream(req.Params)
		e.Duration = compiler.CycleStamp + time.Since(start).Milliseconds()
		return res, int(e.Duration)
	}

	return e
}
