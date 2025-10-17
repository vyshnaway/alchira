package server

import (
	"encoding/json"
	"fmt"
	"main/configs"
	"main/models"
	"main/package/utils"
)

func IO_Term(command string, arguments []string, userpc bool) (Response any) {

	buildmessage := func(result any, err error) string {
		if userpc {
			return utils.Code_JsonBuild(JsonRPCResponse{
				JSONRPC: "2.0",
				ID:      0,
				Method:  command,
				Result:  result,
				Error:   err,
			}, "")
		} else {
			return utils.Code_JsonBuild(result, "  ")
		}
	}

	switch command {
	case "manifest":
		filepath := ""
		if len(arguments) > 0 {
			filepath = arguments[0]
		}
		return buildmessage(ManifestFile(filepath), nil)

	case "webview":
		if len(arguments) > 0 {
			if j, e := json.Marshal(Component(arguments[1], models.Style_ClassIndexMap{})); e == nil {
				fmt.Println(j)
				broadcast <- j
			}
		}
		return buildmessage(REFER.Url, nil)

	case "errors":
		return configs.Manifest.Diagnostics

	case "exit":
		return 0

	default:
		return nil
	}
}
