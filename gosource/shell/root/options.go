package root

// t_Config holds terminal configuration settings
type t_Config struct {
	TaskActive bool
	PostActive bool
	TabSpace   int
}

// t_Divider holds characters used for drawing dividers
type t_Divider struct {
	Top string
	Mid string
	Btm string
}

// Canvas holds terminal t_Canvas settings and utilities
type t_Canvas struct {
	Config  t_Config
	Divider t_Divider
	Tab     string
}

// Global canvas instance - exported as GetCanvas()
var Canvas = &t_Canvas{
	Config: t_Config{
		TaskActive: true,
		PostActive: true,
		TabSpace:   2,
	},
	Divider: t_Divider{
		Top: "‾",
		Mid: "─",
		Btm: "_",
	},
	Tab: " ",
}

// GetPreset returns the global preset instance
var Preset = struct {
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
