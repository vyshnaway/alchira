package tag

// T exports all tag package functionality
type T struct {
	H1   func(content string, presets []string, styles ...string) string
	H2   func(content string, presets []string, styles ...string) string
	H3   func(content string, presets []string, styles ...string) string
	H4   func(content string, presets []string, styles ...string) string
	H5   func(content string, presets []string, styles ...string) string
	H6   func(content string, presets []string, styles ...string) string
	P    func(content string, presets []string, styles ...string) string
	Span func(content string, presets []string, styles ...string) string
	Li   func(content string, presets []string, styles ...string) string
	Hr   func(content string, presets []string, styles ...string) string
	Br   func(repeat int, presets []string, styles ...string) string
	Tab  func(repeat int, presets []string, styles ...string) string
}

// E provides package-level access to tag functions
var E = &T{
	H1:   H1,
	H2:   H2,
	H3:   H3,
	H4:   H4,
	H5:   H5,
	H6:   H6,
	P:    P,
	Span: Span,
	Li:   Li,
	Hr:   Hr,
	Br:   Br,
	Tab:  Tab,
}
