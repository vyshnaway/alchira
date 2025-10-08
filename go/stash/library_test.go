package stash_test

import (
	"main/cache"
	shell "main/shell/core"
	"main/stash"
	"testing"
)

func test_SaveFiles() {
	cache.Static.Libraries_Saved = map[string]string{
		"0.test.css":    "",
		"0.a0.css":      "",
		"goo.1.go.css":  "",
		"an.2.c2.css":   "",
		"anim.0.c2.css": "",
		"1.a1.css":      "",
		"2.a2.css":      "",
	}
}

func Test_Library(t *testing.T) {
	test_SaveFiles()
	shell.Render.Raw(stash.Library_CacheFiles())
}
