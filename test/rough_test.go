package test

import (
	"fmt"
	"testing"
)

func Test_Main(t *testing.T) {
	temp := map[string]string{
		"": "dfg",
	}
	if _, ok := temp[""]; ok {
		fmt.Println(ok)
	} else {
		fmt.Println(ok)
	}
}
