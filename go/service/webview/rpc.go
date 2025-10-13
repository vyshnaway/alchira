package webview

import (
	"bufio"
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
	"os"
	"strings"
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

func runLSPStdio() {
	reader := bufio.NewReader(os.Stdin)
	writer := bufio.NewWriter(os.Stdout)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			break
		}
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		var req JsonRPCRequest
		if err := json.Unmarshal([]byte(line), &req); err != nil {
			continue
		}
		var resp JsonRPCResponse
		resp.JSONRPC = "2.0"
		resp.ID = req.ID
		if req.Method == "initialize" {
			resp.Result = map[string]any{"capabilities": map[string]any{}}
		} else {
			resp.Result = fmt.Sprintf("Method: %s received", req.Method)
		}
		out, _ := json.Marshal(resp)
		writer.WriteString(string(out) + "\n")
		writer.Flush()
	}
}
// --- State for live preview, simple in-memory ---
var previewState = map[string]any{}

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
        var resp JsonRPCResponse
        resp.JSONRPC = "2.0"
        resp.ID = req.ID

        // --- VS Code-style message mapping ---
        switch req.Method {
        case "setState":
            if m, ok := req.Params.(map[string]any); ok {
                key, _ := m["key"].(string)
                value := m["value"]
                if key != "" {
                    previewState[key] = value
                    // Echo updateState as in VS Code host
                    resp.Result = map[string]any{"key": key, "value": value}
                    resp.Method = "updateState" // for browser mapping, add Method field
                    b, _ := json.Marshal(resp)
                    conn.WriteMessage(websocket.TextMessage, b)
                }
            }
        case "getState":
            if m, ok := req.Params.(map[string]any); ok {
                key, _ := m["key"].(string)
                v := previewState[key]
                resp.Result = map[string]any{"key": key, "value": v}
                resp.Method = "updateState"
                b, _ := json.Marshal(resp)
                conn.WriteMessage(websocket.TextMessage, b)
            }
        case "initialize":
            resp.Result = map[string]any{"capabilities": map[string]any{}}
            b, _ := json.Marshal(resp)
            conn.WriteMessage(websocket.TextMessage, b)
        default:
            // Fallback: echo method
            resp.Result = fmt.Sprintf("Got method: %s", req.Method)
            b, _ := json.Marshal(resp)
            conn.WriteMessage(websocket.TextMessage, b)
        }
    }
}
