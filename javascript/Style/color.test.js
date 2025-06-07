import * as color from "./color.js"

// export function test() {
//     // Example usage and verification
//     const rgb = { r: 200, g: 100, b: 50 };
//     const h = 20;
//     const s = 80;
//     const l = 30;
//     const L_oklch = 0.6;
//     const C_oklch = 0.2;
//     const H_oklch = 150;
//     const L_lab = 50;
//     const a_lab = 20;
//     const b_lab = -30;
//     const L_lch = 60;
//     const C_lch = 40;
//     const H_lch = 210;
//     const h_hwb = 200;
//     const w_hwb = 10;
//     const b_hwb = 20;

//     console.log("RGB:", rgb);
//     console.log("HSL:", h, s, l);
//     console.log("OKLCH:", L_oklch, C_oklch, H_oklch);
//     console.log("LAB:", L_lab, a_lab, b_lab);
//     console.log("LCH:", L_lch, C_lch, H_lch);
//     console.log("HWB", h_hwb, w_hwb, b_hwb);


//     const rgbFromHsl = hslToRgb(h, s, l);
//     console.log("HSL to RGB:", rgbFromHsl);

//     const rgbFromOklch = oklchToRgb(L_oklch, C_oklch, H_oklch);
//     console.log("OKLCH to RGB:", rgbFromOklch);

//     const oklchFromRgb = rgbToOklch(rgb.r, rgb.g, rgb.b);
//     console.log("RGB to OKLCH:", oklchFromRgb);

//     const rgbFromLab = labToRgb(L_lab, a_lab, b_lab);
//     console.log("LAB to RGB", rgbFromLab);

//     const rgbFromLch = lchToRgb(L_lch, C_lch, H_lch);
//     console.log("LCH to RGB", rgbFromLch);

//     const rgbFromHwb = hwbToRgb(h_hwb, w_hwb, b_hwb);
//     console.log("HWB to RGB", rgbFromHwb);

//     const labFromRgb = rgbToLab(rgb.r, rgb.g, rgb.b);
//     console.log("RGB to LAB:", labFromRgb);

//     const lchFromRgb = rgbToLch(rgb.r, rgb.g, rgb.b);
//     console.log("RGB to LCH", lchFromRgb);

//     const hwbFromRgb = rgbToHwb(rgb.r, rgb.g, rgb.b);
//     console.log("RGB to HWB", hwbFromRgb);
// }

// test();