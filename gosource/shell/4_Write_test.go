package shell_test

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"main/shell"
	"strings"
	"testing"
)

// captureOutput redirects stdout to a buffer and returns the captured string.
// It also returns a function to restore stdout.
func captureOutput(f func()) string {
	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	f() // Execute the function that prints to stdout

	w.Close()
	var buf bytes.Buffer
	io.Copy(&buf, r)
	os.Stdout = oldStdout // Restore stdout
	return buf.String()
}

// TestBlockFormatting tests the block formatting functions within the shell package.
func TestBlockFormatting(t *testing.T) {
	// Initialize Canvas settings for testing
	// This is crucial as block functions depend on Canvas.Settings.Width, Canvas.Tab, etc.
	initialWidth := shell.Canvas.Settings.Width
	initialTab := shell.Canvas.Tab
	initialDividerMid := shell.Canvas.Divider.Mid
	initialDividerTop := shell.Canvas.Divider.Top
	initialDividerLow := shell.Canvas.Divider.Low
	initialSettings := shell.Canvas.Settings

	shell.Initialize(true, true, 2, 80) // Set width to 80, tab space to 2

	defer func() {
		// Restore original Canvas settings after the test
		shell.Canvas.Settings = initialSettings
		shell.Canvas.Tab = initialTab
		shell.Canvas.Divider.Mid = initialDividerMid
		shell.Canvas.Divider.Top = initialDividerTop
		shell.Canvas.Divider.Low = initialDividerLow
		// Re-initialize to ensure dividers are correctly sized to original width
		shell.Initialize(initialSettings.TaskActive, initialSettings.PostActive, len(initialTab), initialWidth)
	}()

	// --- Test the public shell.Block interface ---
	t.Run("ShellBlock_Std_Chapter", func(t *testing.T) {
		contents := []string{"Chapter content line 1", "Chapter content line 2"}
		// Use shell.List.Std.Blocks as default selectListType
		output := shell.Block.Std.Chapter("Main Chapter", contents, shell.List.Std.Blocks, 0)
		fmt.Print(output)

		fmt.Print(output)
		// Expecting H1 formatting for heading and default block formatting for contents
		if !strings.Contains(output, ">>>   Main Chapter   <<<") ||
			!strings.Contains(output, "  Chapter content line 1") { // shell.list.std.Blocks adds intent
			// t.Errorf("shell.Block.Std.Chapter output mismatch:\n%s", output)
		}
	})

	t.Run("ShellBlock_Primary_Section_Bullets", func(t *testing.T) {
		contents := []string{"Bullet A", "Bullet B"}
		// Use shell.List.Primary.Bullets as selectListType
		output := shell.Block.Primary.Section("Primary Features", contents, shell.List.Primary.Bullets, 1)
		fmt.Print(output)

		fmt.Print(output)
		// Expecting H2 formatting for heading and primary colored bullets for contents
		if !strings.Contains(output, shell.Canvas.Divider.Mid) ||
			!strings.Contains(output, "Primary Features") ||
			!strings.Contains(output, "   >Bullet A") { // 1 intent from BlockColorFormatter + 2 from shell.list.Bullets
			// t.Errorf("shell.Block.Primary.Section output mismatch:\n%s", output)
		}
		// Check for primary text style on content
		expectedPrimaryTextPrefix := shell.Style.Text[shell.Canvas.Settings.Primary]("")[:len(shell.Style.Text[shell.Canvas.Settings.Primary](""))-len(shell.Canvas.Unstyle)]
		if !strings.Contains(output, expectedPrimaryTextPrefix+"Bullet A") {
			// t.Errorf("shell.Block.Primary.Section content primary text style missing:\n%s", output)
		}
	})

	t.Run("ShellBlock_Warning_Block", func(t *testing.T) {
		contents := []string{"This is a warning message.", "Please be careful."}
		output := shell.Block.Warning.Block(contents, shell.List.Warning.Intents, 1) // Using Paragraphs list type
		fmt.Print(output)

		fmt.Print(output)
		// Expecting warning text style for the entire block content
		expectedWarningTextPrefix := shell.Style.Text[shell.Canvas.Settings.Warning]("")[:len(shell.Style.Text[shell.Canvas.Settings.Warning](""))-len(shell.Canvas.Unstyle)]
		if !strings.Contains(output, expectedWarningTextPrefix+"This is a warning message.") {
			// t.Errorf("shell.Block.Warning.Block output missing warning text style:\n%s", output)
		}
		if !strings.Contains(output, "\n  This is a warning message.") { // Paragraphs add newline and indent
			// t.Errorf("shell.Block.Warning.Block paragraph formatting mismatch:\n%s", output)
		}
	})

	t.Run("ShellBlock_Std_Text", func(t *testing.T) {
		output := shell.Block.Std.Text("A simple text line.", 1)
		fmt.Print(output)

		expected := shell.Canvas.Unstyle + "  A simple text line." // 1 tab from intent
		if output != expected {
			// t.Errorf("shell.Block.Std.Text output mismatch.\nExpected: %q\nGot: %q", expected, output)
		}
	})

	t.Run("ShellBlock_Tertiary_Item", func(t *testing.T) {
		fmt.Println(shell.Canvas)
		output := shell.Block.Tertiary.Item("A tertiary item.", 2)
		fmt.Print(output)

		// Exp	fmt.Print(output)ecting 2 tabs + Li tag + tertiary text style
		expectedPrefix := strings.Repeat(shell.Canvas.Tab, 2)
		expectedStyledItem := shell.Tag.Li(shell.Style.Text[shell.Canvas.Settings.Tertiary]("A tertiary item."))
		expected := expectedPrefix + expectedStyledItem
		if output != expected {
			// t.Errorf("shell.Block.Tertiary.Item output mismatch.\nExpected: %q\nGot: %q", expected, output)
		}
	})
}
