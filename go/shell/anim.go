package shell

var Animate = struct {
	Title func(str string, duration int, iterations int) error
}{
	Title: func(str string, duration int, frames int) error {
		framesArr := anim_Title_frames(str)
		return render_Animate(framesArr, duration, frames)
	},
}
