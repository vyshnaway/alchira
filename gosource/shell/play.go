package shell

var Play = struct{
	Title func (str string, duration int, frames int) error 
}{
	Title: func (str string, duration int, frames int) error {
		framesArr := frames_Title(str)
		return render_Animate(framesArr, duration, frames)
	},
}