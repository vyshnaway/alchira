package macro

import (
	"main/package/utils"
	"strconv"
	"strings"
)

type STACK struct {
	Register map[string][]string
	Commands []COMMAND
}

type COMMAND struct {
	Instance int // Instance 0 means modifier
	Register string
	Modifier string
	Argument []string
}

func NewStack(lines []string) STACK {
	stack := STACK{
		Register: map[string][]string{"": {}},
		Commands: []COMMAND{},
	}
	for _, line := range lines {
		tokens := Tokenizer(line)
		stack.Commands = append(stack.Commands, tokens)
		if stack.Register[tokens.Register] == nil {
			stack.Register[tokens.Register] = []string{}
		}
	}
	return stack
}

// $Key = 3*asdf{{replace}}
// $Key | {{replace}}=asdfs
// $Key | Modifier:args

// = 3*asdf
// | {replace}=asdf
// | Modifier:args, $Key

func Tokenizer(line string) COMMAND {
	result := COMMAND{
		Instance: 0,
		Register: "",
		Modifier: "",
		Argument: []string{},
	}
	var builder strings.Builder

	foundModifier := false
	gotSymbol := false

	for _, char := range line {

		if !gotSymbol {
			switch char {
			case '|':
				fallthrough
			case '=':
				result.Register = strings.TrimSpace(builder.String())
				gotSymbol = true
				builder.Reset()
				continue
			default:
				builder.WriteRune(char)
			}
		} else if !foundModifier {
			switch char {
			case ':':
				result.Modifier = strings.TrimSpace(builder.String())
				foundModifier = true
				builder.Reset()
			case '*':
				result.Instance, _ = strconv.Atoi(strings.TrimSpace(builder.String()))
				if result.Instance == 0 {
					result.Instance = 1
				}
				foundModifier = true
				builder.Reset()
				continue
			default:
				builder.WriteRune(char)
			}
		} else {
			builder.WriteRune(char)
		}
	}

	if result.Instance == 0 {
		result.Argument = utils.String_ZeroBreaks(builder.String(), []rune{','})
	} else {
		result.Argument = []string{builder.String()}
	}

	return result
}
