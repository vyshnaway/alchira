import readline from 'readline';

const backspace = (chars) => {
    if (chars <= 0) {
        return;
    }
    readline.moveCursor(process.stdout, -chars, 0);
    readline.clearLine(process.stdout, 1);
};


const write = (string = '', backRows = 0) => {
    if (backRows > 0) {
        readline.moveCursor(process.stdout, 0, -backRows);
        readline.clearScreenDown(process.stdout);
    } else if (backRows < 0) {
        console.clear();
    }
    const rowsCreated = string.split('\n').length;
    console.log(string)
    // process.stdout.write(Buffer.from(string, 'latin1') +"\n");
    return rowsCreated;
};

/**
 * Run animation in terminal from array of strings as frames.
 * @param {Array} frames String snippets for frames
 * @param {number} duration in milliseconds
 * @param {number} repeat = 0 => infinite loop
 * @returns {null}
 */
const animate = (frames = [], duration = 1000, repeat = 0) => {
    const interval = Math.ceil(duration / (frames.length * (repeat || 1))) || 1;

    let iteration = 0, backRows = 0, frameIndex = 0;
    return new Promise((resolve) => {
        const intervalId = setInterval(() => {
            if (frameIndex === frames.length) {
                frameIndex = 0;
                iteration++;
            }
            if (iteration >= repeat && frameIndex === 0) {
                clearInterval(intervalId);
                resolve();
                return;
            }
            backRows = write(frames[frameIndex++], backRows);
        }, interval);
    });
};

export default {
    write,
    animate,
    backspace,
}