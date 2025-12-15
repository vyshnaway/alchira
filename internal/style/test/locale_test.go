package test

import (
	"fmt"
	"regexp"
	"testing"
)

var regex_lodash = regexp.MustCompile(`\.()_`)

func Test_Lodash(t *testing.T) {
	input := "._gelobe"
	output := regex_lodash.ReplaceAllString(input, "label")
	fmt.Println(output) // Output: labelgelobe
}

func Test_EQ(t *testing.T) {
	fmt.Println("" != "")
}
