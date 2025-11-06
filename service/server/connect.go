package server

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"main/configs"
	"main/service/compiler"
	"slices"

	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"
)

func Connect(tryport int, concurrent bool) {
	// Start server
	server, port, err := Webview_Create(tryport)
	if err != nil {
		fmt.Println(0)
		return
	}
	Session_Port = port
	Session_Url = fmt.Sprintf("localhost:%d", port)
	// Start HTTP server in background
	serverDone := make(chan struct{})
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Println("HTTP server error:", err)
		}
		close(serverDone)
	}()

	// Signal handling for cleanup
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	// Use a buffered chan for manual exit (no panic on double-send)
	manualExit := make(chan struct{}, 1)

	go func() {
		scanner := bufio.NewScanner(os.Stdin)
		writer := bufio.NewWriter(os.Stdout)
		defer func() {
			if err := writer.Flush(); err != nil {
				fmt.Fprintln(os.Stderr, "Error flushing writer:", err)
			}
		}()

		go compiler.Execute("", concurrent)

		for scanner.Scan() {
			var res = []byte{}

			request := strings.TrimSpace(scanner.Text())
			if slices.Contains([]string{"exit", "> exit", "$ exit"}, request) {
				manualExit <- struct{}{}
				break
			} else if slices.Contains([]string{"help", "$ help", "> help"}, request) {
				m := map[string]any{}
				for k, v := range Registery {
					m[k] = v.Instructions
				}
				res, _ = json.MarshalIndent(m, "", "  ")

			} else if !configs.Static.Watchman.Status {
				time.Sleep(100 * time.Millisecond)
				continue
			} else if strings.HasPrefix(request, "$ ") || strings.HasPrefix(request, "> ") {
				split := strings.Fields(request[2:])
				if len(split) < 1 {
					continue
				}
				res = Interactive(split[0], split[1:], request[0] == '>')

			} else {

				res = IO_Json([]byte(request))
			}

			if len(res) > 0 {
				_, err := fmt.Fprintln(writer, string(res))
				if err != nil {
					fmt.Fprintln(os.Stderr, "Error writing response to stdout:", err)
					break
				}
			} 

			// Always check and handle flush error
			if err := writer.Flush(); err != nil {
				fmt.Fprintln(os.Stderr, "Error flushing writer:", err)
				break
			}
		}

		if err := scanner.Err(); err != nil {
			fmt.Fprintln(os.Stderr, "Error reading from stdin:", err)
		}
		manualExit <- struct{}{}
	}()

	// Wait for exit signal, manual exit, or server exit
	select {
	case <-quit:
		fmt.Fprintln(os.Stderr, "\nShutting down server (signal received)...")
	case <-manualExit:
		fmt.Fprintln(os.Stderr, "\nShutting down server (exit command or stdin closed)...")
	case <-serverDone:
		fmt.Fprintln(os.Stderr, "\nServer exited.")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	server.Shutdown(ctx)
}
