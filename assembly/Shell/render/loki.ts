import * as style from "../1.style"; // Assuming your style object is exported as 'style'

export default (string: string, frames: i32 = 1): Array<string> => {
    const characters = Math.floor(Math.random() * string.length);
    const styles = Object.keys(style);
    const colors = Object.keys(style.bold);
    const renders: Array<string> = [];

    if (characters > string.length) {
        string = string.padEnd(characters, " ");
    }

    for (let i: i32 = 0; i < frames; i++) {
        const styledIndices = new Set<i32>();
        let styledString = string;
        for (let j: i32 = 0; j < characters; j++) {
            let randomIndex: i32;
            do {
                randomIndex = Math.floor(Math.random() * string.length);
            } while (styledIndices.has(randomIndex));

            styledIndices.add(randomIndex);

            const randomStyle = styles[Math.floor(Math.random() * styles.length)];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const styleObject = style as any; // Type assertion to access properties dynamically
            const styledCharacter = styleObject[randomStyle][randomColor](string.charAt(randomIndex));

            styledString =
                styledString.substring(0, randomIndex) +
                styledCharacter +
                styledString.substring(randomIndex + 1);
        }
        renders.push(styledString);
    }

    return renders;
};