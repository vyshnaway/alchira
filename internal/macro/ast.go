package macro

import "main/package/object"

type OP struct {
	Type     E_Op
	Replace  string
	Modifier T_Modifier
	Instance int
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
	Render     *REG
	Register   *object.T[string, REG]
	Commands   []CMD
	PreInject  []CMD
	PostInject []CMD
	OnInject   *object.T[string, []CMD]
}

type REG struct {
	Index int
	Array []string
	Used  map[int]bool
}

func NewReg() REG {
	return REG{Array: []string{}, Used: map[int]bool{}}
}

func NewAst() *AST {
	stack := AST{
		recent:     "",
		Render:     nil,
		Register:   object.New[string, REG](4),
		Commands:   []CMD{},
		PreInject:  []CMD{},
		PostInject: []CMD{},
		OnInject:   object.New[string, []CMD](4),
	}
	stack.Register.Set("", NewReg())
	if r, k := stack.Register.Get(""); k {
		stack.Render = r
	}
	return &stack
}

func (Stack *AST) RegSet(ind int, reg string, val []string) {
	Stack.Register.Set(reg, REG{Array: []string{}, Index: ind})
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
				ast.OnInject.Set(t.Register, []CMD{t})
			}
		case '~':
			if ast.recent == "" {
				ast.PreInject = append(ast.PreInject, t)
			} else if v, k := ast.OnInject.Get(ast.recent); k {
				*v = append(*v, t)
			} else {
				ast.OnInject.Set(t.Register, []CMD{t})
			}
		}
	}
	return ast
}
