package script

import (
	"fmt"
	"main/internal/action"
	"maps"
	"strings"
	"strconv"
	"unicode"
)

func SketchBuilder(index int, method E_Method, appendstack map[int]bool) string {
	subappendstack := make(map[int]bool, len(appendstack))
	maps.Copy(subappendstack, appendstack)
	subappendstack[index] = true

	data := action.Index_Fetch(index)
	context := *data.Context
	resoled := ApplyCommand(data.SrcData.Metadata.SketchSnippet, data.SrcData.Metadata.Macros, true, false, false)
	context.Content = resoled
	context.Midway = resoled

	result := Rider(&context, method, subappendstack).Scribed
	return ApplyCommand(result, data.SrcData.Metadata.Macros, false, true, true)
}

func MacroSketcher(content string, index int, method E_Method, appendstack map[int]bool) string {
	data := action.Index_Fetch(index)
	subappendstack := make(map[int]bool, len(appendstack))
	maps.Copy(subappendstack, appendstack)

	context2 := *data.Context
	resoled := ApplyCommand(content, data.SrcData.Metadata.Macros, false, true, true)
	context2.Content = resoled
	context2.Midway = resoled

	return Rider(&context2, method, subappendstack).Scribed
}

func ApplyCommand(content string, macros []string, preInject, inject, postInject bool) string {
	fmt.Println(content)
	for _, mac := range macros {

		if len(mac) < 2 {
			continue
		}
		op := mac[0]

		if (op == '<' && preInject) ||
			(op == '=' && inject) ||
			(op == '>' && postInject) {
			T, _ := Tokenize(mac[1:])

			if T.Sym[0] == '|' {
				// content = Modifier(T.Sym[1:], content)
			} else if len(T.Sym) > 0 && len(T.Raw) > 0 {
				content = strings.ReplaceAll(content, T.Sym, T.Raw)
			}
		}

		fmt.Println("---")
		fmt.Println(mac)
		fmt.Println("---")
		fmt.Println(content)
	}
	fmt.Println("------")

	return content
}

type MultiplierInstruction struct {
	Int int
	Val string
	Raw string
	Sym string
}

func Tokenize(input string) (MultiplierInstruction, error) {
	input = strings.TrimSpace(input)
	var countStr strings.Builder
	var subvalue strings.Builder
	var symbol strings.Builder
	var fullvalue strings.Builder

	foundAsterisk := false
	gotSymbol := false

	for _, char := range input {
		if !gotSymbol {
			if char == '=' {
				gotSymbol = true
				continue
			} else {
				symbol.WriteRune(char)
			}
		} else if !foundAsterisk && unicode.IsDigit(char) {
			countStr.WriteRune(char)
		} else if char == '*' && !foundAsterisk {
			foundAsterisk = true
		} else if foundAsterisk {
			subvalue.WriteRune(char)
		}
		if gotSymbol {
			fullvalue.WriteRune(char)
		}
	}

	count, _ := strconv.Atoi(countStr.String())
	if count == 0 {
		count = 1
	}

	return MultiplierInstruction{
		Sym: strings.TrimSpace(symbol.String()),
		Int: func() int {
			if foundAsterisk {
				return count
			} else {
				return 0
			}
		}(),
		Val: func() string {
			if foundAsterisk {
				return strings.TrimSpace(subvalue.String())
			} else {
				return strings.TrimSpace(fullvalue.String())
			}
		}(),
		Raw: strings.TrimSpace(fullvalue.String()),
	}, nil
}