package shell

import (
	_term "golang.org/x/term"
	_os "os"
	_strings "strings"
)

// tRoot_Config holds terminal configuration settings
type tRoot_Config struct {
	TaskActive bool
	PostActive bool
	TabSpace   int
}

// tRoot_DivRune holds characters used for drawing dividers
type tRoot_DivRune struct {
	Top rune
	Mid rune
	Btm rune
}

// Canvas holds terminal tRoot_Canvas settings and utilities
type tRoot_Canvas struct {
	Config  *tRoot_Config
	DivRune *tRoot_DivRune
	Tab     string
}

// Width returns the current terminal width
func (i *tRoot_Canvas) Width() int {
	width, _, err := _term.GetSize(int(_os.Stdout.Fd()))
	if err != nil || width <= 0 {
		return 48 // fallback width
	}
	return width
}

// Global Canvas instance - exported as GetCanvas()
var Canvas = &tRoot_Canvas{
	Config: &tRoot_Config{
		TaskActive: true,
		PostActive: true,
		TabSpace:   2,
	},
	DivRune: &tRoot_DivRune{
		Top: '‾',
		Mid: '─',
		Btm: '_',
	},
	Tab: " ",
}

// GetPreset returns the global preset instance
var Preset = struct {
	None      []string
	Title     []string
	Text      []string
	Link      []string
	Primary   []string
	Secondary []string
	Tertiary  []string
	Warning   []string
	Success   []string
	Failed    []string
}{
	None:      []string{},
	Title:     []string{Style.TC_Normal_Green},
	Text:      []string{Style.TC_Normal_White},
	Link:      []string{Style.AS_Underline},
	Primary:   []string{Style.TC_Normal_Yellow},
	Secondary: []string{Style.TC_Bright_Yellow},
	Tertiary:  []string{Style.TC_Bright_Black},
	Warning:   []string{Style.TC_Normal_Yellow},
	Success:   []string{Style.TC_Normal_Green},
	Failed:    []string{Style.TC_Normal_Red},
}

func (i *tRoot_Canvas) Initialize(taskActive bool, postActive bool, tabWidth int) {
	// Initialize tab spacing
	i.Tab = _strings.Repeat(string(i.Tab[0]), tabWidth)

	// Set configuration
	i.Config.TaskActive = taskActive
	i.Config.PostActive = postActive
}

func Divider(ch rune) string {
	return _strings.Repeat(string(ch), Canvas.Width())
}

// Format applies ANSI styles to a string
func Format(str string, preset []string, styles ...string) string {
	args := append(preset, styles...)
	if len(args) == 0 {
		return str
	}
	return "\x1b[" + _strings.Join(args, ";") + "m" + str + "\x1b[0m"
}

// Post writes a formatted string to the terminal
func Post(str string, styles ...string) {
	render_Write(Format(str, Preset.None, styles...), 0)
}
