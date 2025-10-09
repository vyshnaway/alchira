package reader

func (This *Type) LoadFallback() {
	This.Active = This.Fallback
}

func (This *Type) SaveFallback() {
	This.Fallback = This.Active
}

func (This *Type) setCurrent() {
	if This.Active.Marker < len(This.Runes) {
		This.Active.Char = This.Runes[This.Active.Marker]

		if This.Active.Marker+1 < len(This.Runes) {
			This.Active.Next = This.Runes[This.Active.Marker+1]
		} else {
			This.Active.Next = 0
		}

		if This.Active.Marker > 0 {
			This.Active.Last = This.Runes[This.Active.Marker-1]
		} else {
			This.Active.Last = 0
		}

	} else {
		This.Active.Char = 0
		This.Streaming = false
	}
}

func (This *Type) updateIncPosition() {
	if This.Active.Char == '\n' {
		This.Active.RowMarker++
		This.Active.ColFallback = This.Active.ColMarker
		This.Active.ColMarker = 0
	} else {
		This.Active.ColMarker++
	}
}

func (This *Type) Increment() (Char rune, Streaming bool) {
	This.Active.Last = This.Active.Char
	This.Active.Marker++
	This.setCurrent()
	This.updateIncPosition()

	if This.Streaming {
		return This.Active.Char, This.Streaming
	}
	return 0, This.Streaming
}

func (This *Type) updateDecPosition() {
	if This.Active.Char == '\n' {
		This.Active.RowMarker--
		This.Active.ColMarker = This.Active.ColFallback
	} else if This.Active.ColMarker > 0 {
		This.Active.ColMarker--
	}
}

func (This *Type) Decrement() (Char rune, Streaming bool) {
	if This.Active.Marker > 0 {
		This.Active.Marker--
	}
	This.setCurrent()
	This.updateDecPosition()

	if This.Streaming {
		return This.Active.Char, This.Streaming
	}
	return 0, This.Streaming
}

func (This *Type) Stream(autoincrement bool, function func()) {
	if autoincrement {
		for This.Streaming {
			function()
			This.Increment()
		}
	} else {
		for This.Streaming {
			function()
		}
	}
}
