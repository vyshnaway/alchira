package macro

import "main/package/object"

// Instance = 0 means modifier
type CMD struct {
	Instance  int
	Mul0Mod1  bool
	Target    string
	Modify    string
	Register  string
	Arguments string
	RawString string
	Operation string
}

type AST struct {
	recent     string
	Render     *REG
	Variables  *object.T[string, REG]
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
		Variables:  object.New[string, REG](4),
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

func (Stack *AST) RegPush(reg, val string) {
	if v, k := Stack.Register.Get(reg); k {
		v.Array = append(v.Array, val)
	} else {
		Stack.Register.Set(reg, REG{Array: []string{}})
	}
}

func (Stack *AST) SetVariable(key, val string, idx int) {
	Stack.Variables.Set(key, REG{Array: []string{val}, Index: idx})
}

func (Stack *AST) RegPull(reg string) (*REG, bool) {
	return Stack.Register.Get(reg)
}

func BuildInjectionAst(lines []string) (ast *AST) {
	ast = NewAst()

	for _, line := range lines {
		t, _ := ast.Tokenize(line[1:], true)
		if !(t.Instance > 0 || len(t.Modify) > 0) {
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
