package utils_test

import (
	shell "main/shell/core"
	"main/utils"
	"testing"
)

func Test_Array_Setfront(t *testing.T) {
	shell.Render.Raw(utils.Array_Setfront([]string{"1", "5", "2", "5", "1"}))
	shell.Render.Raw(utils.Array_Setback([]string{"1", "5", "2", "5", "1"}))
	shell.Render.Raw(utils.Array_SetAppend([]string{"1", "5", "2"}, "5", "4", "6"))
	shell.Render.Raw(utils.Array_SetAppend([]string{"1", "5", "2"}, "17"))
}
