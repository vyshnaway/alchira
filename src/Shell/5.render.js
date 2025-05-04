import rl from 'readline'
import { canvas } from './0.root.js';

const clearPreviousLines = (lines) => {
    rl.clearLine(process.stdout, 0);
    for (let i = 0; i < lines; i++) {
        rl.moveCursor(process.stdout, 0, -1);
        rl.clearLine(process.stdout, 0);
    }
}
const clearPreviousCharacters = (characters) => {
    for (let i = 0; i < characters; i++) {
        rl.moveCursor(process.stdout, -1, 0);
        rl.clearLine(process.stdout, 1);
    }
}

const rewrite = (string, backRows = 1) => {
    const stdout = process.stdout;
    const lines = string.split('\n');
    const excessLines = backRows - lines.length;

    // Move cursor up by backRows
    stdout.write(`\x1b[${backRows}A`);

    // Write the new string
    stdout.write(string);

    // Clear excess lines if any
    if (excessLines > 0) {
        for (let i = 0; i < excessLines; i++) {
            stdout.write('\x1b[K\x1b[1B'); // Clear line and move cursor down
        }
        stdout.write(`\x1b[${excessLines}A`); // Move cursor back up
    }
};

const refresh = (backRows, string = '') => {
    const rowsCreated = string.split('\n').length;
    clearPreviousLines(backRows);
    if (canvas.postActive) console.log(string);
    return rowsCreated;
}

const interval = {
    FrameRate: (numberOfFrames) => 1000 / numberOfFrames,
    SingleTime: (numberOfFrames, duration) => duration / numberOfFrames,
    RepeatTime: (numberOfFrames, duration, repeat) => duration / (numberOfFrames * repeat)
}

const animation = {
    Loop: (frames, interval, duration) => {
        return new Promise((resolve) => {
            const totalFrames = duration === 0 ? Infinity : Math.floor(duration / interval);
            let currentFrame = 0, backRows = 0;

            const intervalId = setInterval(() => {
                if (currentFrame >= totalFrames || currentFrame >= frames.length) {
                    if (duration !== 0) {
                        clearInterval(intervalId);
                        resolve();
                        return;
                    } else {
                        currentFrame = 0;
                    }
                }
                backRows = refresh(backRows, frames[currentFrame]);
                currentFrame++;
            }, interval);
        })
    },
    Repeat: (frames, interval, repeat = 1) => {
        return new Promise((resolve) => {
            let currentFrame = 0, backRows = 0;
            const totalFrames = repeat * frames.length;

            const intervalId = setInterval(() => {
                if (currentFrame >= totalFrames || currentFrame >= frames.length) {
                    clearInterval(intervalId);
                    resolve();
                    return;
                }
                backRows = refresh(backRows, frames[currentFrame]);

                currentFrame++;
            }, interval);
        });
    },
    Rewrite: (string, backRows = 1) => {
        return refresh(backRows, string);
        // return rewrite(string, backRows);
    },
    Backrow: (lines = 1) => {
        clearPreviousLines(lines)
    },
    Backspace: (chars = 1) => {
        clearPreviousCharacters(chars)
    }
}


export default {
    interval,
    animation
}