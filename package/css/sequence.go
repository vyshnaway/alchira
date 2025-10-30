package css

type T_BlockUnit struct {
	Selector string
	CssBlock *T_Block
}

type T_BlockSeq struct {
	Units []*T_BlockUnit
}

func NewBlockSeq(size int) *T_BlockSeq {
	return &T_BlockSeq{
		Units: make([]*T_BlockUnit, 0, size),
	}
}

func (This *T_BlockSeq) add(unit *T_BlockUnit) {
	if len(This.Units) == cap(This.Units) {
		newCap := cap(This.Units) * 2
		newSeq := make([]*T_BlockUnit, len(This.Units), newCap)
		copy(newSeq, This.Units)
		This.Units = newSeq
	}
	This.Units = append(This.Units, unit)
}

func (This *T_BlockSeq) AddDirective(selector string) {
	if selector == "" {
		return
	}
	This.add(&T_BlockUnit{Selector: selector, CssBlock: nil})
}

func (This *T_BlockSeq) AddNewBlock(selector string, block *T_Block) {
	if selector == "" {
		return
	}
	This.add(&T_BlockUnit{Selector: selector, CssBlock: block})
}

func (This *T_BlockSeq) Append(blocks ...*T_BlockUnit) {
	This.Units = append(This.Units, blocks...)
}
