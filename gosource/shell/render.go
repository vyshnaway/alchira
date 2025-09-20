package shell

import (
    _strings_ "strings"
	_time_ "time"
	_fmt_ "fmt"
	_os_ "os"
)

// ANSI escape codes for terminal manipulation
const (
	ansi_MoveUp         = "\033[%dA"
	ansi_MoveLeft       = "\033[%dD"
	ansi_ClearConsole   = "\033[2J"
	ansi_MoveToHome     = "\033[H"
	ansi_ClearToBottom  = "\033[J"
	ansi_EraseAfterLine = "\033[K"
	ansi_EraseTillLine  = "\033[1K"
	ansi_ClearLine      = "\033[2K"
)

// // Backspace moves the cursor back by the specified number of characters and clears the line
// func render_Backspace(chars int) {
// 	if chars <= 0 {
// 		return
// 	}
// 	fmt.Printf(ansi_MoveLeft, chars)
// 	fmt.Print(ansi_ClearLine)
// }

// // Write prints the string to the terminal, handling cursor positioning
// // Returns the number of rows created by the output
// func render_Write(str string, backRows int) int {
// 	if backRows > 0 {
// 		fmt.Printf(ansi_MoveUp, backRows)
// 		fmt.Print(ansi_ClearToBottom)
// 	} else if backRows < 0 {
// 		fmt.Print(ansi_ClearConsole)
// 		fmt.Print(ansi_MoveToHome)
// 	}
// 	rowsCreated := len(strings.Split(str, "\n"))
// 	fmt.Println(str)
// 	return rowsCreated
// }

// // Animate runs an animation in the terminal using an array of strings as frames
// // duration is in milliseconds
// // repeat of 0 means infinite loop
// func render_Animate(frames []string, duration int, repeat int) error {
// 	if len(frames) == 0 {
// 		return nil
// 	}

// 	interval := max(time.Duration(duration/(len(frames)*(repeat|1))) * time.Millisecond, time.Millisecond)

// 	iteration := 0
// 	backRows := 0
// 	frameIndex := 0

// 	ticker := time.NewTicker(interval)
// 	defer ticker.Stop()

// 	for {
// 		select {
// 		case <-ticker.C:
// 			if frameIndex == len(frames) {
// 				frameIndex = 0
// 				iteration++
// 			}
// 			if repeat > 0 && iteration >= repeat && frameIndex == 0 {
// 				return nil
// 			}
// 			backRows = render_Write(frames[frameIndex], backRows)
// 			frameIndex++
// 		case <-time.After(time.Duration(duration) * time.Millisecond):
// 			if repeat == 0 {
// 				continue
// 			}
// 			return nil
// 		}
// 	}
// }

// // E provides package-level access to render functions
// var Render = struct {
// 	Write     func(str string, backRows int) int
// 	Backspace func(chars int)
// 	Animate   func(frames []string, duration int, repeat int) error
// }{
// 	Write:     render_Write,
// 	Backspace: render_Backspace,
// 	Animate:   render_Animate,
// }


// --- vs ---


// Backspace moves the cursor back by `chars` places and clears that line.
func render_Backspace(chars int) {
    if chars <= 0 {
        return
    }
    _fmt_.Fprintf(_os_.Stdout, ansi_MoveLeft, chars)
    _fmt_.Fprint(_os_.Stdout, ansi_EraseAfterLine)
}

// Write prints a string to the console and handles line clearing/rewinding.
func render_Write(str string, backRows int) int {
    if backRows > 0 {
        _fmt_.Fprintf(_os_.Stdout, ansi_MoveUp, backRows)
        _fmt_.Fprint(_os_.Stdout, ansi_ClearToBottom)
    } else if backRows < 0 {
        _fmt_.Fprint(_os_.Stdout, ansi_ClearConsole)
        _fmt_.Fprint(_os_.Stdout, ansi_MoveToHome)
    }
    rowsCreated := _strings_.Count(str, "\n") + 1
    _fmt_.Println(str)
    return rowsCreated
}

// Animate displays frames in terminal for a given duration and repeat count.
func render_Animate(frames []string, duration int, repeat int) error {
    var duration_ms = _time_.Duration(duration);
    if len(frames) == 0 {
        return nil
    }
    totalFrames := len(frames) * func() int { if repeat > 0 { return repeat } else { return 1 } }()
    interval := duration_ms / _time_.Duration(totalFrames)
    if interval == 0 {
        interval = _time_.Millisecond
    }

    iteration, backRows, frameIdx := 0, 0, 0
    for {
        if frameIdx == len(frames) {
            frameIdx = 0
            iteration++
        }
        if repeat > 0 && iteration >= repeat && frameIdx == 0 {
            break
        }
        backRows = render_Write(frames[frameIdx], backRows)
        frameIdx++
        _time_.Sleep(interval)
    }
	return  nil
}

var Render = struct {
    Write     func(str string, backRows int) int
    Backspace func(chars int)
    Animate   func(frames []string, duration int, repeat int) error
}{
    Write:     render_Write,
    Backspace: render_Backspace,
    Animate:   render_Animate,
}
