package server

// JSON-RPC message structures
type JsonRPCRequest struct {
	JSONRPC string `json:"jsonrpc"`
	ID      any    `json:"id"`
	Method  string `json:"method"`
	Params  any    `json:"params"`
}
type JsonRPCResponse struct {
	JSONRPC string `json:"jsonrpc"`
	ID      any    `json:"id,omitempty"`
	Method  string `json:"method"`
	Result  any    `json:"result,omitempty"`
	Error   any    `json:"error,omitempty"`
}

func IO_Json(command string, arguments []string) any {

	switch command {
	case "manifest":
		filepath := ""
		if len(arguments) > 0 {
			filepath = arguments[0]
		}
		return ManifestFile(filepath)

	}
	
	return nil
}
