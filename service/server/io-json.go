package server

import (
	"encoding/json"
	"fmt"
	"main/models"
	"main/package/watchman"
	"slices"
)

func IO_Json(req JsonRPCRequest) string {

	var resp JsonRPCResponse
	resp.JSONRPC = "2.0"
	resp.ID = req.ID

	switch req.Method {
	case "fileManifest":
		if params_, ok := req.Params.(map[string]any); ok {

			resp.Method = req.Method
			filepath, ok1 := params_["filepath"]
			filepath_, ok2 := filepath.(string)

			content, ok5 := params_["content"]
			content_, ok6 := content.(string)

			if ok5 && ok6 {
				REFER.watcher.HandleEvent(watchman.E_Action_Reload, filepath_, content_);
			}

			if ok1 && ok2 {
				manifest := ManifestFile(filepath_)
				resp.Result = manifest

				symclass, ok3 := params_["symclass"]
				symclass_, ok4 := symclass.(string)
				if ok3 && ok4 && slices.Contains(manifest.Attachable, symclass_) {
					var resp_ JsonRPCResponse
					resp_.JSONRPC = "2.0"
					resp_.ID = req.ID
					resp_.Method = "updateComponent"
					resp_.Result = Component(symclass_, models.Style_ClassIndexMap{})

					if message, e := json.Marshal(resp_); e == nil {
						broadcast <- message
					}

					break
				}
			}
		}
		resp.Error = fmt.Errorf("invalid input parameteres")

	case "initState":
		if m, ok := req.Params.(map[string]any); ok {
			key, _ := m["key"].(string)
			value := m["value"]
			if key != "" {
				if val, has := REFER.WebviewState[key]; has {
					value = val
				} else {
					REFER.WebviewState[key] = value
				}
				resp.Result = map[string]any{"key": key, "value": value}
				resp.Method = "updateState"
				b, _ := json.Marshal(resp)
				broadcast <- b
				if key == "live-preview-option-live-cursor" {
					REFER.LiveCursor = value.(bool)
				}
			}
		}

	case "setState":
		if m, ok := req.Params.(map[string]any); ok {
			key, _ := m["key"].(string)
			value := m["value"]
			if key != "" {
				REFER.WebviewState[key] = value
				resp.Result = map[string]any{"key": key, "value": value}
				resp.Method = "updateState"
				b, _ := json.Marshal(resp)
				broadcast <- b
				if key == "live-preview-option-live-cursor" {
					REFER.LiveCursor = value.(bool)
				}
			}
		}

	default:
		resp.Error = fmt.Errorf("invalid method")
	}

	if r, e := json.Marshal(resp); e == nil {
		return string(r)
	} else {
		return ""
	}
}

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
