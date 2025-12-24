package macro

import (
	"strconv"
	"strings"
)

type E_Op int

const (
	E_Op_Invalid E_Op = iota
	E_Op_Instances
	E_Op_Modifier
	E_Op_Replace
)

func OpType(op string) OP {
	var Op OP
	if v, e := Modifiers[op]; e {
		Op.Type = E_Op_Modifier
		Op.Modifier = v
	} else if v, e := strconv.Atoi(op); e == nil {
		Op.Type = E_Op_Instances
		Op.Instance = v
	} else {
		Op.Type = E_Op_Replace
		Op.Replace = op
	}
	return Op
}

// execmod = Inject values to Stack
func (Stack *AST) Tokenize(Command string, execute bool) (tokens CMD) {
	ASSIGN := '='
	USING := '~'
	WITH := '|'

	LoadConsts := func(str string) string {
		if execute {
			Stack.Register.Range(func(k string, v REG) {
				if len(k) > 0 && len(v.Array) > 0 {
					str = strings.ReplaceAll(str, k, v.Array[0])
				}
			})
		}
		return str
	}

	tokens = CMD{RawString: Command}

	gotRegister := false
	gotOperator := false
	var builder strings.Builder

	for _, char := range Command {
		if !gotRegister {
			if char == ASSIGN {
				tokens.Register = strings.TrimSpace(builder.String())
				gotRegister = true
				builder.Reset()
			} else {
				builder.WriteRune(char)
			}
		} else {
			builder.WriteRune(char)
		}
	}
	tokens.Operation = strings.TrimSpace(builder.String())
	Command = tokens.Operation
	builder.Reset()

	if gotRegister {

		// Get Modifier Data
		SetModifier := func(char rune, finalize bool) {
			if WITH == char || finalize {
				tmp := strings.TrimSpace(builder.String())
				var onmod = true
				var b1, b2 strings.Builder
				for _, c := range tmp {
					if onmod {
						if c == USING {
							onmod = false
						} else {
							b1.WriteRune(c)
						}
					} else {
						b2.WriteRune(c)
					}
				}

				tokens.Operand = strings.TrimSpace(b1.String())
				tokens.Helper = strings.TrimSpace(b2.String())
				gotOperator = true
				builder.Reset()

			} else {
				builder.WriteRune(char)
				return
			}
		}

		for _, char := range Command {
			if !gotOperator {
				SetModifier(char, false)
			} else {
				builder.WriteRune(char)
			}
		}
		if !gotOperator {
			SetModifier('|', true)
		}
		tokens.Arguments = strings.TrimSpace(builder.String())
		tokens.Arguments = LoadConsts(tokens.Arguments)
		tokens.Operand = LoadConsts(tokens.Operand)
		tokens.Helper = LoadConsts(tokens.Helper)
		tokens.OpRefer = OpType(tokens.Operand)

		if execute {
			Stack.Commands = append(Stack.Commands, tokens)

			if _, ok := Stack.Register.Get(tokens.Register); !ok {
				Stack.RegSet(0, tokens.Register, []string{})
			}

			Stack.recent = tokens.Register
		}
	}

	return tokens
}
