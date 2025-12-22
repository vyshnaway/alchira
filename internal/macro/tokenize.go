package macro

import (
	"strconv"
	"strings"
)

// execmod = Inject values to Stack
func (Stack *AST) Tokenize(command string, execmod bool) (tokens CMD, ok bool) {
	LoadSigns := func() {
		if execmod {
			Stack.Register.Range(func(k string, v []string) {
				if len(v) > 0 {
					command = strings.ReplaceAll(command, k, v[0])
				}
			})
		}
	}

	tokens = CMD{
		Mul0Mod1:  false,
		Instance:  0,
		Register:  "",
		Modifier:  "",
		Argument:  "",
		Operation: "",
		RawString: command,
	}

	gotRegister := false
	gotOperator := false
	var builder strings.Builder

	SetRegister := func(char rune) {
		switch char {
		case '|':
			tokens.Mul0Mod1 = true
			fallthrough
		case '=':
			tokens.Register = strings.TrimSpace(builder.String())
			gotRegister = true
			builder.Reset()
		default:
			builder.WriteRune(char)
		}
	}
	for _, char := range command {
		if !gotRegister {
			SetRegister(char)
		} else {
			builder.WriteRune(char)
		}
	}
	tokens.Operation = strings.TrimSpace(builder.String())
	command = tokens.Operation
	if !tokens.Mul0Mod1 {
		LoadSigns()
	}
	builder.Reset()

	if gotRegister {

		// Get Modifier Data
		SetModifier := func(char rune, finalize bool) {
			if tokens.Mul0Mod1 && ('=' == char || ':' == char || finalize) {
				switch char {
				case '=':
					tokens.Instance = 1
					fallthrough
				case ':':
					tokens.Modifier = strings.TrimSpace(builder.String())
				}
				LoadSigns()

			} else if !tokens.Mul0Mod1 && (char == '*' || finalize) {
				tokens.Instance, _ = strconv.Atoi(strings.TrimSpace(builder.String()))
				if tokens.Instance == 0 && !finalize {
					tokens.Instance = 1
				}
			} else {
				builder.WriteRune(char)
				return
			}
			if finalize {
				tokens.Argument = builder.String()
			}
			gotOperator = true
			builder.Reset()
		}
		for _, char := range command {
			if !gotOperator {
				SetModifier(char, false)
			} else {
				builder.WriteRune(char)
			}
		}
		if !gotOperator {
			SetModifier(' ', true)
		} else {
			tokens.Argument = builder.String()
		}

		if execmod {
			Stack.Commands = append(Stack.Commands, tokens)

			if _, ok := Stack.Register.Get(tokens.Register); !ok {
				Stack.Register.Set(tokens.Register, []string{})
			}

			Stack.recent = tokens.Register
		}

		ok = true
	}

	return tokens, ok
}
