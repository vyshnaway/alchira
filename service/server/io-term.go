package server

import (
	"fmt"
	"main/configs"
)

func IO_Term(command string, arguments []string) any {

	switch command {
	case "manifest":
		filepath := ""
		if len(arguments) > 0 {
			filepath = arguments[0]
		}
		return ManifestFile(filepath)

	case "webview":
		if len(arguments) > 0 {
			Component(arguments[1])
		}
		return REFER.Url

	case "errors":
		return configs.Manifest.Diagnostics

	case "exit":
		return 0

	default:
		return fmt.Sprintf("Unknown command: %s\n", command)
	}
}
