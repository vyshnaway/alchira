package shell_test

import (
	// "fmt"
	// "main/shell"
	"testing"
)


func Test_Post(t *testing.T) {
	// // Initialize terminal for better behavior (optional, but good for interactive apps)
	// // This might involve setting raw mode, which is more complex and depends on external libs.
	// // For now, we rely on standard ANSI support.

	// fmt.Println("Testing Write function:")
	// shell.post_write("Hello, world!", 0)
	// shell.post_write("This is a new line.", 0)
	// shell.post_write("Overwriting previous line...", 1) // Overwrite 1 line up
	// shell.post_write("Clearing screen and writing from top.", -1) // Clear screen

	// fmt.Println("\nTesting Backspace function:")
	// fmt.Print("Some text here to backspace: ABCDE")
	// time.Sleep(1 * time.Second)
	// shell.post_backspace(5) // Backspace "ABCDE"
	// fmt.Println("Done.")
	// time.Sleep(1 * time.Second)

	// fmt.Println("\nTesting Animate function (5 frames, 2 repeats):")
	// animationFrames := []string{
	// 	"Frame 1: Loading |",
	// 	"Frame 2: Loading /",
	// 	"Frame 3: Loading -",
	// 	"Frame 4: Loading \\",
	// 	"Frame 5: Loading |",
	// }
	// // Animate and wait for it to complete
	// done := shell.post_animate(animationFrames, 2*time.Second, 2)
	// <-done // Block until animation is done
	// fmt.Println("\nAnimation finished!")

	// fmt.Println("\nTesting Animate function (infinite loop - run for a few seconds):")
	// animationFramesInfinite := []string{
	// 	"Spinning [---]",
	// 	"Spinning [--o]",
	// 	"Spinning [-o-]",
	// 	"Spinning [o--]",
	// }
	// doneInfinite := shell.post_animate(animationFramesInfinite, 500*time.Millisecond, 0) // Infinite loop

	// // Let it run for 5 seconds, then stop it
	// time.AfterFunc(5*time.Second, func() {
	// 	// To stop an infinite animation, you'd typically need a way to signal the goroutine.
	// 	// For this simple example, we'll just let main exit, which will terminate the goroutine.
	// 	// In a real app, you might send a signal on a channel to the goroutine running Animate.
	// 	fmt.Println("\nStopping infinite animation after 5 seconds.")
	// 	// A more robust way would be to pass a context.Context to Animate
	// 	// and cancel it here.
	// })

	// // Keep main running for a bit to see infinite animation
	// time.Sleep(6 * time.Second)
	// fmt.Println("Main exiting.")
}
