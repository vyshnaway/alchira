package shell

import (
	"fmt"
	"strings"
)


// Task prints a task message with specific styling.
func Task(s string, rowshift int) {
	if rowshift < 0 {
		rowshift = -rowshift
	}

	if Canvas.Settings.TaskActive && Canvas.Settings.PostActive {
		var parts []string

		if rowshift > 0 {
			if brFunc, ok := Tag.Br.(func(int) string); ok {
				parts = append(parts, brFunc(rowshift))
			} else {
				fmt.Println("Error: Tag.Br is not a func(int) string in Task")
			}
		}

		if divFunc, ok := Tag.Div.(func(string) string); ok {
			if styleFuncMap, ok := Style[Canvas.Appearance.BoldDim]; ok {
				if styleFunc, ok := styleFuncMap[Canvas.Settings.Primary]; ok {
					parts = append(parts, divFunc(styleFunc(">>>")))
				}
			}
		} else {
			fmt.Println("Error: Tag.Div is not a func(string) string in Task (for >>>)")
		}

		parts = append(parts, Canvas.Tab)
		if divFunc, ok := Tag.Div.(func(string) string); ok {
			if styleFuncMap, ok := Style[Canvas.Appearance.BoldItalic]; ok {
				if styleFunc, ok := styleFuncMap[Canvas.Settings.Tertiary]; ok {
					parts = append(parts, divFunc(styleFunc(s+".")))
				}
			}
		} else {
			fmt.Println("Error: Tag.Div is not a func(string) string in Task (for string)")
		}

		// Add a single line break
		if brFunc, ok := Tag.Br.(func(int) string); ok {
			parts = append(parts, brFunc(1))
		} else {
			fmt.Println("Error: Tag.Br is not a func(int) string in Task (for Br(1))")
		}

		// Join all parts and write using post.Write
		post.Write(strings.Join(parts, ""), rowshift)
	}
}

// Step prints a step message with specific styling.
func Step(s string, rowshift int) {
	if rowshift < 0 {
		rowshift = -rowshift // Adjust rowshift based on JavaScript's default parameter logic
	}

	if Canvas.Settings.TaskActive && Canvas.Settings.PostActive {
		var parts []string

		// Add line breaks if rowshift is positive
		if rowshift > 0 {
			if brFunc, ok := Tag.Br.(func(int) string); ok {
				parts = append(parts, brFunc(rowshift))
			} else {
				fmt.Println("Error: Tag.Br is not a func(int) string in Step")
			}
		}

		// Add ">>>" with boldDim primary style
		if divFunc, ok := Tag.Div.(func(string) string); ok {
			if styleFuncMap, ok := Style[Canvas.Appearance.BoldDim]; ok {
				if styleFunc, ok := styleFuncMap[Canvas.Settings.Primary]; ok {
					parts = append(parts, divFunc(styleFunc(">>>")))
				}
			}
		} else {
			fmt.Println("Error: Tag.Div is not a func(string) string in Step (for >>>)")
		}

		parts = append(parts, Canvas.Tab)

		// Add the step string with italic tertiary style
		if divFunc, ok := Tag.Div.(func(string) string); ok {
			if styleFuncMap, ok := Style[Canvas.Appearance.Italic]; ok {
				if styleFunc, ok := styleFuncMap[Canvas.Settings.Tertiary]; ok {
					parts = append(parts, divFunc(styleFunc(s+" ...")))
				}
			}
		} else {
			fmt.Println("Error: Tag.Div is not a func(string) string in Step (for string)")
		}

		// Join all parts and write using post.Write
		post.Write(strings.Join(parts, ""), rowshift)
	}
}

// Post prints a general message with optional custom styling and tag.
// customStyleFunc: A function to apply custom styling. If nil, default style is used.
// customTagFunc: A function to wrap the content with a custom tag. If nil, default tag.Div is used.
func Post(s string, customStyleFunc func(string) string, customTagFunc func(string) string) {
	if Canvas.Settings.PostActive {
		finalString := s

		// Determine the style function to use
		styleToApply := customStyleFunc
		if styleToApply == nil {
			// Default style: style.dim[canvas.settings.text]
			if styleFuncMap, ok := Style[Canvas.Appearance.Dim]; ok {
				if defaultStyle, ok := styleFuncMap[Canvas.Settings.Text]; ok {
					styleToApply = defaultStyle
				} else {
					// Fallback if default style not found
					styleToApply = func(s string) string { return s }
					fmt.Println("Warning: Default style (Dim Text) not found in Style map.")
				}
			} else {
				styleToApply = func(s string) string { return s }
				fmt.Println("Warning: Style[Canvas.Appearance.Dim] not found.")
			}
		}

		// Determine the tag function to use
		tagToApply := customTagFunc
		if tagToApply == nil {
			// Default tag: tag.Div
			if divFunc, ok := Tag.Div.(func(string) string); ok {
				tagToApply = divFunc
			} else {
				// Fallback if Div function not found
				tagToApply = func(s string) string { return s }
				fmt.Println("Warning: Tag.Div is not a func(string) string. Using plain string.")
			}
		}

		// Apply tag and style, then write using post.Write. rowshift is 0 for Post.
		content := tagToApply(finalString)
		post.Write(styleToApply(content), 0)
	}
}

// Exported variables and functions, mirroring the JavaScript module's exports.
// var (
// 	Tag  = Tag      // Reference to the Tag struct from the shell package
// 	List = struct{}{}     // Placeholder for list, assuming it's a separate package/struct
// 	Style = Style   // Reference to the Style map from the shell package
// 	Canvas = Canvas // Reference to the Canvas constant/variable from the shell package
// 	Render = post.Write   // Reference to the Write function from the post package
// 	Play = frames.Play    // Reference to the Play function from the frames package
// 	Mold = post.Write     // Another reference to the Write function from the post package

// 	// Renamed functions for export, matching the JavaScript module's naming convention
// 	TASK = Task
// 	STEP = Step
// 	POST = Post
// )