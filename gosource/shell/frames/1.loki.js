import style from "../1.style.js";

export default (string, frames = 1) => {
  const characters = Math.floor(Math.random() * string.length);
  const styles = Object.keys(style);
  const colors = Object.keys(style.bold);
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
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const styledCharacter = style[randomStyle][randomColor](
        string[randomIndex],
      );

      styledString =
        styledString.substring(0, randomIndex) +
        styledCharacter +
        styledString.substring(randomIndex + 1);
    }
    renders.push(styledString);
  }

  return renders;
};
