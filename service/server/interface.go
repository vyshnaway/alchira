package server

import (
	"encoding/json"
	"main/configs"
	"main/internal/action"
	"main/service/server/handle"
)

func Interactive(command string, arguments []string, useRPC bool) (Response []byte) {
	var result any
	var err string

	switch command {
	case "symclass-template":
		if len(arguments) == 2 {
			filepath, symclass := arguments[0], arguments[1]
			if context, ok := configs.Style.Filepath_to_Context[filepath]; ok {
				if res := action.Index_Finder(symclass, context.StyleData.LocalMap); res.Index > 0 {
					result = res.Data.SrcData.SummonSnippet
				}
			}
		}

	case "manifest-local":
		filemap := map[string]string{}
		for _, f := range filemap {
			filemap[f] = ""
		}
		result = handle.Manifest(filemap)

	case "manifest-global":
		result = handle.ManifestGlobal()

	case "sandbox-state":
		result = handle.D_Sandbox_State

	case "sandbox-url":
		result = WS_Url

	case "sandbox-port":
		result = WS_Port

	case "diagnostics":
		result = configs.Manifest.Diagnostics

	default:
		err = "Invalid Commmand"
	}

	var r []byte
	if useRPC {
		r, _ = json.Marshal(handle.JsonRPCResponse{
			JSONRPC: "2.0",
			ID:      0,
			Method:  command,
			Result:  result,
			Error:   err,
		})
		WS_Broadcast <- r
	} else {
		r, _ = json.MarshalIndent(result, "", " ")
	}
	return r
}
