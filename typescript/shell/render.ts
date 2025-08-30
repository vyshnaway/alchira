import readline from "readline";

export function backspace(chars: number) {
	if (chars <= 0) {
		return;
	}
	readline.moveCursor(process.stdout, -chars, 0);
	readline.clearLine(process.stdout, 1);
};

/**
 * Custom Console.log equalent
 * @param string content to print in console
 * @param backRows < 0 => clear console
 * @returns 
 */
export function write(string = "", backRows = 0) {
	if (backRows > 0) {
		readline.moveCursor(process.stdout, 0, -backRows);
		readline.clearScreenDown(process.stdout);
	} else if (backRows < 0) {
		console.clear();
	}
	const rowsCreated = string.split("\n").length;
	console.log(string);
	return rowsCreated;
};


/**
 * Run animation in terminal from array of strings as frames.
 * @param frames String snippets for frames
 * @param duration in milliseconds
 * @param repeat = 0 => infinite loop
 */
export function animate(frames: string[] = [], duration = 1000, repeat = 0) {
	const interval = Math.ceil(duration / (frames.length * (repeat || 1))) || 1;

	let iteration = 0,
		backRows = 0,
		frameIndex = 0;
	return new Promise((resolve) => {
		const intervalId = setInterval(() => {
			if (frameIndex === frames.length) {
				frameIndex = 0;
				iteration++;
			}
			if (iteration >= repeat && frameIndex === 0) {
				clearInterval(intervalId);
				resolve(null);
				return;
			}
			backRows = write(frames[frameIndex++], backRows);
		}, interval);
	});
};