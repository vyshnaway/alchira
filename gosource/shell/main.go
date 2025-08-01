package shell

import (
	"fmt"
	"strings"
)

// TASK prints a task message with specific styling.
func TASK(s string, rowshift int) {
	// Adjust rowshift: JS default -1 means "no shift, just clear current line",
	// but when used with render.write(..., -rowshift) it becomes positive.
	// Here, we'll interpret negative rowshift as "no explicit up-shift",
	// and positive as "shift up by that many rows".
	actualRowshift := 0
	if rowshift < 0 {
		// If original JS was -1, it means no explicit row shift for cursor, but clear screen.
		// If JS was -X, it means clear screen.
		// For Go, post.Write(-X) means clear screen.
		actualRowshift = rowshift
	} else if rowshift > 0 {
		actualRowshift = rowshift
	}

	if Canvas.Settings.TaskActive && Canvas.Settings.PostActive {
		var parts []string

		// Add line breaks if rowshift is positive (for visual spacing before task)
		if rowshift > 0 { // Only add breaks if positive rowshift was explicitly given
			parts = append(parts, Tag.Br(rowshift)) // Direct call
		}

		// Add ">>>" with boldDim primary style
		if styleFunc, ok := Style.BoldDim[Canvas.Settings.Primary]; ok {
			parts = append(parts, Tag.Div(styleFunc(">>>"))) // Direct call
		} else {
			fmt.Println("Warning: Style for BoldDim Primary not found in Task.")
			parts = append(parts, Tag.Div(">>>")) // Fallback
		}

		parts = append(parts, Canvas.Tab)

		// Add the task string with boldItalic tertiary style
		if styleFunc, ok := Style.BoldItalic[Canvas.Settings.Tertiary]; ok {
			parts = append(parts, Tag.Div(styleFunc(s+"."))) // Direct call
		} else {
			fmt.Println("Warning: Style for BoldItalic Tertiary not found in Task.")
			parts = append(parts, Tag.Div(s+".")) // Fallback
		}

		// Add a single line break
		parts = append(parts, Tag.Br(1)) // Direct call

		// Join all parts and write using post.Write
		post_write(strings.Join(parts, ""), actualRowshift)
	}
}

// STEP prints a step message with specific styling.
func STEP(s string, rowshift int) {
	actualRowshift := 0
	if rowshift < 0 {
		actualRowshift = rowshift
	} else if rowshift > 0 {
		actualRowshift = rowshift
	}

	if Canvas.Settings.TaskActive && Canvas.Settings.PostActive {
		var parts []string

		// Add line breaks if rowshift is positive
		if rowshift > 0 {
			parts = append(parts, Tag.Br(rowshift)) // Direct call
		}

		// Add ">>>" with boldDim primary style
		if styleFunc, ok := Style.BoldDim[Canvas.Settings.Primary]; ok {
			parts = append(parts, Tag.Div(styleFunc(">>>"))) // Direct call
		} else {
			fmt.Println("Warning: Style for BoldDim Primary not found in Step.")
			parts = append(parts, Tag.Div(">>>")) // Fallback
		}

		parts = append(parts, Canvas.Tab)

		// Add the step string with italic tertiary style
		if styleFunc, ok := Style.Italic[Canvas.Settings.Tertiary]; ok {
			parts = append(parts, Tag.Div(styleFunc(s+" ..."))) // Direct call
		} else {
			fmt.Println("Warning: Style for Italic Tertiary not found in Step.")
			parts = append(parts, Tag.Div(s+" ...")) // Fallback
		}

		// Join all parts and write using post.Write. rowshift is 0 for Post.
		post_write(strings.Join(parts, ""), actualRowshift)
	}
}

// POST prints a general message with optional custom styling and tag.
// customStyleFunc: A function to apply custom styling. If nil, default style is used.
// customTagFunc: A function to wrap the content with a custom tag. If nil, default tag.Div is used.
func POST(s string, customStyleFunc func(string) string, customTagFunc func(string) string) {
	if Canvas.Settings.PostActive {
		finalString := s

		// Determine the style function to use
		styleToApply := customStyleFunc
		if styleToApply == nil {
			// Default style: style.dim[canvas.settings.text]
			if defaultStyle, ok := Style.Dim[Canvas.Settings.Text]; ok {
				styleToApply = defaultStyle
			} else {
				// Fallback if default style not found
				styleToApply = func(s string) string { return s }
				fmt.Println("Warning: Default style (Dim Text) not found in Style map for Post.")
			}
		}

		// Determine the tag function to use
		tagToApply := customTagFunc
		if tagToApply == nil {
			// Default tag: tag.Div
			tagToApply = Tag.Div // Direct call
		}

		// Apply tag and style, then write using post.Write. rowshift is 0 for Post.
		content := tagToApply(finalString)
		post_write(styleToApply(content), 0)
	}
}

// Exported variables and functions, mirroring the JavaScript module's exports.
// var (
// 	Render  = Write        // Reference to the Write function from the post package
// 	Mold    = Write        // Another reference to the Write function from the post package
// )
