package webview

import (
	"fmt"
	"main/package/fileman"
	"net"
	"net/http"
	"path/filepath"
	"strconv"
)

func getAvailablePort(requestedPort int) (int, error) {
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
		fmt.Printf("Serving static files from: \033[32m%s\033[0m\n", serveDir)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Println("HTTP server error:", err)
		}
	}()

	runLSPStdio()
	return 0, foundPort
}
