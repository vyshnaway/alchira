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
	Count  int
	Value  string
	Symbol string
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
		Symbol: strings.TrimSpace(symbol.String()),
		Count: func() int {
			if foundAsterisk {
				return count
			} else {
				return 0
			}
		}(),
		Value: func() string {
			if foundAsterisk {
				return strings.TrimSpace(subvalue.String())
			} else {
				return fullvalue.String()
			}
		}(),
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
	var register = object.New[string, string](4)
	type stack struct {
		value string
		cycle int
		index int
	}

	macrostack := []*stack{}
	subappendstack := make(map[int]bool, len(appendstack))
	maps.Copy(subappendstack, appendstack)

	for _, line := range macros {
		line = ApplySymbols(line, register)

		if tokens, err := Tokenize(line); err == nil {

			val := tokens.Value
			res := _action.Index_Finder(tokens.Value, fileData.Cache.LocalMap)

			if res.Index > 0 && tokens.Count > 0 {
				configs.Style.Sketchpad.Mac[tokens.Value] = res.Index
				if !appendstack[res.Index] {
					subappendstack[res.Index] = true
					val = res.Data.SrcData.Metadata.SketchSnippet
				}
			} else if tokens.Count == 0 {
				tokens.Count = 1
			}

			if len(tokens.Symbol) == 0 {
				macrostack = append(macrostack, &stack{index: res.Index, value: val, cycle: tokens.Count})
			} else {
				var s strings.Builder
				for range tokens.Count {
					s.WriteString(val)
				}
				S := s.String()
				for i, m := range macrostack {
					macrostack[i].value = strings.ReplaceAll(m.value, tokens.Symbol, S)
				}
				register.Set(tokens.Symbol, val)
			}
		}
	}

	var compose strings.Builder

	for _, m := range macrostack {
		for range m.cycle {
			if m.index == 0 {
				compose.WriteString(m.value)
			} else {
				compose.WriteString(MacroSketcher(m.value, _action.Index_Fetch(m.index).Context, method, subappendstack))
			}
		}
	}

	return compose.String()
}

func Marcro_Reader(
	macros []string,
) map[string]bool {
	symclasses := map[string]bool{}
	for _, line := range macros {
		tkn, err := Tokenize(line)
		if err == nil && len(tkn.Value) > 0 {
			symclasses[tkn.Value] = true
		}
	}

	return symclasses
}
