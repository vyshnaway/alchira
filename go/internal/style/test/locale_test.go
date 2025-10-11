package test

import (
	"fmt"
	"regexp"
	"testing"
)

var regex_locale = regexp.MustCompile(`\.()_`)


func Test_Locale(t *testing.T) {
	input := "._gelobe"
	output := regex_locale.ReplaceAllString(input, "label")
	fmt.Println(output) // Output: labelgelobe
}

func Test_EQ(t *testing.T) {
	fmt.Println("" != "")
}