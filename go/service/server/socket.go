package server

import (
	"encoding/json"
	"fmt"
	"main/package/console"
	"net/http"

	"github.com/gorilla/websocket"
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

var upgrader = websocket.Upgrader{}

func handleWs(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	REFER.wstream = conn
	defer conn.Close()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			break
		}
		var req JsonRPCRequest
		if err := json.Unmarshal(message, &req); err != nil {
			continue
		}
		var resp JsonRPCResponse
		resp.JSONRPC = "2.0"
		resp.ID = req.ID

		switch req.Method {
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
					conn.WriteMessage(websocket.TextMessage, b)
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
					conn.WriteMessage(websocket.TextMessage, b)
					if key == "live-preview-option-live-cursor" {
						REFER.LiveCursor = value.(bool)
					}
				}
			}
		default:
			resp.Result = fmt.Sprintf("Got method: %s", req.Method)
			b, _ := json.Marshal(resp)
			conn.WriteMessage(websocket.TextMessage, b)
		}
		console.Render.Raw(req)
		console.Render.Raw(REFER.WebviewState)
	}
}
