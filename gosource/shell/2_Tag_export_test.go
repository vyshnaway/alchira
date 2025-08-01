package shell

import (
	"fmt"
	"testing"
)

func Test_tag(t *testing.T) {
	// Initialize Canvas settings for testing
	initialWidth := Canvas.Settings.Width
	initialTab := Canvas.Tab
	initialDividerMid := Canvas.Divider.Mid
	initialDividerTop := Canvas.Divider.Top
	initialDividerLow := Canvas.Divider.Low
	initialSettings := Canvas.Settings

	Initialize(true, true, 2, 80)

	defer func() {
		Canvas.Settings = initialSettings
		Canvas.Tab = initialTab
		Canvas.Divider.Mid = initialDividerMid
		Canvas.Divider.Top = initialDividerTop
		Canvas.Divider.Low = initialDividerLow
		Initialize(initialSettings.TaskActive, initialSettings.PostActive, len(initialTab), initialWidth)
	}()

	fmt.Println("\n--- Testing tag functions (output to stdout) ---")
	fmt.Println(Tag.H1("This is a very long heading that needs to be wrapped and centered"))
	fmt.Println(Tag.H2("Section Title"))
	fmt.Println(Tag.H3("Subsection"))
	fmt.Println(Tag.H4("Sub-subsection"))
	fmt.Println(Tag.H5("Small Heading"))
	fmt.Println(Tag.H6("Tiny Heading"))
	fmt.Println(Tag.P("This is a paragraph of text. It should be indented by a tab."))
	fmt.Println(Tag.Li("First list item"))
	fmt.Println(Tag.Li("Second list item"))
	fmt.Println(Tag.Br(2))
	fmt.Println(Tag.Hr("-"))
	fmt.Println(Tag.Tab(2) + "Indented content")
	fmt.Println(Tag.Div("Just plain content"))
	fmt.Println("--- End tag functions test ---")
}
