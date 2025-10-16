package server

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
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
		streamlock := false
		for scanner.Scan() {
			str := scanner.Text()
			fmt.Fprintf(writer, "%s", str)

			if strings.HasPrefix(str, "$ ") || strings.HasPrefix(str, "> ") {
				if !streamlock {
					continue
				}

				streamlock = true
				defer func() { streamlock = false }()

				usejsonrpc := true
				jsongap := ""
				if str[0] == '$' {
					usejsonrpc = false
					jsongap = "  "
				}

				format := func(method string, data any, err error) string {
					result := ""
					if usejsonrpc {
						result = utils.Code_JsonBuild(JsonRPCResponse{
							JSONRPC: "2.0",
							ID:      0,
							Method:  method,
							Result:  data,
							Error:   err,
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

				res, err := IO_Term(command, arguments)
				if res == nil {
					continue
				} else if r, k := res.(int); k && r == 0 {
					manualExit <- struct{}{}
				}

				responsestring := format(command, res, err)
				fmt.Fprintf(writer, "%s", responsestring)

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
				resp.Result, resp.Error = IO_Json(req.Method, req.Params)

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
