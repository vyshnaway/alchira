package reader

type file_Position struct {
	Last        rune `json:"last"`
	Char        rune `json:"char"`
	Next        rune `json:"next"`
	Marker      int  `json:"marker"`
	RowMarker   int  `json:"rowMarker"`
	ColMarker   int  `json:"colMarker"`
	Cycle       int  `json:"cycle"`
	ColFallback int  `json:"colFallback"`
}

type Type struct {
	Runes     []rune
	Active    file_Position
	Fallback  file_Position
	Streaming bool
}

func Construct(content string) Type {
	This := Type{Runes: []rune(content)}
	This.Reset()
	return This
}

func (This *Type) Reset() {
	This.Active = file_Position{
		Marker:      0,
		RowMarker:   0,
		ColMarker:   0,
		Cycle:       0,
		ColFallback: 0,
	}
	This.Fallback = file_Position{
		Marker:      0,
		RowMarker:   0,
		ColMarker:   0,
		Cycle:       0,
		ColFallback: 0,
	}
	This.Streaming = true

	This.setCurrent()
	This._UpdateIncPosition()
}
