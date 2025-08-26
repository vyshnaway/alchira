import * as render from "./_.render.js";

export const style = {

  AS_Bold: '1',
  AS_Dim: '2',
  AS_Italic: '3',
  AS_Underline: '4',
  AS_Blink_Slow: '5',
  AS_Blink_Fast: '6',
  AS_Reverse: '7',
  AS_Hidden: '8',
  AS_Strikethrough: '9',
  AS_Rare: '20',

  AR_Bold_2UL: '21',
  AR_intensity: '22',
  AR_italic: '23',
  AR_underlined: '24',
  AR_blinking: '25',
  AR_inverted: '27',
  AR_hidden: '28',
  AR_struck: '29',

  TC_Normal_Black: '30',
  TC_Normal_Red: '31',
  TC_Normal_Green: '32',
  TC_Normal_Yellow: '33',
  TC_Normal_Blue: '34',
  TC_Normal_Magenta: '35',
  TC_Normal_Cyan: '36',
  TC_Normal_White: '37',
  TC_Bright_Black: '90',
  TC_Bright_Red: '91',
  TC_Bright_Green: '92',
  TC_Bright_Yellow: '93',
  TC_Bright_Blue: '94',
  TC_Bright_Magenta: '95',
  TC_Bright_Cyan: '96',
  TC_Bright_White: '97',

  BC_Normal_Black: '40',
  BC_Normal_Red: '41',
  BC_Normal_Green: '42',
  BC_Normal_Yellow: '43',
  BC_Normal_Blue: '44',
  BC_Normal_Magenta: '45',
  BC_Normal_Cyan: '46',
  BC_Normal_White: '47',
  BC_Bright_Black: '100',
  BC_Bright_Red: '101',
  BC_Bright_Green: '102',
  BC_Bright_Yellow: '103',
  BC_Bright_Blue: '104',
  BC_Bright_Magenta: '105',
  BC_Bright_Cyan: '106',
  BC_Bright_White: '107',
};

export const canvas: {
  config: {
    title: string[],
    text: string[],
    primary: string[],
    secondary: string[],
    tertiary: string[],
    success: string[],
    failed: string[],
    warning: string[],
    taskActive: boolean,
    postActive: boolean,
    tabSpace: number,
  },
  divider: {
    top: string,
    mid: string,
    low: string,
  },

  tab: string,
  width: () => number,
} = {
  config: {
    title: [],
    text: [],
    primary: [],
    secondary: [],
    tertiary: [],
    success: [],
    failed: [],
    warning: [],
    taskActive: true,
    postActive: true,
    tabSpace: 2,
  },

  divider: {
    top: "‾",
    mid: "─",
    low: "_",
  },

  tab: " ",
  width: () => typeof process.stdout.columns === 'number' ? process.stdout.columns : 48
};

Object.assign(canvas.config,
  {
    title: [style.TC_Normal_Green],
    text: [style.TC_Normal_White],
    primary: [style.TC_Normal_Yellow],
    secondary: [style.TC_Bright_Yellow],
    tertiary: [style.TC_Bright_Black],
    warning: [style.TC_Normal_Yellow],
    success: [style.TC_Normal_Green],
    failed: [style.TC_Normal_Red],
  }
);

export function init(
  taskActive = true,
  postActive = true,
  tabWidth = 2,
) {
  const width = canvas.width();

  canvas.tab = canvas.tab[0].repeat(tabWidth);
  canvas.config.taskActive = taskActive;
  canvas.config.postActive = postActive;
  canvas.divider.low = canvas.divider.low[0].repeat(width);
  canvas.divider.mid = canvas.divider.mid[0].repeat(width);
  canvas.divider.top = canvas.divider.top[0].repeat(width);
}

export function format(string = '', ...styles: (typeof style)[keyof typeof style][]) {
  return (styles.length ? `\x1b[${styles.join(';')}m` : "") + string + `\x1b[0m`;
}

export function post(string?: string, ...styles: string[]) {
  render.write(format(string, ...styles));
};
