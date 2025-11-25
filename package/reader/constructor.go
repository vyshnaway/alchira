package reader

type T_Position struct {
	Idx         int  `json:"idx"`
	Row         int  `json:"row"`
	Col         int  `json:"col"`
	Last        rune `json:"last"`
	Char        rune `json:"char"`
	Next        rune `json:"next"`
	Cycle       int  `json:"cycle"`
	ColFallback int  `json:"colFallback"`
}

type T_Range struct {
	Data  []string   `json:"data"`
	Start T_Position `json:"start"`
	End   T_Position `json:"end"`
}

type T_Reader struct {
	Runes     []rune
	Active    T_Position
	Fallback  T_Position
	Streaming bool
}

func New(content string) *T_Reader {
	This := T_Reader{Runes: []rune(content)}
	This.Reset()
	return &This
}

func (This *T_Reader) Reset() {
	This.Active = T_Position{
		Idx:         0,
		Row:         0,
		Col:         0,
		Cycle:       0,
		ColFallback: 0,
	}
	This.Fallback = T_Position{
		Idx:         0,
		Row:         0,
		Col:         0,
		Cycle:       0,
		ColFallback: 0,
	}
	This.Streaming = true

	This.setCurrent()
	This.updateIncPosition()
}
