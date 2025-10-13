package server

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"strings"

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
	Result  any    `json:"result,omitempty"`
	Error   any    `json:"error,omitempty"`
}

var upgrader = websocket.Upgrader{}

// Serve the web page
func serveHome(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "index.html")
}

// Handle websocket JSON-RPC from browser
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
		if err := json.Unmarshal(message, &req); err == nil {
			var resp JsonRPCResponse
			resp.JSONRPC = "2.0"
			resp.ID = req.ID

			// Example: echo LSP initialize
			if req.Method == "initialize" {
				resp.Result = map[string]any{"capabilities": map[string]any{}}
			} else {
				resp.Result = fmt.Sprintf("Got method: %s", req.Method)
			}
			b, _ := json.Marshal(resp)
			conn.WriteMessage(websocket.TextMessage, b)
		}
	}
}

// Very basic LSP skeleton over stdio (for editor clients)
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

		// Very basic LSP initialize handler
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

func Server() {
	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		panic(err)
	}
	defer listener.Close()

	port := listener.Addr().(*net.TCPAddr).Port
	fmt.Printf("Server running on port %d\n", port)

	// Register handlers as usual
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello on port %d", port)
	})

	// Use http.Serve to listen on the chosen port
	http.Serve(listener, nil)
}
