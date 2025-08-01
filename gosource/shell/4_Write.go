package shell

import (
	"strings"
)

// t_HeadingFunc is a type alias for functions that format a heading string.
type t_HeadingFunc func(string) string

// composeBlock is a helper function that combines a heading with contents.
func composeBlock(headingFunc t_HeadingFunc, heading string, contents []string) string {
	if len(contents) > 0 {
		contents = append(contents, Canvas.Unstyle)
	}
	return strings.Join(
		[]string{headingFunc(heading), strings.Join(contents, "\n")},
		"\n",
	)
}

// blockType provides functions to create different types of blocks using Tag heading functions.
var blockType = struct {
	Chapter func(heading string, contents []string) string
	Section func(heading string, contents []string) string
	Footer  func(heading string, contents []string) string
	Topic   func(heading string, contents []string) string
	Note    func(heading string, contents []string) string
	Points  func(heading string, contents []string) string
}{
	Chapter: func(heading string, contents []string) string {
		return composeBlock(Tag.H1, heading, contents)
	},
	Section: func(heading string, contents []string) string {
		return composeBlock(Tag.H2, heading, contents)
	},
	Footer: func(heading string, contents []string) string {
		return composeBlock(Tag.H3, heading, contents)
	},
	Topic: func(heading string, contents []string) string {
		return composeBlock(Tag.H4, heading, contents)
	},
	Note: func(heading string, contents []string) string {
		return composeBlock(Tag.H5, heading, contents)
	},
	Points: func(heading string, contents []string) string {
		return composeBlock(Tag.H6, heading, contents)
	},
}

// t_BlockColorFunc is a type alias for functions that apply color to a block.
type t_BlockColorFunc func(blockTypeFunc func(string, []string) string, heading string, contents []string) string

// blockColor provides functions to apply styling to blocks based on color settings.
var blockColor = struct {
	Std       t_BlockColorFunc
	Title     t_BlockColorFunc
	Text      t_BlockColorFunc
	Primary   t_BlockColorFunc
	Secondary t_BlockColorFunc
	Tertiary  t_BlockColorFunc
	Success   t_BlockColorFunc
	Failed    t_BlockColorFunc
	Warning   t_BlockColorFunc
}{
	Std: func(blockTypeFunc func(string, []string) string, heading string, contents []string) string {
		if styleFunc, ok := Style.Bold[Canvas.Settings.Primary]; ok {
			return styleFunc(blockTypeFunc(heading, contents))
		}
		return blockTypeFunc(heading, contents)
	},
	Title: func(blockTypeFunc func(string, []string) string, heading string, contents []string) string {
		if style, ok := Style.Bold[Canvas.Settings.Title]; ok {
			if textStyle, ok := Style.Text[Canvas.Settings.Title]; ok {
				styledContents := make([]string, len(contents))
				for i, content := range contents {
					styledContents[i] = textStyle(content)
				}
				return style(blockTypeFunc(heading, styledContents))
			}
		}
		return blockTypeFunc(heading, contents)
	},
	Text: func(blockTypeFunc func(string, []string) string, heading string, contents []string) string {
		if style, ok := Style.Bold[Canvas.Settings.Text]; ok {
			if textStyle, ok := Style.Text[Canvas.Settings.Text]; ok {
				styledContents := make([]string, len(contents))
				for i, content := range contents {
					styledContents[i] = textStyle(content)
				}
				return style(blockTypeFunc(heading, styledContents))
			}
		}
		return blockTypeFunc(heading, contents)
	},
	Primary: func(blockTypeFunc func(string, []string) string, heading string, contents []string) string {
		if style, ok := Style.Bold[Canvas.Settings.Primary]; ok {
			if textStyle, ok := Style.Text[Canvas.Settings.Primary]; ok {
				styledContents := make([]string, len(contents))
				for i, content := range contents {
					styledContents[i] = textStyle(content)
				}
				return style(blockTypeFunc(heading, styledContents))
			}
		}
		return blockTypeFunc(heading, contents)
	},
	Secondary: func(blockTypeFunc func(string, []string) string, heading string, contents []string) string {
		if style, ok := Style.Bold[Canvas.Settings.Secondary]; ok {
			if textStyle, ok := Style.Text[Canvas.Settings.Secondary]; ok {
				styledContents := make([]string, len(contents))
				for i, content := range contents {
					styledContents[i] = textStyle(content)
				}
				return style(blockTypeFunc(heading, styledContents))
			}
		}
		return blockTypeFunc(heading, contents)
	},
	Tertiary: func(blockTypeFunc func(string, []string) string, heading string, contents []string) string {
		if style, ok := Style.Bold[Canvas.Settings.Tertiary]; ok {
			if textStyle, ok := Style.Text[Canvas.Settings.Tertiary]; ok {
				styledContents := make([]string, len(contents))
				for i, content := range contents {
					styledContents[i] = textStyle(content)
				}
				return style(blockTypeFunc(heading, styledContents))
			}
		}
		return blockTypeFunc(heading, contents)
	},
	Success: func(blockTypeFunc func(string, []string) string, heading string, contents []string) string {
		if style, ok := Style.Bold[Canvas.Settings.Success]; ok {
			if textStyle, ok := Style.Text[Canvas.Settings.Success]; ok {
				styledContents := make([]string, len(contents))
				for i, content := range contents {
					styledContents[i] = textStyle(content)
				}
				return style(blockTypeFunc(heading, styledContents))
			}
		}
		return blockTypeFunc(heading, contents)
	},
	Failed: func(blockTypeFunc func(string, []string) string, heading string, contents []string) string {
		if style, ok := Style.Bold[Canvas.Settings.Failed]; ok {
			if textStyle, ok := Style.Text[Canvas.Settings.Failed]; ok {
				styledContents := make([]string, len(contents))
				for i, content := range contents {
					styledContents[i] = textStyle(content)
				}
				return style(blockTypeFunc(heading, styledContents))
			}
		}
		return blockTypeFunc(heading, contents)
	},
	Warning: func(blockTypeFunc func(string, []string) string, heading string, contents []string) string {
		if style, ok := Style.Bold[Canvas.Settings.Warning]; ok {
			if textStyle, ok := Style.Text[Canvas.Settings.Warning]; ok {
				styledContents := make([]string, len(contents))
				for i, content := range contents {
					styledContents[i] = textStyle(content)
				}
				return style(blockTypeFunc(heading, styledContents))
			}
		}
		return blockTypeFunc(heading, contents)
	},
}

// t_ListFunc is a type alias for functions that format a slice of strings into a list.
type t_ListFunc func(items []string, intent int) []string

// textApplyFunc is a type alias for functions that apply text style.
type textApplyFunc func(string) string

// t_BlockColorFormatter encapsulates the formatting functions for a specific color.
type t_BlockColorFormatter struct {
	Text    func(s string, intent int) string
	Item    func(s string, intent int) string
	Chapter func(heading string, contents []string, selectListType t_ListFunc, intent int) string
	Section func(heading string, contents []string, selectListType t_ListFunc, intent int) string
	Footer  func(heading string, contents []string, selectListType t_ListFunc, intent int) string
	Topic   func(heading string, contents []string, selectListType t_ListFunc, intent int) string
	Note    func(heading string, contents []string, selectListType t_ListFunc, intent int) string
	List    func(heading string, contents []string, selectListType t_ListFunc, intent int) string
	Block   func(contents []string, selectListType t_ListFunc, intent int) string
}

// newBlockColorFormatter is a helper to create BlockColorFormatter instances.
func newBlockColorFormatter(colorFn t_BlockColorFunc, textApplyFn textApplyFunc) *t_BlockColorFormatter {
	return &t_BlockColorFormatter{
		Text: func(s string, intent int) string {
			indented := strings.Repeat(Canvas.Tab, intent) + s
			if textApplyFn != nil {
				return indented + Canvas.Unstyle
			}
			return Canvas.Unstyle + indented
		},
		Item: func(s string, intent int) string {
			indented := strings.Repeat(Canvas.Tab, intent)
			if textApplyFn != nil {
				return indented + Tag.Li(textApplyFn(s))
			}
			return indented + Tag.Li(s)
		},
		Chapter: func(heading string, contents []string, selectListType t_ListFunc, intent int) string {
			if selectListType == nil {
				selectListType = List.Std.Blocks
			}
			return colorFn(blockType.Chapter, heading, selectListType(contents, intent))
		},
		Section: func(heading string, contents []string, selectListType t_ListFunc, intent int) string {
			if selectListType == nil {
				selectListType = List.Std.Blocks
			}
			return colorFn(blockType.Section, heading, selectListType(contents, intent))
		},
		Footer: func(heading string, contents []string, selectListType t_ListFunc, intent int) string {
			if selectListType == nil {
				selectListType = List.Std.Blocks
			}
			return colorFn(blockType.Footer, heading, selectListType(contents, intent))
		},
		Topic: func(heading string, contents []string, selectListType t_ListFunc, intent int) string {
			if selectListType == nil {
				selectListType = List.Std.Blocks
			}
			return colorFn(blockType.Topic, heading, selectListType(contents, intent))
		},
		Note: func(heading string, contents []string, selectListType t_ListFunc, intent int) string {
			if selectListType == nil {
				selectListType = List.Std.Blocks
			}
			return colorFn(blockType.Note, heading, selectListType(contents, intent))
		},
		List: func(heading string, contents []string, selectListType t_ListFunc, intent int) string {
			if selectListType == nil {
				selectListType = List.Std.Blocks
			}
			return colorFn(blockType.Points, heading, selectListType(contents, intent)) // Uses blockType.Points
		},
		Block: func(contents []string, selectListType t_ListFunc, intent int) string {
			if selectListType == nil {
				selectListType = List.Std.Blocks
			}
			styledContent := selectListType(contents, intent)
			joinedContent := strings.Join(styledContent, "\n")
			if textApplyFn != nil {
				return textApplyFn(joinedContent) + "\n"
			}
			return Canvas.Unstyle + joinedContent + "\n"
		},
	}
}

// t_BlockFormatter provides the public interface for formatting blocks with different colors.
type t_BlockFormatter struct {
	Std       *t_BlockColorFormatter
	Title     *t_BlockColorFormatter
	Text      *t_BlockColorFormatter
	Primary   *t_BlockColorFormatter
	Secondary *t_BlockColorFormatter
	Tertiary  *t_BlockColorFormatter
	Failed    *t_BlockColorFormatter
	Success   *t_BlockColorFormatter
	Warning   *t_BlockColorFormatter
}

// NewBlockFormatter creates and returns a new BlockFormatter instance.
var Block = func() *t_BlockFormatter {
	return &t_BlockFormatter{
		Std: newBlockColorFormatter(blockColor.Std, nil), // No specific text color for std
		Title: newBlockColorFormatter(blockColor.Title, func(s string) string {
			return Style.Text[Canvas.Settings.Title](s)
		}),
		Text: newBlockColorFormatter(blockColor.Text, func(s string) string { return Style.Text[Canvas.Settings.Text](s) }),
		Primary: newBlockColorFormatter(blockColor.Primary, func(s string) string {
			return Style.Text[Canvas.Settings.Primary](s)
		}),
		Secondary: newBlockColorFormatter(blockColor.Secondary, func(s string) string {
			return Style.Text[Canvas.Settings.Secondary](s)
		}),
		Tertiary: newBlockColorFormatter(blockColor.Tertiary, func(s string) string {
			return Style.Text[Canvas.Settings.Tertiary](s)
		}),
		Failed: newBlockColorFormatter(blockColor.Failed, func(s string) string {
			return Style.Text[Canvas.Settings.Failed](s)
		}),
		Success: newBlockColorFormatter(blockColor.Success, func(s string) string {
			return Style.Text[Canvas.Settings.Success](s)
		}),
		Warning: newBlockColorFormatter(blockColor.Warning, func(s string) string {
			return Style.Text[Canvas.Settings.Warning](s)
		}),
	}
}()
