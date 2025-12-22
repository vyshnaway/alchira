package macro

import "main/package/object"

// Instance = 0 means modifier
type CMD struct {
	Instance  int
	Register  string
	Modifier  string
	Argument  string
	RawString string
	ArgString string
}

type AST struct {
	recent     string
	Register   *object.T[string, []string]
	Commands   []CMD
	PreInject  []CMD
	PostInject []CMD
	OnInject   map[string][]CMD
}

func NewAst() *AST {
	stack := AST{
		recent:     "",
		Register:   object.New[string, []string](4),
		Commands:   []CMD{},
		PreInject:  []CMD{},
		PostInject: []CMD{},
		OnInject:   map[string][]CMD{},
	}
	stack.Register.Set("", []string{})
	return &stack
}

func InjectAst(lines []string) (ast *AST) {
	ast = NewAst()

	for _, line := range lines {
		t, _ := ast.Tokenize(line[1:], true)
		if !(t.Instance > 0 || len(t.Modifier) > 0) {
			continue
		}

		switch line[0] {
		case '<':
			ast.PreInject = append(ast.PreInject, t)
		case '>':
			ast.PostInject = append(ast.PostInject, t)
		case '=':
			ast.recent = t.Register
			if ast.OnInject[t.Register] == nil {
				ast.OnInject[t.Register] = []CMD{t}
			} else {
				ast.OnInject[t.Register] = append(ast.PreInject, t)
			}
		case '~':
			if ast.recent == "" {
				ast.PreInject = append(ast.PreInject, t)
			} else if ast.OnInject[ast.recent] == nil {
				ast.OnInject[ast.recent] = []CMD{t}
			} else {
				ast.OnInject[ast.recent] = append(ast.PreInject, t)
			}
		}
	}
	return ast
}
