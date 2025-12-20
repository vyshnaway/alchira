package script

import (
	"main/configs"
	_action "main/internal/action"
	_model "main/models"
	"main/package/object"
	"maps"
	"strconv"
	"strings"
	"unicode"
)

type MultiplierInstruction struct {
	Count    int
	Value    string
	Symbol   string
	Symclass string
}

func Tokenize(input string) (MultiplierInstruction, error) {
	input = strings.TrimSpace(input)
	var countStr strings.Builder
	var symclass strings.Builder
	var symbol strings.Builder
	var value strings.Builder

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
			symclass.WriteRune(char)
		}
		if gotSymbol {
			value.WriteRune(char)
		}

	}

	count, _ := strconv.Atoi(countStr.String())
	if count == 0 {
		count = 1
	}

	return MultiplierInstruction{
		Count:    count,
		Value:    strings.TrimSpace(value.String()),
		Symbol:   strings.TrimSpace(symbol.String()),
		Symclass: strings.TrimSpace(symclass.String()),
	}, nil
}

func ApplySymbols(input string, register *object.T[string, string]) string {

	register.Range(func(k, v string) {
		input = strings.ReplaceAll(input, k, v)
	})

	return input
}

func Macro_Builder(
	macros []string,
	method E_Method,
	fileData *_model.File_Stash,
	appendstack map[int]bool,
) string {

	var entry strings.Builder
	var register = object.New[string, string](4)

	entry.Reset()

	type stack struct {
		value string
		cycle int
	}

	macrostack := object.New[int, *stack](4)
	subappendstack := make(map[int]bool, len(appendstack))
	maps.Copy(subappendstack, appendstack)

	for _, line := range macros {
		line = ApplySymbols(line, register)

		if tokens, err := Tokenize(line); err == nil {

			val := tokens.Value
			res := _action.Index_Finder(tokens.Symclass, fileData.Cache.LocalMap)

			if res.Index > 0 {
				configs.Style.Sketchpad.Mac[tokens.Symclass] = res.Index
				if !appendstack[res.Index] {
					subappendstack[res.Index] = true
					val = res.Data.SrcData.Metadata.SketchSnippet
				}
			}

			if len(tokens.Symbol) == 0 {
				macrostack.Set(res.Index, &stack{value: val, cycle: tokens.Count})
			} else {
				macrostack.Range(func(k int, v *stack) {
					v.value = strings.ReplaceAll(v.value, tokens.Symbol, val)
				})
				register.Set(tokens.Symbol, val)
			}
		}
	}

	var compose strings.Builder
	macrostack.Range(func(k int, v *stack) {
		for range v.cycle {
			if k == 0 {
				compose.WriteString(v.value)
			} else {
				compose.WriteString(MacroSketcher(v.value, _action.Index_Fetch(k).Context, method, subappendstack))
			}
		}
	})

	return compose.String()
}

func Marcro_Reader(
	macros []string,
) map[string]bool {
	symclasses := map[string]bool{}
	for _, line := range macros {
		tkn, err := Tokenize(line)
		if err == nil && len(tkn.Symclass) > 0 {
			symclasses[tkn.Symclass] = true
		}
	}

	return symclasses
}
