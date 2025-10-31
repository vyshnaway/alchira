package handle

import (
	"main/configs"
	"main/internal/action"
)

func Template(symclass, filepath string) string {

	context := configs.Style.Filepath_to_Context[filepath]
	if context == nil {
		return ""
	}

	ref := action.Index_Finder(symclass, context.StyleData.LocalMap)
	if ref.Index == 0 {
		return ""
	}

	return ref.Data.SrcData.SummonSnippet
}


	// switch req.Method {

	// case "manifest":
	// 	if params_, ok := req.Params.(map[string]any); ok {

	// 		resp.Method = req.Method
	// 		filepath, ok1 := params_["filepath"]
	// 		filepath, ok2 := filepath.(string)

	// 		if ok1 && ok2 {
	// 			abspath, err := fileman.Path_Resolves(filepath_)
	// 			content, ok5 := params_["content"]
	// 			content_, ok6 := content.(string)
	// 			if ok5 && ok6 && err == nil {
	// 				configs.Static.Watchman.HandleEvent(watchman.E_Action_Update, abspath, content_)
	// 			}

	// 			fileManifest, styleManifest := Manifest(filepath_)
	// 			resp.Result = fileManifest

	// 			var sm JsonRPCResponse
	// 			sm.JSONRPC = "2.0"
	// 			sm.ID = req.ID
	// 			sm.Method = "styleManifest"
	// 			sm.Result = styleManifest
	// 			if message, e := json.Marshal(sm); e == nil {
	// 				broadcast <- message
	// 			}

	// 			symclass, ok3 := params_["symclass"]
	// 			symclass_, ok4 := symclass.(string)
	// 			if _, k := styleManifest.Symclasses[symclass_]; ok3 && ok4 && k {
	// 				var uc JsonRPCResponse
	// 				uc.JSONRPC = "2.0"
	// 				uc.ID = req.ID
	// 				uc.Method = "updateComponent"
	// 				uc.Result = Component(symclass_, models.Style_ClassIndexMap{})
	// 				if message, e := json.Marshal(uc); e == nil {
	// 					broadcast <- message
	// 				}
	// 				M_ComopnentUpdate.Lock()
	// 				Refer.LatestComponent = uc
	// 				M_ComopnentUpdate.Unlock()
	// 			}
	// 			break
	// 		}
	// 	}
	// 	resp.Error = fmt.Errorf("invalid input parameteres")

	// case "sandbox-view":
	// 	if Refer.LatestComponent != nil {
	// 		b, _ := json.Marshal(Refer.LatestComponent)
	// 		broadcast <- b
	// 	}
	// }