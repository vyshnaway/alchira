package server

import (
	"encoding/json"
	"fmt"
	"main/models"
)

// JSON-RPC message structures
type JsonRPCRequest struct {
	JSONRPC string `json:"jsonrpc"`
	ID      any    `json:"id"`
	Method  string `json:"method"`
	Params  any    `json:"params"`
}

type JsonRPCResponse struct {
	JSONRPC string `json:"jsonrpc"`
	ID      any    `json:"id,omitempty"`
	Method  string `json:"method"`
	Result  any    `json:"result,omitempty"`
	Error   any    `json:"error,omitempty"`
}

func IO_Json(req JsonRPCRequest) string {

	var resp JsonRPCResponse
	resp.JSONRPC = "2.0"
	resp.ID = req.ID
	resp.Method = req.Method

	switch req.Method {
	case "manifest":
		if params_, ok := req.Params.(map[string]any); ok {

			filepath, ok1 := params_["filepath"]
			filepath_, ok2 := filepath.(string)
			symclass, ok3 := params_["symclass"]
			symclass_, ok4 := symclass.(string)

			if ok1 && ok2 && ok3 && ok4 {

				manifest := ManifestFile(filepath_)
				resp.Result = manifest

				var resp_ JsonRPCResponse
				resp_.JSONRPC = "2.0"
				resp_.ID = req.ID
				resp_.Method = req.Method
				resp_.Result = Component(symclass_, models.Style_ClassIndexMap{})

				if message, e := json.Marshal(resp_); e == nil {
					broadcast <- message
				}

				break
			}
		}
		resp.Error = fmt.Errorf("invalid input parameteres")

	default:
		resp.Error = fmt.Errorf("invalid method")
	}

	if r, e := json.Marshal(resp); e == nil {
		return string(r)
	} else {
		return ""
	}
}
