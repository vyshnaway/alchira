package shell

import (
	_term_ "golang.org/x/term"
	_strings_ "strings"
	_os_ "os"
)

// t_Root_Config holds terminal configuration settings
type t_Root_Config struct {
	TaskActive bool
	PostActive bool
	TabSpace   int
}

// t_Root_Divider holds characters used for drawing dividers
type t_Root_Divider struct {
	Top string
	Mid string
	Btm string
}

// Canvas holds terminal t_Root_Canvas settings and utilities
type t_Root_Canvas struct {
	Config  t_Root_Config
	Divider t_Root_Divider
	Tab     string
}

// Width returns the current terminal width
func (i *t_Root_Canvas) Width() int {
	width, _, err := _term_.GetSize(int(_os_.Stdout.Fd()))
	if err != nil || width <= 0 {
		return 48 // fallback width
	}
	return width
}

// Global Canvas instance - exported as GetCanvas()
var Canvas = &t_Root_Canvas{
	Config: t_Root_Config{
		TaskActive: true,
		PostActive: true,
		TabSpace:   2,
	},
	Divider: t_Root_Divider{
		Top: "‾",
		Mid: "─",
		Btm: "_",
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

func (i *t_Root_Canvas) Initialize(taskActive bool, postActive bool, tabWidth int) {
	width := i.Width()

	// Initialize tab spacing
	i.Tab = _strings_.Repeat(string(i.Tab[0]), tabWidth)

	// Set configuration
	i.Config.TaskActive = taskActive
	i.Config.PostActive = postActive

	// Initialize dividers with proper width
	i.Divider.Btm = _strings_.Repeat(string(i.Divider.Btm[0]), width)
	i.Divider.Mid = _strings_.Repeat(string(i.Divider.Mid[0]), width)
	i.Divider.Top = _strings_.Repeat(string(i.Divider.Top[0]), width)
}

// Format applies ANSI styles to a string
func Format(str string, preset []string, styles ...string) string {
	args := append(preset, styles...)
	if len(args) == 0 {
		return str
	}
	return "\x1b[" + _strings_.Join(args, ";") + "m" + str + "\x1b[0m"
}

// Post writes a formatted string to the terminal
func Post(str string, styles ...string) {
	render_Write(Format(str, Preset.None, styles...), 0)
}
