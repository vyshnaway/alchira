package test

import (
	_console "main/package/console"
	_utils "main/package/utils"
	_testing "testing"
)

func Test_Array_Setfront(t *_testing.T) {
	_console.Render.Raw(_utils.Array_Setfront([]string{"1", "5", "2", "5", "1"}))
	_console.Render.Raw(_utils.Array_Setback([]string{"1", "5", "2", "5", "1"}))
	_console.Render.Raw(_utils.Array_SetAppend([]string{"1", "5", "2"}, "5", "4", "6"))
	_console.Render.Raw(_utils.Array_SetAppend([]string{"1", "5", "2"}, "17"))
}
