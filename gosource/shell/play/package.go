package play

// T exports all play package functionality
type T struct {
	Title func(string, int, int) error
	Loki  func(string, int, int) error
}

// E provides package-level access to play functions
var E = &T{
	Title: Title,
	Loki:  Loki,
}
