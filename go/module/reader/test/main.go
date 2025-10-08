package test

import (
	reader "main/module/reader"
	shell "main/module/shell/core"
	"testing"
)

func Test_cursor(t *testing.T) {
	cursor := reader.Construct("12345")
	cursor.Stream(true, func() {
		shell.Render.Raw(cursor.Active.Char)
	})
}
