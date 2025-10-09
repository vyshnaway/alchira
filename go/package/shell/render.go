package shell

import (
	_json "encoding/json"
	_fmt "fmt"
	_strings "strings"
	_time "time"
)

// ANSI escape codes for terminal manipulation
const (
	ansi_MoveUp         = "\033[%dA"
	ansi_MoveLeft       = "\033[%dD"
	ansi_ClearConsole   = "\033[2J"
	ansi_MoveToHome     = "\033[H"
	ansi_ClearToBottom  = "\033[J"
	ansi_ClearLine      = "\033[2K"
)

// Backspace moves the cursor back by the specified number of characters and clears the line
func render_Backspace(chars int) {
	if chars <= 0 {
		return
	}
	_fmt.Printf(ansi_MoveLeft, chars)
	_fmt.Print(ansi_ClearLine)
}

// Write prints the string to the terminal, handling cursor positioning
// Returns the number of rows created by the output
func render_Write(str string, backRows int) int {
	if backRows > 0 {
		_fmt.Printf(ansi_MoveUp, backRows)
		_fmt.Print(ansi_ClearToBottom)
	} else if backRows < 0 {
		_fmt.Print(ansi_ClearConsole)
		_fmt.Print(ansi_MoveToHome)
	}
	rowsCreated := len(_strings.Split(str, "\n"))
	_fmt.Println(str)
	return rowsCreated
}

// Animate runs an animation in the terminal using an array of strings as frames
// duration is in milliseconds
// repeat of 0 means infinite loop
func render_Animate(frames []string, duration int, iterations int) error {
	if len(frames) == 0 {
		return nil
	}

	interval := max(_time.Duration(duration/(len(frames)*(iterations|1)))*_time.Millisecond, _time.Millisecond)

	iteration := 0
	backRows := 0
	frameIndex := 0

	ticker := _time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			if frameIndex == len(frames) {
				frameIndex = 0
				iteration++
			}
			if iterations > 0 && iteration >= iterations && frameIndex == 0 {
				return nil
			}
			backRows = render_Write(frames[frameIndex], backRows)
			frameIndex++
		case <-_time.After(_time.Duration(duration) * _time.Millisecond):
			if iterations == 0 {
				continue
			}
			return nil
		}
	}
}

func render_Raw(content any) []byte {
	json, _ := _json.MarshalIndent(content, "", "  ")
	_fmt.Println(string(json))
	return json
}

func render_Close(content any) {
	json, _ := _json.Marshal(content)
	_fmt.Println(string(json))
}

// E provides package-level access to render functions
var Render = struct {
	Raw       func(content any) []byte
	Close     func(content any)
	Write     func(str string, backRows int) int
	Backspace func(chars int)
	Animate   func(frames []string, duration int, iterations int) error
}{
	Raw:       render_Raw,
	Close:     render_Close,
	Write:     render_Write,
	Backspace: render_Backspace,
	Animate:   render_Animate,
}
