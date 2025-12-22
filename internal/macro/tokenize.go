package macro

import (
	"strconv"
	"strings"
)


// execmod = Inject values to Stack
func (Stack *AST) Tokenize(command string, execmod bool) (tokens CMD, ok bool) {
	tokens = CMD{
		Instance:  0,
		Register:  "",
		Modifier:  "",
		Argument:  "",
		ArgString: "",
		RawString: command,
	}

	gotRegister := false
	foundModifier := false
	var builder strings.Builder

	SetSymbol := func(char rune) (cont bool) {
		switch char {
		case '|':
			fallthrough
		case '=':
			tokens.Register = strings.TrimSpace(builder.String())
			gotRegister = true
			builder.Reset()
			return true
		default:
			builder.WriteRune(char)
			return false
		}
	}
	for _, char := range command {
		if SetSymbol(char) {
			break
		}
	}


	SetModifier := func(char rune) (cont bool) {
		switch char {
		case ':':
			tokens.Modifier = strings.TrimSpace(builder.String())
		case '*':
			tokens.Instance, _ = strconv.Atoi(strings.TrimSpace(builder.String()))
			if tokens.Instance == 0 {
				tokens.Instance = 1
			}
		default:
			builder.WriteRune(char)
			return false
		}

		command := command[builder.Len():]
		tokens.ArgString = command
		if execmod {
			Stack.Register.Range(func(k string, v []string) {
				if len(v) > 0 {
					command = strings.ReplaceAll(command, k, v[0])
				}
			})
		}
		foundModifier = true
		builder.Reset()
		return true
	}
	if gotRegister {
		for _, char := range command {
			if !foundModifier {
				if SetModifier(char) {
					continue
				}
			} else {
				builder.WriteRune(char)
			}
		}

		if !foundModifier {
			SetModifier(':')
		} else {
			tokens.Argument = builder.String()
		}

		if execmod {
			Stack.Commands = append(Stack.Commands, tokens)

			if val, ok := Stack.Register.Get(tokens.Register); ok {
				v := *val
				v = append(v, tokens.Argument)
			} else {
				Stack.Register.Set(tokens.Argument, []string{})
			}

			Stack.recent = tokens.Register
		}

		ok = true
	}

	return tokens, ok
}
