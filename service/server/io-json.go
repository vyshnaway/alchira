package server

import (
	"encoding/json"
	"fmt"
	"main/models"
	"main/package/fileman"
	"main/package/watchman"
	"main/service/compiler"
	"sync"
)

var M_ComopnentUpdate sync.Mutex

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

			if ok1 && ok2 {
				abspath, err := fileman.Path_Resolves(filepath_)
				content, ok5 := params_["content"]
				content_, ok6 := content.(string)
				if ok5 && ok6 && err == nil {
					compiler.WATCHER.HandleEvent(watchman.E_Action_Update, abspath, content_)
				}

				fileManifest, styleManifest := ManifestFile(filepath_)
				resp.Result = fileManifest

				var sm JsonRPCResponse
				sm.JSONRPC = "2.0"
				sm.ID = req.ID
				sm.Method = "styleManifest"
				sm.Result = styleManifest
				if message, e := json.Marshal(sm); e == nil {
					broadcast <- message
				}

				symclass, ok3 := params_["symclass"]
				symclass_, ok4 := symclass.(string)
				if _, k := styleManifest.Symclasses[symclass_]; ok3 && ok4 && k {
					var uc JsonRPCResponse
					uc.JSONRPC = "2.0"
					uc.ID = req.ID
					uc.Method = "updateComponent"
					uc.Result = Component(symclass_, models.Style_ClassIndexMap{})
					if message, e := json.Marshal(uc); e == nil {
						broadcast <- message
					}
					M_ComopnentUpdate.Lock()
					Refer.LatestComponent = uc
					M_ComopnentUpdate.Unlock()
				}
				break
			}
		}
		resp.Error = fmt.Errorf("invalid input parameteres")

	case "updateComponent":
		M_ComopnentUpdate.Lock()
		if Refer.LatestComponent != nil {
			b, _ := json.Marshal(Refer.LatestComponent)
			broadcast <- b
		}
		M_ComopnentUpdate.Unlock()

	case "setState":
		if m, ok := req.Params.(map[string]any); ok {
			key, _ := m["key"].(string)
			value := m["value"]
			if key != "" {
				Refer.WebviewState[key] = value
				resp.Result = map[string]any{"key": key, "value": value}
				resp.Method = "updateState"
				b, _ := json.Marshal(resp)
				broadcast <- b
				if key == "live-preview-option-live-cursor" {
					Refer.LiveCursor = value.(bool)
				}
			}
		}

	case "getState":
		if m, ok := req.Params.(map[string]any); ok {
			key, _ := m["key"].(string)
			value := m["value"]
			if key != "" {
				if val, has := Refer.WebviewState[key]; has {
					value = val
				} else {
					Refer.WebviewState[key] = value
				}
				resp.Result = map[string]any{"key": key, "value": value}
				resp.Method = "updateState"
				b, _ := json.Marshal(resp)
				broadcast <- b
				if key == "live-preview-option-live-cursor" {
					Refer.LiveCursor = value.(bool)
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
