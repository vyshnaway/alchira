package shell

import (
	"fmt"
	"math"
	"strings"
)

type t_ListColorFunc func(string) string

// list_color provides functions to apply specific styles based on canvas settings.
// These functions retrieve the appropriate styling function from Style.
var list_color = struct {
	Std       t_ListColorFunc
	Title     t_ListColorFunc
	Text      t_ListColorFunc
	Primary   t_ListColorFunc
	Secondary t_ListColorFunc
	Tertiary  t_ListColorFunc
	Warning   t_ListColorFunc
	Failed    t_ListColorFunc
	Success   t_ListColorFunc
}{
	Std: func(item string) string {
		return Canvas.Unstyle + item
	},
	Title: func(item string) string {
		if styleFunc, ok := Style.Text[Canvas.Settings.Title]; ok {
			return styleFunc(item)
		}
		return item
	},
	Text: func(item string) string {
		if styleFunc, ok := Style.Text[Canvas.Settings.Text]; ok {
			return styleFunc(item)
		}
		return item
	},
	Primary: func(item string) string {
		if styleFunc, ok := Style.Text[Canvas.Settings.Primary]; ok {
			return styleFunc(item)
		}
		return item
	},
	Secondary: func(item string) string {
		if styleFunc, ok := Style.Text[Canvas.Settings.Secondary]; ok {
			return styleFunc(item)
		}
		return item
	},
	Tertiary: func(item string) string {
		if styleFunc, ok := Style.Text[Canvas.Settings.Tertiary]; ok {
			return styleFunc(item)
		}
		return item
	},
	Warning: func(item string) string {
		if styleFunc, ok := Style.Text[Canvas.Settings.Warning]; ok {
			return styleFunc(item)
		}
		return item
	},
	Failed: func(item string) string {
		if styleFunc, ok := Style.Text[Canvas.Settings.Failed]; ok {
			return styleFunc(item)
		}
		return item
	},
	Success: func(item string) string {
		if styleFunc, ok := Style.Text[Canvas.Settings.Success]; ok {
			return styleFunc(item)
		}
		return item
	},
}

// list_types contains the core formatting logic functions.
var list_types = struct {
	Props      func(items map[string]string, color t_ListColorFunc, intent int) []string
	Entries    func(items []string, color t_ListColorFunc, intent int) []string
	Blocks     func(items []string, color t_ListColorFunc, intent int) []string
	Bullets    func(items []string, color t_ListColorFunc, intent int) []string
	Numbers    func(items []string, color t_ListColorFunc, intent int) []string
	Intetnts func(items []string, color t_ListColorFunc, intent int) []string
	Waterfall  func(items []string, color t_ListColorFunc, intent int) []string
}{
	Props: func(items map[string]string, color t_ListColorFunc, intent int) []string {
		var result []string
		keyLength := 0
		for key := range items {
			if len(key) > keyLength {
				keyLength = len(key)
			}
		}

		for key, value := range items {
			keyColumn := fmt.Sprintf("%-*s", keyLength, key) // padEnd equivalent
			styledKey := ""
			if styleFunc, ok := Style.Bold[Canvas.Settings.Secondary]; ok {
				styledKey = styleFunc(keyColumn + Canvas.Tab + ":")
			} else {
				styledKey = keyColumn + Canvas.Tab + ":"
			}

			formattedLine := strings.Repeat(Canvas.Tab, intent) +
				styledKey +
				Tag.Div(color(Canvas.Tab+value)) 

			result = append(result, formattedLine)
		}
		return result
	},
	Entries: func(items []string, color t_ListColorFunc, intent int) []string {
		var result []string
		size := 0
		for _, item := range items {
			if len(item) > size {
				size = len(item)
			}
		}
		size += intent + len(Canvas.Tab)

		cols := int(math.Floor(float64(Canvas.Settings.Width) / float64(size+3)))
		if cols == 0 { 
			cols = 1
		}

		subResult := ""
		for i, item := range items {
			paddedItem := fmt.Sprintf("%-*s", size, item) // padEnd equivalent
			if (i+1)%cols != 0 {
				subResult += Tag.Li(color(paddedItem)) 
			} else {
				subResult += Tag.Li(color(paddedItem))
				result = append(result, subResult)
				subResult = ""
			}
		}
		if len(subResult) > 0 {
			result = append(result, subResult)
		}
		return result
	},
	Blocks: func(items []string, color t_ListColorFunc, intent int) []string {
		var result []string
		for _, item := range items {
			formattedLine := strings.Repeat(Canvas.Tab, intent) +
				Tag.Div(color(item)) 
			result = append(result, formattedLine)
		}
		return result
	},
	Bullets: func(items []string, color t_ListColorFunc, intent int) []string {
		var result []string
		for _, item := range items {
			formattedLine := strings.Repeat(Canvas.Tab, intent) +
				Tag.Li(color(item)) 
			result = append(result, formattedLine)
		}
		return result
	},
	Numbers: func(items []string, color t_ListColorFunc, intent int) []string {
		var result []string
		for i, item := range items {
			styledIndex := ""
			if styleFunc, ok := Style.Bold[Canvas.Settings.Secondary]; ok {
				styledIndex = styleFunc(fmt.Sprintf("%d", i+1))
			} else {
				styledIndex = fmt.Sprintf("%d", i+1)
			}

			formattedLine := strings.Repeat(Canvas.Tab, intent) +
				styledIndex +
				strings.Repeat(Canvas.Tab, 1) +
				Tag.Div(color(item)) 
			result = append(result, formattedLine)
		}
		return result
	},
	Intetnts: func(items []string, color t_ListColorFunc, intent int) []string {
		var result []string
		for _, item := range items {
			newlines := ""
			if intent > 1 {
				newlines = strings.Repeat("\n", intent-1)
			}
			formattedLine := newlines + Tag.P(color(item)) 
			result = append(result, formattedLine)
		}
		return result
	},
	Waterfall: func(items []string, color t_ListColorFunc, intent int) []string {
		var result []string
		for i, item := range items {
			prefix := "├─>"
			if i == len(items)-1 {
				prefix = "└─>"
			}

			styledPrefix := ""
			if styleFunc, ok := Style.Bold[Canvas.Settings.Secondary]; ok {
				styledPrefix = styleFunc(prefix)
			} else {
				styledPrefix = prefix
			}

			formattedLine := strings.Repeat(Canvas.Tab, intent) +
				styledPrefix +
				color(strings.Repeat(Canvas.Tab, 1)+item)
			result = append(result, formattedLine)
		}
		return result
	},
}

// t_ListTypeFormatter encapsulates the formatting functions for a specific color.
type t_ListTypeFormatter struct {
	Props     func(items map[string]string, intent int) []string
	Blocks    func(items []string, intent int) []string
	Entries   func(items []string, intent int) []string
	Bullets   func(items []string, intent int) []string
	Numbers   func(items []string, intent int) []string
	Intents   func(items []string, intent int) []string
	Waterfall func(items []string, intent int) []string
}

// n_ListTypeFormatter is a helper to create ListTypeFormatter instances.
func n_ListTypeFormatter(colorFn t_ListColorFunc) *t_ListTypeFormatter {
	return &t_ListTypeFormatter{
		Props: func(items map[string]string, intent int) []string {
			return list_types.Props(items, colorFn, intent)
		},
		Blocks: func(items []string, intent int) []string {
			return list_types.Blocks(items, colorFn, intent)
		},
		Entries: func(items []string, intent int) []string {
			return list_types.Entries(items, colorFn, intent)
		},
		Bullets: func(items []string, intent int) []string {
			return list_types.Bullets(items, colorFn, intent)
		},
		Numbers: func(items []string, intent int) []string {
			return list_types.Numbers(items, colorFn, intent)
		},
		Intents: func(items []string, intent int) []string {
			return list_types.Intetnts(items, colorFn, intent)
		},
		Waterfall: func(items []string, intent int) []string {
			return list_types.Waterfall(items, colorFn, intent)
		},
	}
}

// t_ListFormatter provides the public interface for formatting lists with different varient.
type t_ListFormatter struct {
	Std       *t_ListTypeFormatter
	Title     *t_ListTypeFormatter
	Text      *t_ListTypeFormatter
	Primary   *t_ListTypeFormatter
	Secondary *t_ListTypeFormatter
	Tertiary  *t_ListTypeFormatter
	Failed    *t_ListTypeFormatter
	Success   *t_ListTypeFormatter
	Warning   *t_ListTypeFormatter
}


// Export the default ListFormatter instance.
var List = t_ListFormatter{
	Std:       n_ListTypeFormatter(list_color.Std),
	Title:     n_ListTypeFormatter(list_color.Title),
	Text:      n_ListTypeFormatter(list_color.Text),
	Primary:   n_ListTypeFormatter(list_color.Primary),
	Secondary: n_ListTypeFormatter(list_color.Secondary),
	Tertiary:  n_ListTypeFormatter(list_color.Tertiary),
	Failed:    n_ListTypeFormatter(list_color.Failed),
	Success:   n_ListTypeFormatter(list_color.Success),
	Warning:   n_ListTypeFormatter(list_color.Warning),
}
