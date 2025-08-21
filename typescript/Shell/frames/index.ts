import render from "../4.post.js";

import renderTitle from "./0.title.js";
import renderLoki from "./1.loki.js";

export default {
  Title: (string: string, duration: number, repeat = 1) => {
    return new Promise((resolve) => {
      const frames = renderTitle(string);
      resolve(render.animate(frames, duration, repeat));
    });
  },
  Loki: (string: string, varients = 50, duration: number) => {
    return new Promise((resolve) => {
      const frames = renderLoki(string, varients);
      resolve(render.animate(frames, duration, 0));
    });
  },
};
