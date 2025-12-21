package macro

import (
	"strconv"
	"strings"
	"unicode"
)

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

