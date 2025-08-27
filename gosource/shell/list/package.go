package list

// T exports all list package functionality
type T struct {
	Bullets    List
	Numbers    List
	Level      List
	Paragraphs List
	Breaks     List
	Waterfall  List
	Catalog    List
}

// E provides package-level access to list functions
var E = &T{
	Bullets:    Bullets,
	Numbers:    Numbers,
	Level:      Level,
	Paragraphs: Paragraphs,
	Breaks:     Breaks,
	Waterfall:  Waterfall,
	Catalog:    Catalog,
}
