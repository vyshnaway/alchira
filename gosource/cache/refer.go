package cache

var Refer = struct{
	BracePair   map[rune]rune
	OpenBraces  []rune
	CloseBraces []rune
	WatchQuotes []rune
} {
	BracePair: map[rune]rune{
		'{':  '}',
		'[':  ']',
		'(':  ')',
		'`':  '`',
		'"':  '"',
		'\'': '\'',
	},
	OpenBraces:  []rune{'[', '{', '('},
	CloseBraces: []rune{'\'', '"', '`'},
	WatchQuotes: []rune{']', '}', ')'},
}