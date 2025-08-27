package root

import (
	"main/shell/render"
	"os"
	"strings"

	"golang.org/x/term"
)

// Initialize sets up the Canvas with the specified settings
func (i *t_Canvas) Initialize(taskActive bool, postActive bool, tabWidth int) {
	width := i.Width()

	// Initialize tab spacing
	i.Tab = strings.Repeat(string(i.Tab[0]), tabWidth)

	// Set configuration
	i.Config.TaskActive = taskActive
	i.Config.PostActive = postActive

	// Initialize dividers with proper width
	i.Divider.Btm = strings.Repeat(string(i.Divider.Btm[0]), width)
	i.Divider.Mid = strings.Repeat(string(i.Divider.Mid[0]), width)
	i.Divider.Top = strings.Repeat(string(i.Divider.Top[0]), width)
}

// Width returns the current terminal width
func (i *t_Canvas) Width() int {
	width, _, err := term.GetSize(int(os.Stdout.Fd()))
	if err != nil || width <= 0 {
		return 48 // fallback width
	}
	return width
}

// Post writes a formatted string to the terminal
func Post(str string, styles ...string) {
	render.Write(Format(str, styles...), 0)
}

// Format applies ANSI styles to a string
func Format(str string, styles ...string) string {
	if len(styles) == 0 {
		return str
	}
	return "\x1b[" + strings.Join(styles, ";") + "m" + str + "\x1b[0m"
}
