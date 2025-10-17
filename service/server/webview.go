package server

import (
	"fmt"
	"main/package/fileman"
	"main/package/watchman"
	"net"
	"net/http"
	"path/filepath"
	"strconv"
	"sync"

	"github.com/gorilla/websocket"
)

var REFER = struct {
	Port             int
	Url              string
	LiveCursor       bool
	SymclassIndexMap map[string]int
	WebviewState     map[string]any
	watcher          *watchman.T_Watcher
}{
	Port:             0,
	Url:              "",
	LiveCursor:       false,
	SymclassIndexMap: map[string]int{},
	WebviewState:     map[string]any{},
	watcher:          nil,
}



var (
	mutex     sync.Mutex                       // Protects clients map
	clients   = make(map[*websocket.Conn]bool) // Connected clients
	broadcast = make(chan []byte)              // Broadcast channel
	upgrader  = websocket.Upgrader{}
)

// Returns an http.Server ready to Start, the found port, and any error.
// The server serves static files from 'view', always returns index.html for '/'.
func Webview_Create(tryport int) (httpServer *http.Server, deducedPort int, err error) {
	// Try requested port; fallback to OS-assigned port
	foundPort, err := func(requestedPort int) (int, error) {
		if requestedPort > 0 {
			ln, err := net.Listen("tcp", fmt.Sprintf(":%d", requestedPort))
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
	}(tryport)

	if err != nil || foundPort == 0 {
		return nil, 0, fmt.Errorf("unable to bind port: %v", err)
	}

	serveDir, ferr := fileman.Path_FromRoot("webview")
	if ferr != nil {
		return nil, 0, fmt.Errorf("error resolving static dir: %v", ferr)
	}

	mux := http.NewServeMux()

	// Serve index.html on /, and all files under serveDir
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" || r.URL.Path == "/index.html" {
			http.ServeFile(w, r, filepath.Join(serveDir, "index.html"))
		} else {
			http.FileServer(http.Dir(serveDir)).ServeHTTP(w, r)
		}
	})

	mux.HandleFunc("/ws", handleWs)
	// handleBroadcasts
	go func() {
		for {
			msg := <-broadcast
			mutex.Lock()
			for client := range clients {
				err := client.WriteMessage(websocket.TextMessage, msg)
				if err != nil {
					client.Close()
					delete(clients, client)
				}
			}
			mutex.Unlock()
		}
	}()

	server := &http.Server{
		Addr:    ":" + strconv.Itoa(foundPort),
		Handler: mux,
	}

	return server, foundPort, nil
}
