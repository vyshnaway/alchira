package test

import (
	_reader "main/package/reader"
	_shell "main/package/shell"
	_testing "testing"
)

func Test_cursor(t *_testing.T) {
	cursor := _reader.New("12345")
	cursor.Stream(true, func() {
		_shell.Render.Raw(cursor.Active.Char)
	})
}
