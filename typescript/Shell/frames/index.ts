import render from "../4.post.js";

import renderTitle from "./0.title.js";
import renderLoki from "./1.loki.js";

export default {
  Title: (string, duration, repeat = 1) => {
    return new Promise(async (resolve) => {
      const frames = renderTitle(string);
      resolve(await render.animate(frames, duration, repeat));
    });
  },
  Loki: (string, varients = 50, duration) => {
    return new Promise(async (resolve) => {
      const frames = renderLoki(string, varients);
      resolve(await render.animate(frames, duration, 0));
    });
  },
};
