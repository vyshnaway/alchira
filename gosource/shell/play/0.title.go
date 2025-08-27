package play

import (
	"math"
	"strings"

	"main/shell/render"
	"main/shell/root"
	"main/shell/tag"
)

// padBothSides adds padding to both sides of a string to reach the desired total length
func padBothSides(str string, totalLength int) string {
	totalPadding := totalLength - len(str)
	startPadding := int(math.Floor(float64(totalPadding) / 2))
	endPadding := totalPadding - startPadding
	return strings.Repeat(" ", startPadding) + str + strings.Repeat(" ", endPadding)
}

// modifyString modifies a string by trimming characters and adding brackets
func modifyString(str string) string {
	str = str[1 : len(str)-1]
	if str[0] == ' ' {
		str = str[1 : len(str)-1]
	} else {
		str = str[:len(str)-2]
	}
	return ">" + str + "<"
}

// renderTitle generates the animation frames for a title
func renderTitle(s string) []string {
	canvas := root.Canvas
	previewFrames := int(math.Ceil(float64(len(s)) / 16))
	var renders []string
	var preview []string

	// Generate empty frame template
	emptyFrame := []string{"", "", canvas.Divider.Mid, ""}
	for i := 0; i < previewFrames*2; i++ {
		preview = append(preview, root.Format(strings.Join(emptyFrame, "\n"), root.Style.AS_Bold))
	}

	// Generate top frame template
	topFrame := []string{
		"",
		root.Format(canvas.Divider.Top, root.Style.AS_Bold, root.Style.AS_Underline),
		"",
		"",
	}
	for i := 0; i < previewFrames; i++ {
		preview = append(preview, root.Format(strings.Join(topFrame, "\n"), root.Style.AS_Bold))
	}

	// Generate middle frames with dots
	dotFrame := []string{
		"",
		canvas.Divider.Btm,
		"·" + padBothSides("·", canvas.Width()-2) + "·",
		canvas.Divider.Top,
		"",
	}
	for i := 0; i < previewFrames; i++ {
		preview = append(preview, root.Format(strings.Join(dotFrame, "\n"), root.Style.AS_Bold))
	}

	// Generate middle frames with dashes
	dashFrame := []string{
		"",
		canvas.Divider.Mid,
		">" + padBothSides("-", canvas.Width()-2) + "<",
		canvas.Divider.Mid,
		"",
	}
	for i := 0; i < previewFrames; i++ {
		preview = append(preview, root.Format(strings.Join(dashFrame, "\n"), root.Style.AS_Bold))
	}

	// Generate bottom frames
	btmFrame := []string{
		"",
		canvas.Divider.Top,
		">>" + padBothSides("×", canvas.Width()-4) + "<<",
		canvas.Divider.Btm,
		"",
	}
	for i := 0; i < previewFrames; i++ {
		preview = append(preview, root.Format(strings.Join(btmFrame, "\n"), root.Style.AS_Bold))
	}

	// Generate title animation frames
	s = "   " + s + "   "
	for len(s) > 2 {
		s = modifyString(s)
		render := tag.H1(s, []string{root.Style.AS_Bold})
		renders = append([]string{root.Format(render, root.Style.AS_Bold)}, renders...)
	}

	// Combine preview and title frames
	result := make([]string, len(preview)+len(renders))
	copy(result, preview)
	copy(result[len(preview):], renders)
	return result
}

// Title displays an animated title sequence
func Title(s string, duration, frames int) error {
	return render.Animate(renderTitle(s), duration, frames)
}
