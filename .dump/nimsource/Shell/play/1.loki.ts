import { style, fmt } from "../0.root.js";

export default (string: string, frames = 1) => {
  const characters = Math.floor(Math.random() * string.length);
  const styles = Object.keys(style);
  const renders = [];

  if (characters > string.length) {
    string = string.padEnd(characters, " ");
  }

  for (let i = 0; i < frames; i++) {
    const styledIndices = new Set();
    let styledString = string;
    for (let j = 0; j < characters; j++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * string.length);
      } while (styledIndices.has(randomIndex));

      styledIndices.add(randomIndex);

      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      const styledCharacter = fmt(string[randomIndex], randomStyle);

      styledString =
        styledString.substring(0, randomIndex) +
        styledCharacter +
        styledString.substring(randomIndex + 1);
    }
    renders.push(styledString);
  }

  return renders;
};
