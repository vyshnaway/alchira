package macro

import (
	"main/package/object"
	"strings"
)

type OP struct {
    Type     E_Op       `json:"Type"`      // Exported & Labeled
    Replace  string     `json:"Replace"`   // Exported & Labeled
    Modifier T_Modifier `json:"-"`         // HIDDEN 
    Instance int        `json:"Instance"`  // Exported & Labeled
}

type CMD struct {
	RawString string
	Register  string
	Operation string
	Operand   string
	Helper    string
	Arguments string
	OpRefer   OP
}

type AST struct {
	recent     string
	render     *REG
	Register   *object.T[string, REG]
	Commands   []*CMD
	PreInject  []*CMD
	PostInject []*CMD
	OnInject   *object.T[string, []*CMD]
}

type REG struct {
	Index int
	Array []string
	Used  map[int]bool
}

func NewAst() *AST {
	Stack := AST{
		recent:     "",
		render:     nil,
		Register:   object.New[string, REG](4),
		Commands:   []*CMD{},
		PreInject:  []*CMD{},
		PostInject: []*CMD{},
		OnInject:   object.New[string, []*CMD](4),
	}
	Stack.RegSet(0, "", []string{})
	if r, k := Stack.Register.Get(""); k {
		Stack.render = r
	}
	return &Stack
}

func (Stack *AST) RegSet(ind int, reg string, val []string) {
	Stack.Register.Set(reg, REG{Array: val, Index: ind})
	if reg == "" {
		if r, k := Stack.Register.Get(""); k {
			Stack.render = r
		}
	}
}

func (Stack *AST) Render() string {
	var compose strings.Builder
	if Stack.render.Index > 0 {
		for _, v := range Stack.render.Array {
			compose.WriteString(v)
		}
	} else {
		for _, v := range Stack.render.Array {
			compose.WriteString(v)
		}
	}
	return compose.String()
}

func BuildInjectionAst(lines []string) (ast *AST) {
	ast = NewAst()

	for _, line := range lines {
		t := ast.Tokenize(line[1:], true)
		if t.OpRefer.Type == E_Op_Invalid {
			continue
		}

		switch line[0] {
		case '<':
			ast.PreInject = append(ast.PreInject, t)
		case '>':
			ast.PostInject = append(ast.PostInject, t)
		case '=':
			ast.recent = t.Register
			if v, k := ast.OnInject.Get(t.Register); k {
				*v = append(*v, t)
			} else {
				ast.OnInject.Set(t.Register, []*CMD{t})
			}
		case '~':
			if ast.recent == "" {
				ast.PreInject = append(ast.PreInject, t)
			} else if v, k := ast.OnInject.Get(ast.recent); k {
				*v = append(*v, t)
			} else {
				ast.OnInject.Set(t.Register, []*CMD{t})
			}
		}
	}
	return ast
}
