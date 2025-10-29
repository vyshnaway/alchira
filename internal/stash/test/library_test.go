package stash_test

import (
	_config "main/configs"
	_stash "main/internal/stash"
	_console "main/package/console"
	_testing "testing"
)

func test_SaveFiles() {
	_config.Saved.Libraries_Saved = map[string]string{
		"0.test.css":    "",
		"0.a0.css":      "",
		"goo.1.go.css":  "",
		"an.2.c2.css":   "",
		"anim.0.c2.css": "",
		"1.a1.css":      "",
		"2.a2.css":      "",
	}
}

func Test_Library(t *_testing.T) {
	test_SaveFiles()
	_console.Render.Raw(_stash.Library_CacheFiles())
}
