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
		console.Render.Raw(req)
		var resp JsonRPCResponse
		resp.JSONRPC = "2.0"
		resp.ID = req.ID

		switch req.Method {
		case "setState":
			fmt.Println("setState")
			if m, ok := req.Params.(map[string]any); ok {
				key, _ := m["key"].(string)
				value := m["value"]
				if key != "" {
					DATA.WebviewState[key] = value
					resp.Result = map[string]any{"key": key, "value": value}
					resp.Method = "updateState"
					b, _ := json.Marshal(resp)
					conn.WriteMessage(websocket.TextMessage, b)
				}
			}
		case "getState":
			fmt.Println("getState")
			if m, ok := req.Params.(map[string]any); ok {
				key, _ := m["key"].(string)
				v := DATA.WebviewState[key]
				resp.Result = map[string]any{"key": key, "value": v}
				resp.Method = "updateState"
				b, _ := json.Marshal(resp)
				conn.WriteMessage(websocket.TextMessage, b)
			}
		default:
			// Fallback: echo method
			resp.Result = fmt.Sprintf("Got method: %s", req.Method)
			b, _ := json.Marshal(resp)
			conn.WriteMessage(websocket.TextMessage, b)
		}
	}
}
