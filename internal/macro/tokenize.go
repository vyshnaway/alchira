package macro

import (
	"strconv"
	"strings"
)

// execmod = Inject values to Stack
func (Stack *AST) Tokenize(command string, execute bool) (tokens CMD, ok bool) {
	LoadConsts := func(str string) string {
		if execute {
			Stack.Const.Range(func(k string, v REG) {
				if len(k) > 0 && len(v.Array) > 0 {
					str = strings.ReplaceAll(str, k, v.Array[0])
				}
			})
		}
		return str
	}

	tokens = CMD{
		Mul0Mod1:  false,
		Instance:  0,
		Target:    "",
		Modify:    "",
		Register:  "",
		Arguments: "",
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
			tokens.Mul0Mod1 = false
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
	builder.Reset()

	if gotRegister {

		// Get Modifier Data
		SetModifier := func(char rune, finalize bool) {
			if tokens.Mul0Mod1 && ('=' == char || ':' == char || finalize) {
				tmp := strings.TrimSpace(builder.String())
				var onmod = true
				var b1, b2 strings.Builder
				for _, c := range tmp {
					if onmod {
						if c == '/' {
							onmod = false
						} else {
							b1.WriteRune(c)
						}
					} else {
						b2.WriteRune(c)
					}
				}

				B1 := strings.TrimSpace(b1.String())
				B2 := LoadConsts(strings.TrimSpace(b2.String()))

				switch char {
				case '=':
					tokens.Modify = B1
					tokens.Instance, _ = strconv.Atoi(B2)
					if tokens.Instance == 0 {
						tokens.Instance = 1
					}
					fallthrough
				case ':':
					tokens.Modify = LoadConsts(B1)
					tokens.Target = B2
				}

			} else if !tokens.Mul0Mod1 && (char == '*' || finalize) {
				tokens.Instance, _ = strconv.Atoi(strings.TrimSpace(builder.String()))
			} else {
				builder.WriteRune(char)
				return
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
			SetModifier(':', true)
		}
		tokens.Arguments = LoadConsts(strings.TrimSpace(builder.String()))

		if execute {
			Stack.Commands = append(Stack.Commands, tokens)

			if !tokens.Mul0Mod1 && tokens.Instance > 0 {
				if _, ok := Stack.Register.Get(tokens.Register); !ok {
					Stack.Register.Set(tokens.Register, NewReg())
				}
			}

			Stack.recent = tokens.Register
		}

		ok = true
	}

	return tokens, ok
}
