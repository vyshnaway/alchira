package render

import (
	"fmt"
	"strings"
	"time"
)

// ANSI escape codes for terminal manipulation
const (
	clearLine     = "\033[2K"
	moveUp        = "\033[%dA"
	moveLeft      = "\033[%dD"
	clearScreen   = "\033[2J\033[H"
	clearToBottom = "\033[J"
)

// Backspace moves the cursor back by the specified number of characters and clears the line
func Backspace(chars int) {
	if chars <= 0 {
		return
	}
	fmt.Printf(moveLeft, chars)
	fmt.Print(clearLine)
}

// Write prints the string to the terminal, handling cursor positioning
// Returns the number of rows created by the output
func Write(str string, backRows int) int {
	if backRows > 0 {
		// Move cursor up and clear screen below
		fmt.Printf(moveUp, backRows)
		fmt.Print(clearToBottom)
	} else if backRows < 0 {
		// Clear entire screen
		fmt.Print(clearScreen)
	}
	rowsCreated := len(strings.Split(str, "\n"))
	fmt.Println(str)
	return rowsCreated
}

// Animate runs an animation in the terminal using an array of strings as frames
// duration is in milliseconds
// repeat of 0 means infinite loop
func Animate(frames []string, duration int, repeat int) error {
	if len(frames) == 0 {
		return nil
	}

	// Calculate interval between frames
	interval := time.Duration(duration/(len(frames)*(repeat|1))) * time.Millisecond
	if interval < time.Millisecond {
		interval = time.Millisecond
	}

	iteration := 0
	backRows := 0
	frameIndex := 0

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			if frameIndex == len(frames) {
				frameIndex = 0
				iteration++
			}
			if repeat > 0 && iteration >= repeat && frameIndex == 0 {
				return nil
			}
			backRows = Write(frames[frameIndex], backRows)
			frameIndex++
		case <-time.After(time.Duration(duration) * time.Millisecond):
			if repeat == 0 {
				continue
			}
			return nil
		}
	}
}

// T exports all render package functionality
type T struct {
	Write     func(str string, backRows int) int
	Backspace func(chars int)
	Animate   func(frames []string, duration int, repeat int) error
}

// E provides package-level access to render functions
var E = &T{
	Write:     Write,
	Backspace: Backspace,
	Animate:   Animate,
}
