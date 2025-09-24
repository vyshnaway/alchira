package Cursor

import (
	_types_ "main/types"
)

type Class struct {
	Runes     []rune
	Active    _types_.File_Position
	Fallback  _types_.File_Position
	Streaming bool
}

// Factory/constructor for tCursor
func Construct(content string) Class {
	This := Class{Runes: []rune(" " + content + " ")}
	This.Reset()
	return This
}

func (This *Class) Reset() {
	This.Active = _types_.File_Position{
		Marker:      0,
		RowMarker:   0,
		ColMarker:   0,
		Cycle:       0,
		ColFallback: 0,
	}
	This.Fallback = _types_.File_Position{
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
