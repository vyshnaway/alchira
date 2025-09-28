import * as render from "../render.js";
import renderTitle from "./0.title.js";
import renderLoki from "./1.loki.js";
export function Title(string, duration, frames = 1) {
    return new Promise((resolve) => {
        resolve(render.animate(renderTitle(string), duration, frames));
    });
}
export function Loki(string, duration, frames = 50) {
    return new Promise((resolve) => {
        resolve(render.animate(renderLoki(string, frames), duration, 0));
    });
}
//# sourceMappingURL=main.js.map