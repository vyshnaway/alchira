package action_test

import (
	"main/action"
	"main/shell"
	"testing"
)

func Test_Store(t *testing.T) {
	// cache.Static.Libraries_Saved = map[string]string{
	// 	"0.test.css":      "",
	// 	// "0.a0.css":      "",
	// 	// "goo.1.go.css":  "",
	// 	// "an.2.c2.css":   "",
	// 	// "anim.0.c2.css": "",
	// 	// "1.a1.css":      "",
	// 	// "2.a2.css":      "",
	// }
	// shell.Render.Raw(action.Store(action.Store_FileGroup_Artifact, "Artifact", "Artifact Content", "", "", "3g"))
	// shell.Render.Raw(action.Store(action.Store_FileGroup_Handoff, "Handoff", "Handoff Content", "", "", "3g"))
	shell.Render.Raw(action.Store(action.Store_FileGroup_Library, "1.Library.css", "Library Content", "", "", "3g"))
	// shell.Render.Raw(action.Store(action.Store_FileGroup_Target, "Target", "Target Content", "", "", "3g"))
}
