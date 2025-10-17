package server

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"

	// "main/package/console"
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
	server, port, err := Webview_Create(tryport)
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
			str = strings.TrimSpace(str)

			jsongap := ""
			usejsonrpc := true
			format := func(method string, data any, err error) string {
				if usejsonrpc {
					return utils.Code_JsonBuild(JsonRPCResponse{
						JSONRPC: "2.0",
						ID:      0,
						Method:  method,
						Result:  data,
						Error:   err,
					}, jsongap)
				} else {
					return utils.Code_JsonBuild(data, jsongap)
				}
			}

			if strings.HasPrefix(str, "$ ") || strings.HasPrefix(str, "> ") {
				if str[0] == '$' {
					usejsonrpc = false
					jsongap = "  "
				}

				split := strings.Fields(str[2:])
				if len(split) < 1 {
					continue
				}
				command := split[0]
				arguments := split[1:]

				res, err := IO_Term(command, arguments)
				if res == nil {
					continue
				} else if r, k := res.(int); k && r == 0 {
					manualExit <- struct{}{}
				}

				responsestring := format(command, res, err)
				fmt.Fprintln(writer, responsestring)

				writer.Flush()
			} else {
				var req JsonRPCRequest
				if err := json.Unmarshal([]byte(str), &req); err != nil {
					continue
				}

				out, _ := json.Marshal(IO_Json(req))
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
