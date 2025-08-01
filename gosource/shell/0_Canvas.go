package shell

import (
	"fmt"
	"os"

	"strings"

	"golang.org/x/term"
)

// t_Colors defines color names as string labels.
type t_Colors struct {
	Red     int
	Orange  int
	Yellow  int
	Green   int
	Cyan    int
	Blue    int
	Purple  int
	Magenta int
	Pink    int
	Grey    int
	White   int
}

var Canvas_colors = t_Colors{
	Red:     0,
	Orange:  1,
	Yellow:  2,
	Green:   3,
	Cyan:    4,
	Blue:    5,
	Purple:  6,
	Magenta: 7,
	Pink:    8,
	Grey:    9,
	White:   10,
}

// t_Settings defines various Canvas settings.
type t_Settings struct {
	Title      int
	Text       int
	Primary    int
	Secondary  int
	Tertiary   int
	Success    int
	Failed     int
	Warning    int
	Width      int
	TabSpace   int
	TaskActive bool
	PostActive bool
}

var Canvas_settings = t_Settings{
	Title:      Canvas_colors.Green,
	Text:       Canvas_colors.White,
	Primary:    Canvas_colors.Orange,
	Secondary:  Canvas_colors.Yellow,
	Tertiary:   Canvas_colors.Grey,
	Success:    Canvas_colors.Green,
	Failed:     Canvas_colors.Red,
	Warning:    Canvas_colors.Orange,
	Width:      80,
	TabSpace:   2,
	TaskActive: true,
	PostActive: true,
}

// t_Divider defines characters used for dividers.
type t_Divider struct {
	Top string
	Mid string
	Low string
}

var Canvas_divider = t_Divider{
	Top: "‾",
	Mid: "─",
	Low: "_",
}

// --- EXPORTS ---

// Options, Settings & Standereds for instance
var Canvas = struct {
	Unstyle  string
	Color    t_Colors
	Settings t_Settings
	Divider  t_Divider
	Tab      string
}{
	Unstyle:  "\x1b[0m",
	Color:    Canvas_colors,
	Settings: Canvas_settings,
	Divider:  Canvas_divider,
	Tab:      " ",
}

func RefetchWidth() (int, error) {
	width, _, err := term.GetSize(int(os.Stdout.Fd()))
	if err != nil {
		Canvas.Settings.Width = 48
		return Canvas.Settings.Width, fmt.Errorf("error getting terminal size: %w", err)
	}
	Canvas.Settings.Width = width
	return Canvas.Settings.Width, nil
}

// Use CanvasWidth = 0, for autofetching Canvaswidth
func Initialize(taskActive bool, postActive bool, tabWidth int, CanvasWidth int) {
	if CanvasWidth == 0 {
		RefetchWidth()
	} else {
		Canvas.Settings.Width = CanvasWidth
	}

	if len(Canvas.Tab) > 0 {
		Canvas.Tab = strings.Repeat(string(Canvas.Tab[0]), tabWidth)
	} else {
		Canvas.Tab = strings.Repeat(" ", tabWidth)
	}

	Canvas.Settings.TaskActive = taskActive
	Canvas.Settings.PostActive = postActive

	if len([]rune(Canvas.Divider.Low)) > 0 {
		firstRune := []rune(Canvas.Divider.Low)[0]
		Canvas.Divider.Low = strings.Repeat(string(firstRune), CanvasWidth)
	}

	if len([]rune(Canvas.Divider.Mid)) > 0 {
		firstRune := []rune(Canvas.Divider.Mid)[0]
		Canvas.Divider.Mid = strings.Repeat(string(firstRune), CanvasWidth)
	}

	if len([]rune(Canvas.Divider.Top)) > 0 {
		firstRune := []rune(Canvas.Divider.Top)[0]
		Canvas.Divider.Top = strings.Repeat(string(firstRune), CanvasWidth)
	}
}
