package shell

import (
	"fmt"
	// "main/shell"
	"testing"
)

func Test_Canvas(t *testing.T) {
	t.Run("Initialize_Canvas", func(t *testing.T) {
		width, err := RefetchWidth()

		if err != nil {
			t.Errorf("RefetchWidth Error: %v", err)
		}

		fmt.Println(width)
		Initialize(true, true, 2, 0)
	})
	fmt.Print(Canvas)
}
