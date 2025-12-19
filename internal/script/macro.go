package script

import (
	_action "main/internal/action"
	_model "main/models"
	"main/package/object"
	_map "maps"
	"strconv"
	"strings"
	_string "strings"
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
		Value:    _string.TrimSpace(value.String()),
		Symbol:   _string.TrimSpace(symbol.String()),
		Symclass: _string.TrimSpace(symclass.String()),
	}, nil
}

func ApplySymbols(input string, register *object.T[string, string]) string {

	register.Range(func(k, v string) {
		input = _string.ReplaceAll(input, k, v)
	})

	return input
}

func Marcro_Builder(
	macros []string,
	method E_Method,
	fileData *_model.File_Stash,
	appendstack map[int]bool,
) string {

	var entry _string.Builder
	var register = object.New[string, string](4)

	entry.Reset()

	macrostack := make([]string, 4)

	for _, line := range macros {
		line = ApplySymbols(line, register)

		if tokens, err := Tokenize(line); err == nil {

			val := tokens.Value
			res := _action.Index_Finder(tokens.Symclass, fileData.Cache.LocalMap)

			if res.Index > 0 {
				var tmbuild _string.Builder

				if !appendstack[res.Index] {
					subappendstack := make(map[int]bool, len(appendstack)+1)
					_map.Copy(subappendstack, appendstack)
					subappendstack[res.Index] = true
					context := *res.Data.Context
					context.Content = res.Data.SrcData.Metadata.SketchSnippet
					context.Midway = res.Data.SrcData.Metadata.SketchSnippet
					content := Rider(&context, method, subappendstack).Scribed

					tmbuild.Grow((len(content) + 1) * tokens.Count)
					for range tokens.Count {
						if len(content) > 0 {
							tmbuild.WriteString(content)
						}
					}
				}

				val = tmbuild.String()
			}

			if len(tokens.Symbol) == 0 {
				macrostack = append(macrostack, val)
			} else {
				for i, s := range macrostack {
					macrostack[i] = _string.ReplaceAll(s, tokens.Symbol, val)
				}
				register.Set(tokens.Symbol, val)
			}

		}
	}

	return _string.Join(macrostack, "\n")
}

func Marcro_Reader(
	macros []string,
) map[string]bool {
	symclasses := map[string]bool{}
	for _, line := range macros {
		if tkn, err := Tokenize(line); err == nil {
			symclasses[tkn.Symclass] = true
		}
	}
	
	return symclasses
}
