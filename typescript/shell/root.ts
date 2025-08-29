import * as style from "./style.js";
import * as render from "./render.js";

export const canvas: {

  config: {
    taskActive: boolean,
    postActive: boolean,
    tabSpace: number,
  },

  divider: {
    top: string,
    mid: string,
    btm: string,
  },

  tab: string,

  width: () => number,

} = {

  config: {
    taskActive: true,
    postActive: true,
    tabSpace: 2,
  },

  divider: {
    top: "‾",
    mid: "─",
    btm: "_",
  },

  tab: " ",

  width: () => typeof process.stdout.columns === 'number' ? process.stdout.columns : 48

};

export const preset = {
  title: [style.TC_Normal_Green],
  text: [style.TC_Normal_White],
  link: [style.AS_Underline],
  primary: [style.TC_Normal_Yellow],
  secondary: [style.TC_Normal_Yellow],
  tertiary: [style.TC_Bright_Black],
  warning: [style.TC_Normal_Yellow],
  success: [style.TC_Normal_Green],
  failed: [style.TC_Normal_Red],
};

export function init(
  taskActive = true,
  postActive = true,
  tabWidth = 2,
) {
  const width = canvas.width();

  canvas.tab = canvas.tab[0].repeat(tabWidth);
  canvas.config.taskActive = taskActive;
  canvas.config.postActive = postActive;
  canvas.divider.btm = canvas.divider.btm[0].repeat(width);
  canvas.divider.mid = canvas.divider.mid[0].repeat(width);
  canvas.divider.top = canvas.divider.top[0].repeat(width);
}

export function fmt(string = '', ...styles: string[]) {
  return styles.length ? `\x1b[${styles.join(';')}m${string}\x1b[0m` : string;
}

export function post(string?: string, ...styles: string[]) {
  render.write(fmt(string, ...styles));
};
