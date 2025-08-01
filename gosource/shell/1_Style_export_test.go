package shell

import (
	"fmt"
	"testing"
)


func Test_Style(t *testing.T) {
	t.Run("ANSI Styles", func (t *testing.T)  {
		fmt.Println(Style.Bold[Canvas.Color.Red]("The Red Bold One!!!"))
		fmt.Println(Style.DimInvertUline[Canvas.Color.Red]("The Dim Invert Underline One!!!"))
		fmt.Println(Canvas.Unstyle)
	})
}