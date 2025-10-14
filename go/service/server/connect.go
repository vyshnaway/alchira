package server

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"main/configs"
	"main/package/utils"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"
)

func Connect(tryport int) {
	// Start server
	server, port, err := Create(tryport)
	if err != nil {
		fmt.Println(0)
		return
	}

	DATA.Port = port
	DATA.Url = fmt.Sprintf("http://localhost:%d", port)

	// Signal handling for cleanup
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	// Use a buffered chan for manual exit (no panic on double-send)
	manualExit := make(chan struct{}, 1)

	// Start HTTP server in background
	serverDone := make(chan struct{})
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Println("HTTP server error:", err)
		}
		close(serverDone)
	}()

	Dryrun(Dryrun_Step_Initialize)

	scanner := bufio.NewScanner(os.Stdin)
	writer := bufio.NewWriter(os.Stdout)

	// Main input loop in its goroutine
	go func() {
		for scanner.Scan() {
			str := scanner.Text()
			if strings.HasPrefix(str, "$ ") {
				split := strings.Fields(str[2:])
				if len(split) < 1 {
					continue
				}
				command := split[0]
				arguments := split[1:]

				switch command {
				case "manifest":
					filepath := ""
					if len(arguments) > 0 {
						filepath = arguments[0]
					}
					result := ManifestFile(filepath)
					fmt.Fprintln(writer, utils.Code_JsonBuild(result, ""))

				case "webview":
					if len(arguments) > 0 {
						switch arguments[0] {
						case "info":
							fmt.Fprintln(writer, "Preview command received (not implemented)")
						}
					} else {
						fmt.Fprintln(writer, DATA.Url)
					}
				case "errors":
					fmt.Fprintln(writer, utils.Code_JsonBuild(configs.Manifest.Diagnostics, ""))
				case "states":
					fmt.Fprintln(writer, utils.Code_JsonBuild(DATA, ""))
				case "exit":
                    select { case manualExit <- struct{}{} : default: }
					return
				default:
					fmt.Fprintf(writer, "Unknown command: %s\n", command)
				}
				writer.Flush()
			} else {
				// JSON-RPC handler
				str = strings.TrimSpace(str)
				if str == "" {
					continue
				}
				var req JsonRPCRequest
				if err := json.Unmarshal([]byte(str), &req); err != nil {
					continue // skip invalid JSON
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
				fmt.Fprintln(writer, string(out))
				writer.Flush()
			}
		}
		if err := scanner.Err(); err != nil {
			fmt.Fprintln(os.Stderr, "Error reading from stdin:", err)
		}
		// On stdin close/EOF, trigger shutdown via manualExit as well (safe, non-blocking)
		select {
		case manualExit <- struct{}{}:
		default:
		}
	}()

	// Wait for exit signal, manual exit, or server exit
	select {
	case <-quit:
		fmt.Fprintln(os.Stderr, "Shutting down server (signal received)...")
	case <-manualExit:
		fmt.Fprintln(os.Stderr, "Shutting down server (exit command or stdin closed)...")
	case <-serverDone:
		fmt.Fprintln(os.Stderr, "Server exited.")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	server.Shutdown(ctx)
}
