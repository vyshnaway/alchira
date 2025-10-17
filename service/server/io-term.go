package server

import (
	"encoding/json"
	"fmt"
	"main/configs"
	"main/models"
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
			if j, e := json.Marshal(Component(arguments[1], models.Style_ClassIndexMap{})); e == nil {
				fmt.Println(j)
				broadcast <- j
			}
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
