import rl from 'readline';

const backspace = (chars) => {
    for (let i = 0; i < chars; i++) {
        rl.moveCursor(process.stdout, -1, 0);
        rl.clearLine(process.stdout, 1);
    }
};

const write = (string = '', backRows = 0) => {
    for (let i = 0; i < backRows + 1; i++) {
        rl.moveCursor(process.stdout, 0, -1);
        rl.clearLine(process.stdout, 0);
    }
    const rowsCreated = string.split('\n').length;
    console.log(string); return rowsCreated;
};

const animate = (frames = [], duration = 1000, repeat = 1) => {
    const interval = Math.ceil(duration / (frames.length * (repeat || 1))) || 1;

    let iteration = 0, backRows = 0, frameIndex = 0;
    return new Promise((resolve) => {
        // repeat = 0 -> Infinite loop.
        const intervalId = setInterval(() => {
            if (frameIndex === frames.length) { frameIndex = 0; if (repeat) iteration++ }
            if (iteration > repeat) { clearInterval(intervalId); resolve(); return; }
            backRows = write(frames[frameIndex++], backRows);
        }, interval);
    });
};

export default {
    write,
    animate,
    backspace,
}