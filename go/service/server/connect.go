package server

import (
	"bufio"
	"encoding/json"
	"fmt"
	"main/package/utils"
	"net/http"
	"os"
	"strings"
)

var DATA = struct {
	Port int
	Url  string
}{
	Port: 0,
	Url:  "",
}

func Connect(tryport int) {
	// Start server
	server, port, err := Create(tryport)
	if err != nil {
		fmt.Println(0)
		return
	}

	DATA.Port = port
	DATA.Url = fmt.Sprintf("http://localhost:%d", port)

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Println("HTTP server error:", err)
		}
	}()

	Dryrun(Dryrun_Step_Initialize)

	scanner := bufio.NewScanner(os.Stdin)
	writer := bufio.NewWriter(os.Stdout)

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
				if len(arguments) > 0 {
					filepath := arguments[0]
					result := ManifestFile(filepath)
					fmt.Fprintln(writer, utils.Code_JsonBuild(result, ""))
				} else {
					fmt.Fprintln(writer, "Error: manifest command missing argument [filepath]")
				}
			case "preview":
				fmt.Fprintln(writer, "Preview command received (not implemented)")
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
}
