package css

type T_BlockUnit struct {
	Selector string
	CssBlock *T_Block
}

type T_BlockSeq struct {
	Units []T_BlockUnit
}

func NewBlockSeq() *T_BlockSeq {
	return &T_BlockSeq{}
}

func (This *T_BlockSeq) AddDirective(selector string) {
	This.Units = append(This.Units, T_BlockUnit{
		Selector: selector,
		CssBlock: NewBlock(),
	})
}

func (This *T_BlockSeq) AddNewBlock(selector string, block *T_Block) {
	This.Units = append(This.Units, T_BlockUnit{
		Selector: selector,
		CssBlock: block,
	})
}

func (This *T_BlockSeq) Append(blocks ...T_BlockUnit) {
	This.Units = append(This.Units, blocks...)
}
