package Cursor_test

import (
	"main/class/Cursor"
	"main/shell"
	"testing"
)

func Test_cursor(t *testing.T) {
	cursor := Cursor.Construct("12345")
	cursor.Stream(true, func() {
		shell.Render.Raw(cursor.Active.Char)
	})
}
