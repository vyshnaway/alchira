package shell

import (
	"fmt"
	"math"
	"strings"
	"time"
)

// ANSI escape codes for terminal control.
const (
	// Cursor movement
	cursorUp     = "\033[%dA"
	cursorLeft   = "\033[%dD"
	cursorHome   = "\033[H"
	// Clear screen/line
	clearLineEnd = "\033[K"  // Clear from cursor to end of line
	clearScreenDown = "\033[J" // Clear from cursor to end of screen
	clearFullScreen = "\033[2J" // Clear entire screen
)

// post_backspace moves the cursor left and clears the line.
// It simulates the behavior of readline.moveCursor and readline.clearLine.
func post_backspace(chars int) {
	if chars <= 0 {
		return
	}
	fmt.Printf(cursorLeft, chars)
	fmt.Print(clearLineEnd)
}

// post_write prints a string to the console, handling cursor movement and screen clearing
// based on the backRows parameter.
// If backRows > 0, it moves the cursor up and clears the screen down.
// If backRows < 0, it clears the entire console.
// It returns the number of new lines created by the string.
func post_write(s string, backRows int) int {
	if backRows > 0 {
		fmt.Printf(cursorUp, backRows)
		fmt.Print(clearScreenDown)
	} else if backRows < 0 {
		// Clear entire screen and move cursor to home position
		fmt.Print(clearFullScreen + cursorHome)
	}

	// Use fmt.Print to avoid an extra newline that fmt.Println adds.
	// The original JS console.log adds a newline, so we'll add one here.
	fmt.Print(s + "\n")

	// Calculate and return the number of rows created.
	// If the string is empty, it still creates one line due to the "\n".
	if s == "" {
		return 1
	}
	return strings.Count(s, "\n") + 1 // +1 for the last line not ending with \n
}

// post_animate runs an animation in the terminal from an array of strings as frames.
// It returns a channel that will be closed when the animation completes.
// If repeat is 0, it runs indefinitely.
func post_animate(frames []string, duration time.Duration, repeat int) <-chan struct{} {
	done := make(chan struct{})

	if len(frames) == 0 {
		close(done)
		return done
	}

	// Calculate interval per frame.
	// In JS: Math.ceil(duration / (frames.length * (repeat || 1))) || 1;
	// If repeat is 0 (infinite), (repeat || 1) becomes 1.
	effectiveRepeat := repeat
	if effectiveRepeat == 0 {
		effectiveRepeat = 1 // Use 1 for calculation if infinite loop
	}
	intervalMs := float64(duration.Milliseconds()) / float64(len(frames)*effectiveRepeat)
	interval := time.Duration(math.Ceil(intervalMs)) * time.Millisecond

	// Ensure a minimum interval to prevent too rapid updates
	if interval < 10*time.Millisecond {
		interval = 10 * time.Millisecond
	}

	// go func() {
	// 	defer close(done) // Ensure the channel is closed when the goroutine exits

	// 	iteration := 0
	// 	backRows := 0
	// 	frameIndex := 0

	// 	ticker := time.NewTicker(interval)
	// 	defer ticker.Stop() // Ensure the ticker is stopped when the goroutine exits

	// 	for {
	// 		select {
	// 		case <-ticker.C:
	// 			if frameIndex == len(frames) {
	// 				frameIndex = 0
	// 				iteration++
	// 			}

	// 			// Check for termination condition
	// 			// If repeat is 0, it's an infinite loop, so this condition is skipped.
	// 			if repeat > 0 && iteration >= repeat {
	// 				return // Animation finished
	// 			}

	// 			// Write the current frame and update backRows
	// 			backRows = post_write(frames[frameIndex], backRows)
	// 			frameIndex++
	// 		}
	// 	}
	// }()

	return done
}

// Exported functions, mirroring the JavaScript module's exports.
var (
	WriteFunc   = post_write
	AnimateFunc = post_animate
	BackspaceFunc = post_backspace
)
