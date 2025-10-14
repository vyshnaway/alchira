package server

import (
	"fmt"
	"main/package/fileman"
	"net"
	"net/http"
	"path/filepath"
	"strconv"
)

var DATA = struct {
	Port             int
	Url              string
	SymclassIndexMap map[string]int
	WebviewState     map[string]any
}{
	Port:             0,
	Url:              "",
	SymclassIndexMap: map[string]int{},
	WebviewState:     map[string]any{},
}

// Returns an http.Server ready to Start, the found port, and any error.
// The server serves static files from 'view', always returns index.html for '/'.
func Create(tryport int) (httpServer *http.Server, deducedPort int, err error) {
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

	serveDir, ferr := fileman.Path_FromRoot("view")
	if ferr != nil {
		return nil, 0, fmt.Errorf("error resolving static dir: %v", ferr)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", handleWs)

	// Serve index.html on /, and all files under serveDir
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" || r.URL.Path == "/index.html" {
			http.ServeFile(w, r, filepath.Join(serveDir, "index.html"))
		} else {
			http.FileServer(http.Dir(serveDir)).ServeHTTP(w, r)
		}
	})

	server := &http.Server{
		Addr:    ":" + strconv.Itoa(foundPort),
		Handler: mux,
	}

	return server, foundPort, nil
}
