package server

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"main/configs"
	"main/package/utils"
	"main/package/watchman"
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
	REFER.Port = port
	REFER.Url = fmt.Sprintf("http://localhost:%d", port)
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

	Dryrun(Dryrun_Step_Initialize, false)

	scanner := bufio.NewScanner(os.Stdin)
	writer := bufio.NewWriter(os.Stdout)

	go func() {
		for scanner.Scan() {
			str := scanner.Text()
			if strings.HasPrefix(str, "$ ") || strings.HasPrefix(str, "> ") {
				usejsonrpc := true
				jsongap := ""
				if str[0] == '$' {
					usejsonrpc = false
					jsongap = "  "
				}

				format := func(method string, data any) string {
					result := ""
					if usejsonrpc {
						result = utils.Code_JsonBuild(JsonRPCResponse{
							JSONRPC: "2.0",
							ID:      0,
							Method:  method,
							Result:  data,
						}, jsongap)
					} else {
						result = utils.Code_JsonBuild(data, jsongap)
					}
					return result
				}

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
					fmt.Fprintln(writer, format("file-manifest", result))

				case "webview":
					if len(arguments) > 0 {
						Component(arguments[1])
					} else {
						fmt.Fprintln(writer, REFER.Url)
					}

				case "errors":
					fmt.Fprintln(writer, format("error-list", configs.Manifest.Diagnostics))

				case "exit":
					manualExit <- struct{}{}
					return

				default:
					fmt.Fprintf(writer, "Unknown command: %s\n", command)
				}

				writer.Flush()
			} else {
				str = strings.TrimSpace(str)
				if str == "" {
					continue
				}
				var req JsonRPCRequest
				if err := json.Unmarshal([]byte(str), &req); err != nil {
					continue
				}
				var resp JsonRPCResponse
				resp.JSONRPC = "2.0"
				resp.ID = req.ID

				switch req.Method {
				case "file-update":
					r, ok := req.Params.(map[string]any)
					if !ok {
						break
					}
					filepathVal, ok1 := r["filepath"]
					contentVal, ok2 := r["content"]
					filepath, ok3 := filepathVal.(string)
					content, ok4 := contentVal.(string)
					if ok1 && ok2 && ok3 && ok4 {
						if REFER.watcher != nil {
							REFER.watcher.HandleEvent(watchman.E_Action_Update, filepath, content)
						}
						resp.Method = "file-manifest"
						resp.Result = ManifestFile(filepath)
					}

				default:
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
