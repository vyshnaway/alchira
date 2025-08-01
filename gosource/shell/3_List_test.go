package shell_test

import (
	"main/shell"
	"strings"
	"testing"
)

func Test_List(t *testing.T) {
	// Initialize canvas settings before running list tests.
	// This is crucial as list functions depend on Canvas.Settings.Width, Canvas.Tab, etc.
	// We'll use a defer to ensure settings are reset after the test.
	initialWidth := shell.Canvas.Settings.Width
	initialTab := shell.Canvas.Tab
	initialDividerMid := shell.Canvas.Divider.Mid
	initialSettings := shell.Canvas.Settings // Capture all settings

	shell.Initialize(true, true, 2, 80)

	defer func() {
		shell.Canvas.Settings = initialSettings
		shell.Canvas.Tab = initialTab
		shell.Canvas.Divider.Mid = initialDividerMid
		shell.Initialize(initialSettings.TaskActive, initialSettings.PostActive, len(initialTab), initialWidth)
	}()

	
	// --- Test Props ---
	t.Run("Props", func(t *testing.T) {
		items := map[string]string{
			"Name":    "Test Item",
			"Version": "1.0",
		}
		intent := 1
		output := shell.List.Std.Props(items, intent)

		if len(output) != 2 {
			t.Errorf("Props: Expected 2 lines, got %d", len(output))
		}

		// Check for key elements in the output lines (order of map iteration is not guaranteed)
		foundName := false
		foundVersion := false
		for _, line := range output {
			if strings.Contains(line, "  Name  :") && strings.Contains(line, "Test Item") {
				foundName = true
			}
			if strings.Contains(line, "  Version :") && strings.Contains(line, "1.0") {
				foundVersion = true
			}
		}
		if !foundName || !foundVersion {
			t.Errorf("Props: Expected to find 'Name' and 'Version' entries in output. Output:\n%s", strings.Join(output, "\n"))
		}
	})

	// --- Test Blocks ---
	t.Run("Blocks", func(t *testing.T) {
		items := []string{"Block One", "Block Two"}
		intent := 1
		output := shell.List.Text.Blocks(items, intent)

		if len(output) != 2 {
			t.Errorf("Blocks: Expected 2 lines, got %d", len(output))
		}
		if !strings.Contains(output[0], "  Block One") || !strings.Contains(output[1], "  Block Two") {
			t.Errorf("Blocks: Output mismatch. Got:\n%s", strings.Join(output, "\n"))
		}
	})

	// --- Test Entries ---
	t.Run("Entries", func(t *testing.T) {
		items := []string{"Entry A", "Entry B", "Entry C", "Entry D", "Entry E", "Entry F"}
		intent := 0 // No additional intent for entries to test column wrapping
		output := shell.List.Primary.Entries(items, intent)

		// Expected: multiple lines due to column wrapping
		if len(output) < 1 {
			t.Errorf("Entries: Expected at least 1 line, got %d", len(output))
		}
		// Check if items are present and formatted as list items (>)
		if !strings.Contains(output[0], ">Entry A") {
			t.Errorf("Entries: First line mismatch. Got:\n%s", output[0])
		}
		if !strings.Contains(strings.Join(output, "\n"), ">Entry F") {
			t.Errorf("Entries: Last item 'Entry F' not found in output.")
		}
	})

	// --- Test Bullets ---
	t.Run("Bullets", func(t *testing.T) {
		items := []string{"Bullet One", "Bullet Two"}
		intent := 2
		output := shell.List.Secondary.Bullets(items, intent)

		if len(output) != 2 {
			t.Errorf("Bullets: Expected 2 lines, got %d", len(output))
		}
		// Expecting "    >Bullet One" (2 tabs + ">")
		if !strings.Contains(output[0], "    >Bullet One") || !strings.Contains(output[1], "    >Bullet Two") {
			t.Errorf("Bullets: Output mismatch. Got:\n%s", strings.Join(output, "\n"))
		}
	})

	// --- Test Numbers ---
	t.Run("Numbers", func(t *testing.T) {
		items := []string{"First Step", "Second Step"}
		intent := 1
		output := shell.List.Tertiary.Numbers(items, intent)

		if len(output) != 2 {
			t.Errorf("Numbers: Expected 2 lines, got %d", len(output))
		}
		// Expecting "  1  First Step" (1 tab + "1" + 1 tab + "First Step")
		if !strings.Contains(output[0], "  1  First Step") || !strings.Contains(output[1], "  2  Second Step") {
			t.Errorf("Numbers: Output mismatch. Got:\n%s", strings.Join(output, "\n"))
		}
	})

	// --- Test Intents (Paragraphs) ---
	t.Run("Intents", func(t *testing.T) {
		items := []string{"Paragraph 1 content.", "Paragraph 2 content."}
		intent := 2 // Should result in 1 newline before each paragraph
		output := shell.List.Failed.Intents(items, intent)

		if len(output) != 2 {
			t.Errorf("Intents: Expected 2 lines, got %d", len(output))
		}
		// Expecting "\n  Paragraph 1 content.\n" (1 newline + 2 spaces for P tag)
		if !strings.HasPrefix(output[0], "\n  Paragraph 1 content.") || !strings.HasPrefix(output[1], "\n  Paragraph 2 content.") {
			t.Errorf("Intents: Output mismatch. Got:\n%s", strings.Join(output, "\n"))
		}
	})

	// --- Test Waterfall ---
	t.Run("Waterfall", func(t *testing.T) {
		items := []string{"Start", "Middle", "End"}
		intent := 1
		output := shell.List.Success.Waterfall(items, intent)

		if len(output) != 3 {
			t.Errorf("Waterfall: Expected 3 lines, got %d", len(output))
		}
		// Expecting "  ├─>  Start" and "  └─>  End"
		if !strings.Contains(output[0], "  ├─>  Start") ||
			!strings.Contains(output[1], "  ├─>  Middle") ||
			!strings.Contains(output[2], "  └─>  End") {
			t.Errorf("Waterfall: Output mismatch. Got:\n%s", strings.Join(output, "\n"))
		}
	})
}
