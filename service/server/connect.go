package server

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"main/package/watchman"
	"main/service/compiler"

	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"
)

var Refer = struct {
	LatestComponent  any
	Port             int
	Active           bool
	Url              string
	LiveCursor       bool
	SymclassIndexMap map[string]int
	WebviewState     map[string]any
	watcher          *watchman.T_Watcher
}{
	Port:             0,
	Url:              "",
	Active:           false,
	LiveCursor:       false,
	SymclassIndexMap: map[string]int{},
	WebviewState:     map[string]any{},
	watcher:          nil,
}

func Connect(tryport int) {
	// Start server
	server, port, err := Webview_Create(tryport)
	if err != nil {
		fmt.Println(0)
		return
	}
	Refer.Port = port
	Refer.Url = fmt.Sprintf("http://localhost:%d", port)
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
			// Always flush the writer on exit to ensure all output is written.
			if err := writer.Flush(); err != nil {
				fmt.Fprintln(os.Stderr, "Error flushing writer:", err)
			}
		}()

		go compiler.Execute("")

		for scanner.Scan() {
			if compiler.WATCHER == nil {
				continue
			}
			request := strings.TrimSpace(scanner.Text())

			if strings.HasPrefix(request, "$ ") || strings.HasPrefix(request, "> ") {
				split := strings.Fields(request[2:])
				if len(split) < 1 {
					continue
				}
				command := split[0]
				arguments := split[1:]
				res := IO_Term(command, arguments, request[0] == '>')

				if res == "" {
					continue
				} else {
					_, err := fmt.Fprintln(writer, res)
					if err != nil {
						fmt.Fprintln(os.Stderr, "Error writing response to stdout:", err)
						break
					}
					if res == "0" {
						select {
						case manualExit <- struct{}{}:
						default:
						}
						break
					}
				}
			} else {
				var req JsonRPCRequest
				if err := json.Unmarshal([]byte(request), &req); err != nil {
					continue
				}
				_, err := fmt.Fprintln(writer, IO_Json(req))
				if err != nil {
					fmt.Fprintln(os.Stderr, "Error writing JSON to stdout:", err)
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

		// Non-blocking channel signal to prevent deadlock if already closed or sent
		select {
		case manualExit <- struct{}{}:
		default:
		}
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
