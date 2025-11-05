package server

import (
	"encoding/json"
	"fmt"
	"main/configs"
	"net"
	"net/http"
	"path/filepath"
	"strconv"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	Session_Port int
	Session_Url  string
	WS_Mutex     sync.Mutex
	WS_Clients   = make(map[*websocket.Conn]bool)
	WS_Broadcast = make(chan []byte)
	WS_Upgrader  = websocket.Upgrader{}
)

func RequestAvailablePort(tryPort int) (int, error) {
	if tryPort > 0 {
		ln, err := net.Listen("tcp", fmt.Sprintf(":%d", tryPort))
		if err == nil {
			port := ln.Addr().(*net.TCPAddr).Port
			ln.Close()
			return port, nil
		}
	}
	ln, err := net.Listen("tcp", ":0")
	if err != nil {
		return 0, fmt.Errorf("no available port found: %w", err)
	}
	port := ln.Addr().(*net.TCPAddr).Port
	ln.Close()
	return port, nil
}

// Returns an http.Server ready to Start, the found port, and any error.
// The server serves static files from 'view', always returns index.html for '/'.
func Webview_Create(tryport int) (httpServer *http.Server, deducedPort int, err error) {
	// Try requested port; fallback to OS-assigned port
	foundPort, err := RequestAvailablePort(tryport)

	if err != nil || foundPort == 0 {
		return nil, 0, fmt.Errorf("unable to bind port: %v", err)
	}

	mux := http.NewServeMux()
	serveDir := configs.Root_Scaffold["webview"].Path

	// Serve index.html on /, and all files under serveDir
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" || r.URL.Path == "/index.html" {
			http.ServeFile(w, r, filepath.Join(serveDir, "index.html"))
		} else {
			http.FileServer(http.Dir(serveDir)).ServeHTTP(w, r)
		}
	})

	mux.HandleFunc(
		"/ws",
		func(w http.ResponseWriter, r *http.Request) {
			WS_Upgrader.CheckOrigin = func(r *http.Request) bool { return true }
			ws, err := WS_Upgrader.Upgrade(w, r, nil)
			if err != nil {
				return
			}

			WS_Mutex.Lock()
			WS_Clients[ws] = true
			WS_Mutex.Unlock()

			defer func() {
				WS_Mutex.Lock()
				delete(WS_Clients, ws)
				WS_Mutex.Unlock()
				ws.Close()
			}()

			for {
				_, request, err := ws.ReadMessage()
				if err != nil {
					break
				}
				// Send response back via WebSocket, NOT ResponseWriter
				if err := ws.WriteMessage(websocket.TextMessage, IO_Json(request)); err != nil {
					break
				}
			}
		},
	)
	go func() {
		for {
			msg := <-WS_Broadcast
			WS_Mutex.Lock()
			for client := range WS_Clients {
				err := client.WriteMessage(websocket.TextMessage, msg)
				if err != nil {
					client.Close()
					delete(WS_Clients, client)
				}
			}
			WS_Mutex.Unlock()
		}
	}()

	server := &http.Server{
		Addr:    ":" + strconv.Itoa(foundPort),
		Handler: mux,
	}

	return server, foundPort, nil
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
		resp.Result, broadcast_bool = entry.JsonStream(reqbyte)
	} else {
		resp.Error = fmt.Errorf("invalid method")
	}

	if r, e := json.Marshal(resp); e == nil {
		if broadcast_bool {
			WS_Broadcast <- r
		}
		return r
	}
	return nil
}
