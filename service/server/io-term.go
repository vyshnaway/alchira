package server

import (
	"fmt"
	"main/configs"
)

func IO_Term(command string, arguments []string) (Response any, Error error) {

	switch command {
	case "manifest":
		filepath := ""
		if len(arguments) > 0 {
			filepath = arguments[0]
		}
		return ManifestFile(filepath), nil

	case "webview":
		if len(arguments) > 0 {
			Component(arguments[1])
		}
		return REFER.Url, nil

	case "errors":
		return configs.Manifest.Diagnostics, nil

	case "exit":
		return 0, nil

	default:
		return nil, fmt.Errorf("invalid method")
	}
}
