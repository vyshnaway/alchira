package test

import (
	_console "main/package/console"
	_reader "main/package/reader"
	_testing "testing"
)

func Test_cursor(t *_testing.T) {
	cursor := _reader.New("12345")
	cursor.Stream(true, func() {
		_console.Render.Raw(cursor.Active.Char)
	})
}
