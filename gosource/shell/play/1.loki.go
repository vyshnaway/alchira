package play

import (
	"math/rand"
	"reflect"
	"strings"

	"main/shell/render"
	"main/shell/root"
)

// renderLoki generates the animation frames for text styling animation
func renderLoki(s string, frames int) []string {
	// Get available style constants
	var styleFields []string
	t := reflect.TypeOf(root.Style)
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		styleFields = append(styleFields, field.Name)
	}

	// Calculate random number of characters to style
	characters := rand.Intn(len(s))
	if characters > len(s) {
		s = s + strings.Repeat(" ", characters-len(s))
	}

	// Generate frames
	var renders []string
	for range frames {
		used := make(map[int]bool)
		result := []rune(s)

		for range characters {
			// Find unused random index
			var randomIndex int
			for {
				randomIndex = rand.Intn(len(s))
				if !used[randomIndex] {
					break
				}
			}
			used[randomIndex] = true

			// Get random style
			randomStyle := reflect.ValueOf(root.Style).FieldByName(styleFields[rand.Intn(len(styleFields))]).String()

			// Style the character
			styledChar := root.Format(string(result[randomIndex]), randomStyle)
			result[randomIndex] = []rune(styledChar)[0]
		}

		renders = append(renders, string(result))
	}

	return renders
}

// Loki displays an animated sequence of randomly styled text
func Loki(s string, duration, frames int) error {
	return render.Animate(renderLoki(s, frames), duration, frames)
}
