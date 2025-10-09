package test

import (
	_shell "main/package/shell"
	_utils "main/package/utils"
	_testing "testing"
)

func Test_Array_Setfront(t *_testing.T) {
	_shell.Render.Raw(_utils.Array_Setfront([]string{"1", "5", "2", "5", "1"}))
	_shell.Render.Raw(_utils.Array_Setback([]string{"1", "5", "2", "5", "1"}))
	_shell.Render.Raw(_utils.Array_SetAppend([]string{"1", "5", "2"}, "5", "4", "6"))
	_shell.Render.Raw(_utils.Array_SetAppend([]string{"1", "5", "2"}, "17"))
}
