package server

import (
	"bufio"
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"main/package/fileman"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
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
		if err := json.Unmarshal(message, &req); err == nil {
			var resp JsonRPCResponse
			resp.JSONRPC = "2.0"
			resp.ID = req.ID
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

// Always returns an actually available port—not zero!
func getAvailablePort(requestedPort int) (int, error) {
	// Try the requested port
	if requestedPort > 0 {
		ln, err := net.Listen("tcp", fmt.Sprintf(":%d", requestedPort))
		if err == nil {
			port := ln.Addr().(*net.TCPAddr).Port
			ln.Close()
			return port, nil
		}
	}
	// Fallback: ask OS for any available port
	ln, err := net.Listen("tcp", ":0")
	if err != nil {
		return 0, fmt.Errorf("no available port found")
	}
	port := ln.Addr().(*net.TCPAddr).Port
	ln.Close()
	return port, nil
}

func Create(port int) (Exitcode int, actualPort int) {
	foundPort, err := getAvailablePort(port)
	if err != nil || foundPort == 0 {
		fmt.Println("Failed to find available port:", err)
		return 1, 0
	}
	serveDir, _ := fileman.Path_FromRoot("view")
	absServeDir, err := filepath.Abs(serveDir)
	if err != nil {
		fmt.Println("Could not resolve absolute path for static files:", err)
		absServeDir = serveDir // fallback to relative
	}
	mux := http.NewServeMux()
	// Always mount /ws first, so it isn't shadowed
	mux.HandleFunc("/ws", handleWs)
	// This serves index.html for requests to "/"
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" || r.URL.Path == "/index.html" {
			http.ServeFile(w, r, filepath.Join(serveDir, "index.html"))
		} else {
			http.FileServer(http.Dir(serveDir)).ServeHTTP(w, r)
		}
	})

	srv := &http.Server{Addr: ":" + strconv.Itoa(foundPort), Handler: mux}

	go func() {
		url := fmt.Sprintf("http://localhost:%d", foundPort)
		fmt.Printf("Web app is running. Open in browser: \033[36m%s\033[0m\n", url)
		fmt.Printf("Serving static files from: \033[32m%s\033[0m\n", absServeDir)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Println("HTTP server error:", err)
		}
	}()

	runLSPStdio()
	return 0, foundPort
}
