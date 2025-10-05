package blockmap_test

import (
	"fmt"
	blockmap "main/class/Blockmap"
	"main/shell"
	"testing"
)

func Test(t *testing.T) {
	bm1 := blockmap.New()
	bm1.SetProp("color", "red")
	nested := blockmap.New()
	nested.SetProp("weight", "bold")
	bm1.SetBlock("style", *nested)

	bm2 := blockmap.New()
	bm2.SetProp("color", "blue")
	nested2 := blockmap.New()
	nested2.SetProp("weight", "normal")
	bm2.SetBlock("style", *nested2)

	bm1.Mixin(*bm2)
	ok, val := bm1.GetProp("color") // Returns "blue", true
	fmt.Println(val, ok)            // Output: blue true

	// Fixed: Properly handle GetBlock return values
	ok, block := bm1.GetBlock("style")
	var nestedVal string
	if ok {
		ok, nestedVal = block.GetProp("weight") // Returns "normal", true
	} else {
		nestedVal, ok = "", false // Handle missing block
	}
	fmt.Println(nestedVal, ok) // Output: normal true

	bm3 := bm1.Clone()
	bm3.Mixin(*bm2)
	bm3.SetProp("color", "green")
	if ok, block := bm3.GetBlock("style"); ok {
		block.SetProp("weight", "italic")
		block.SetProp("--weight", "italic")
	}
	val1, _ := bm1.GetProp("color") // Returns "blue"
	val2, _ := bm3.GetProp("color") // Returns "green"
	fmt.Println(val1, val2)         // Output: blue green

	bm1.Print()
	bm2.Print()
	bm3.Print()
	shell.Render.Raw(bm1.Skeleton())
	shell.Render.Raw(bm2.Skeleton())
	shell.Render.Raw(bm3.Skeleton())
}
