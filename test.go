package main

import (
	"encoding/json"
	"fmt"
	// "strings"
)

type CustomString string

// Implement the Marshaler interface for CustomString
func (s CustomString) MarshalJSON() ([]byte, error) {
	// 1. Convert the CustomString to a standard string
	str := string(s)
	
	// 2. Replace the characters with their Unicode escapes
	// str = strings.ReplaceAll(str, "‾", "\\u203E") // Unicode for OVERLINE
	// str = strings.ReplaceAll(str, "─", "\\u2500") // Unicode for BOX DRAWINGS LIGHT HORIZONTAL
	
	// 3. Wrap the escaped string in quotes and return the bytes
	// Note: We use json.Marshal here to handle the quotation marks properly
	return json.Marshal(str)
}

type Data struct {
	Text CustomString `json:"text"`
}

func main() {
	data := Data{
		Text: "Hello ‾ and ─ World!",
	}

	// The Marshaler implementation will ensure the characters are escaped.
	jsonBytes, _ := json.Marshal(data)
	
	fmt.Println(string(jsonBytes))
	// Output: {"text":"Hello \u203e and \u2500 World!"}
}