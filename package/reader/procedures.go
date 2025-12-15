package reader

func (This *T_Reader) LoadFallback() {
	This.Active = This.Fallback
}

func (This *T_Reader) SaveFallback() {
	This.Fallback = This.Active
}

func (This *T_Reader) setCurrent() {
	if This.Active.Idx < len(This.Runes) {
		This.Active.Char = This.Runes[This.Active.Idx]

		if This.Active.Idx+1 < len(This.Runes) {
			This.Active.Next = This.Runes[This.Active.Idx+1]
		} else {
			This.Active.Next = 0
		}

		if This.Active.Idx > 0 {
			This.Active.Last = This.Runes[This.Active.Idx-1]
		} else {
			This.Active.Last = 0
		}

	} else {
		This.Active.Char = 0
		This.Streaming = false
	}
}

func (This *T_Reader) updateIncPosition() {
	if This.Active.Char == '\n' {
		This.Active.Row++
		This.Active.ColFallback = This.Active.Col
		This.Active.Col = 0
	} else {
		This.Active.Col++
	}
}

func (This *T_Reader) Increment() (Char rune, Streaming bool) {
	This.Active.Last = This.Active.Char
	This.Active.Idx++
	This.setCurrent()
	This.updateIncPosition()

	if This.Streaming {
		return This.Active.Char, This.Streaming
	}
	return 0, This.Streaming
}

func (This *T_Reader) updateDecPosition() {
	if This.Active.Char == '\n' {
		This.Active.Row--
		This.Active.Col = This.Active.ColFallback
	} else if This.Active.Col > 0 {
		This.Active.Col--
	}
}

func (This *T_Reader) Decrement() (Char rune, Streaming bool) {
	if This.Active.Idx > 0 {
		This.Active.Idx--
	}
	This.setCurrent()
	This.updateDecPosition()

	if This.Streaming {
		return This.Active.Char, This.Streaming
	}
	return 0, This.Streaming
}

func (This *T_Reader) Stream(autoincrement bool, function func()) {
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

func (This *T_Reader) Slice(start, end int) []rune {
    if start < 0 {
        start = 0
    }
    if end > len(This.Runes) {
        end = len(This.Runes)
    }
    if start > end {
        start = end
    }
    return This.Runes[start:end]
}
