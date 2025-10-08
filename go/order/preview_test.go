package order_test

import (
	"main/order"
	"main/shell"
	"testing"
)

func Test_preview(t *testing.T) {
	shell.Render.Raw(order.Preview_Organize([][]int{
		{1, 2, 3},
		{2, 3, 4},
		{1, 2},
	}, true))
}
