package server

import (
	"main/configs"
	"main/package/utils"
)

func IO_Term(command string, arguments []string, userpc bool) (Response string) {
	var result any

	switch command {
	case "manifest":
		filepath := ""
		if len(arguments) > 0 {
			filepath = arguments[0]
		}
		filedata, _ := ManifestFile(filepath)
		result = filedata

	case "webview":
		result = Refer.Url

	case "errors":
		result = configs.Manifest.Diagnostics

	case "exit":
		return "0"

	default:
		result = "invalid method"
	}

	if userpc {
		return utils.Code_JsoncBuild(JsonRPCResponse{
			JSONRPC: "2.0",
			ID:      0,
			Method:  command,
			Result:  result,
			Error:   nil,
		}, "")
	} else {
		return utils.Code_JsoncBuild(result, "  ")
	}
}
