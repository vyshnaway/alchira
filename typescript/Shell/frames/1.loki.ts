import style from '../1.style';

export default function generateLoki(string: string, frames: number = 1): string[] {
    const characters = Math.floor(Math.random() * string.length);
    const styles = Object.keys(style) as Array<keyof typeof style>;
    const colors = Object.keys(style.bold) as Array<keyof typeof style.bold>;
    const renders: string[] = [];

    if (characters > string.length) {
        string = string.padEnd(characters, ' ');
    }

    for (let i = 0; i < frames; i++) {
        const styledIndices = new Set<number>();
        let styledString = string;
        for (let j = 0; j < characters; j++) {
            let randomIndex: number;
            do {
                randomIndex = Math.floor(Math.random() * string.length);
            } while (styledIndices.has(randomIndex));

            styledIndices.add(randomIndex);

            const randomStyle = styles[Math.floor(Math.random() * styles.length)];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const styledCharacter = style[randomStyle][randomColor](string[randomIndex]);

            styledString =
                styledString.substring(0, randomIndex) +
                styledCharacter +
                styledString.substring(randomIndex + 1);
        }
        renders.push(styledString);
    }

    return renders;
}