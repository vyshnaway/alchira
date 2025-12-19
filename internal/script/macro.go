package script

import (
	"fmt"
	_action "main/internal/action"
	_model "main/models"
	_map "maps"
	"strconv"
	"strings"
	_string "strings"
	"unicode"
)

type MultiplierInstruction struct {
	Count  int
	Symbol string
}

func ParseMultiplier(input string) (MultiplierInstruction, error) {
	input = strings.TrimSpace(input)
	var countStr strings.Builder
	var symbolStr strings.Builder

	foundAsterisk := false

	for _, char := range input {
		if unicode.IsDigit(char) && !foundAsterisk {
			// Phase 1: Capture the Multiplier (n)
			countStr.WriteRune(char)
		} else if char == '*' && !foundAsterisk {
			// Phase 2: Detect the Bridge (*)
			foundAsterisk = true
		} else if foundAsterisk {
			symbolStr.WriteRune(char)
		}
	}

	// Validation
	if !foundAsterisk {
		return MultiplierInstruction{}, fmt.Errorf("invalid macro format: %s", input)
	}

	count, _ := strconv.Atoi(countStr.String())
	if count == 0 {
		count = 1
	} // Default to 1 if no number provided

	return MultiplierInstruction{
		Count:  count,
		Symbol: symbolStr.String(),
	}, nil
}

func Marcro_Builder(
	macros []string,
	method E_Method,
	fileData *_model.File_Stash,
	appendstack map[int]bool,
) string {

	var builder _string.Builder
	var entry _string.Builder

	entry.Reset()

	for _, line := range macros {
		if tokens, err := ParseMultiplier(line); err == nil {
			res := _action.Index_Finder(tokens.Symbol, fileData.Cache.LocalMap)
			if res.Index > 0 {
				if !appendstack[res.Index] {
					subappendstack := make(map[int]bool, len(appendstack)+1)
					_map.Copy(subappendstack, appendstack)
					subappendstack[res.Index] = true
					context := *res.Data.Context
					context.Content = res.Data.SrcData.Metadata.SketchSnippet
					context.Midway = res.Data.SrcData.Metadata.SketchSnippet
					append := Rider(&context, method, subappendstack).Scribed

					builder.Grow((len(append) +1) * tokens.Count)
					for range tokens.Count {
						builder.WriteRune('\n')
						builder.WriteString(append)
					}
				}
			}
		}
	}

	return builder.String()
}

func Marcro_Reader(
	macros []string,
) map[string]bool {

	symclasses := map[string]bool{}
	var entry _string.Builder

	entry.Reset()

	for _, line := range macros {
		if tkn, err := ParseMultiplier(line); err == nil {
			symclasses[tkn.Symbol] = true
		}
	}

	return symclasses
}
