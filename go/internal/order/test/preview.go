package order_test

import (
	_order "main/internal/order"
	_shell "main/package/shell"
	_testing "testing"
)

func Test_preview(t *_testing.T) {
	_shell.Render.Raw(_order.Preview([][]int{
		{1, 2, 3},
		{2, 3, 4},
		{1, 2},
	}, true))

	_shell.Render.Raw(_order.Preview([][]int{
		{1, 2, 3},
		{2, 3, 4},
		{1, 2},
	}, true))
}
