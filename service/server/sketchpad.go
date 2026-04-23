package server

import (
	"fmt"
	"main/configs"

	// "main/service/server/handle"
	"net"
	"net/http"
	"path/filepath"
	"strconv"
	"sync"

	// "time"

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
	serveDir := configs.Root_Flavor["sketchpad"].Path
	
	// Serve index.html on /, and all files under serveDir
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		
		if r.URL.Path == "/" || r.URL.Path == "/index.html" {
			http.ServeFile(w, r, filepath.Join(serveDir, "index.html"))
		} else {
			http.FileServer(http.Dir(serveDir)).ServeHTTP(w, r)
		}
	})

	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		WS_Upgrader.CheckOrigin = func(r *http.Request) bool { return true }
		ws, err := WS_Upgrader.Upgrade(w, r, nil)
		if err != nil {
			// Optionally log the error here for debugging
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
				// Connection closed or error reading message: clean exit
				break
			}
			if res := IO_Json(request); len(res) > 0 {
				WS_Mutex.Lock()
				err := ws.WriteMessage(websocket.TextMessage, res)
				WS_Mutex.Unlock()
				if err != nil {
					break
				}
			}
		}
	})

	go func() {
		for {
			msg, ok := <-WS_Broadcast
			if !ok {
				// Broadcast channel closed: exit goroutine cleanly
				return
			}

			WS_Mutex.Lock()
			for client := range WS_Clients {
				if err := client.WriteMessage(websocket.TextMessage, msg); err != nil {
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

	// go func() {
	// 	t := time.NewTicker(100 * time.Millisecond)
	// 	cycle := 0
	// 	for range t.C {
	// 		if handle.SketchpadDataDiffered() {
	// 			cycle = 5
	// 		} else if cycle == 0 {
	// 			continue
	// 		}
	// 		cycle--
	// 		Interactive("sketchpad-view", []string{}, true)
	// 	}
	// }()

	return server, foundPort, nil
}
