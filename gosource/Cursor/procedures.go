package Cursor

// Restore fallback state into active.
func (This *Class) LoadFallback() {
	This.Active = This.Fallback
}

// Save current active state as fallback (deep copy/value copy)
func (This *Class) SaveFallback() {
	This.Fallback = This.Active
}

// Helper to set active.Char (pointer to rune at Marker), safely
func (This *Class) setCurrent() {
	if This.Active.Marker < len(This.Runes) {
		This.Active.Char = This.Runes[This.Active.Marker]

		if This.Active.Marker+1 < len(This.Runes) {
			This.Active.Next = This.Runes[This.Active.Marker+1]
		} else {
			This.Active.Next = ' '
		}

		if This.Active.Marker > 0 {
			This.Active.Last = This.Runes[This.Active.Marker-1]
		} else {
			This.Active.Last = ' '
		}

	} else {
		This.Active.Char = ' '
		This.Streaming = false
	}
}

// Updates row/column markers based on current character
func (This *Class) _UpdateIncPosition() {
	if This.Active.Char == '\n' {
		This.Active.RowMarker++
		This.Active.ColFallback = This.Active.ColMarker
		This.Active.ColMarker = 0
	} else {
		This.Active.ColMarker++
	}
}

// Increment advances the marker and updates navigation.
func (This *Class) Increment() (Char rune, Streaming bool) {
	This.Active.Last = This.Active.Char
	This.Active.Marker++
	This.setCurrent()
	This._UpdateIncPosition()

	if This.Streaming {
		return This.Active.Char, This.Streaming
	}
	return ' ', This.Streaming
}

// Updates row/column markers based on current character
func (This *Class) updateDecPosition() {
	if This.Active.Char == '\n' {
		This.Active.RowMarker--
		This.Active.ColMarker = This.Active.ColFallback
	} else if This.Active.ColMarker > 0 {
		This.Active.ColMarker--
	}
}

// Decrement moves the marker back and updates navigation.
func (This *Class) Decrement() (Char rune, Streaming bool) {
	if This.Active.Marker > 0 {
		This.Active.Marker--
	}
	This.setCurrent()
	This.updateDecPosition()

	if This.Streaming {
		return This.Active.Char, This.Streaming
	}
	return ' ', This.Streaming
}
