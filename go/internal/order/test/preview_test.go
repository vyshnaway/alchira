package order_test

import (
	_order "main/internal/order"
	_console "main/package/console"
	_testing "testing"
)

func Test_preview(t *_testing.T) {
	_console.Render.Raw(_order.Preview([][]int{
		{1, 2, 3},
		{2, 3, 4},
		{1, 2},
	}, true))

	_console.Render.Raw(_order.Preview([][]int{
		{1, 2, 3},
		{2, 3, 4},
		{1, 2},
	}, true))
}
