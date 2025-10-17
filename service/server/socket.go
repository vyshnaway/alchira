package server

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

func handleWs(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	mutex.Lock()
	clients[ws] = true
	mutex.Unlock()

	defer func() {
		mutex.Lock()
		delete(clients, ws)
		mutex.Unlock()
		ws.Close()
	}()

	for {
		_, message, err := ws.ReadMessage()
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
					ws.WriteMessage(websocket.TextMessage, b)
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
					ws.WriteMessage(websocket.TextMessage, b)
					if key == "live-preview-option-live-cursor" {
						REFER.LiveCursor = value.(bool)
					}
				}
			}
		default:
			resp.Result = fmt.Sprintf("Got method: %s", req.Method)
			b, _ := json.Marshal(resp)
			ws.WriteMessage(websocket.TextMessage, b)
		}
	}
}
