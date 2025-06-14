/**
 * Converts HSL color values to RGB color values.
 * @param {number} h - Hue (0-360).
 * @param {number} s - Saturation (0-100).
 * @param {number} l - Lightness (0-100).
 * @returns {{r: number, g: number, b: number}} - RGB color object with values from 0-255.
 */
export function hslToRgb(h, s, l) {
    s /= 100; // Normalize saturation to [0, 1]
    l /= 100; // Normalize lightness to [0, 1]

    // Helper function to calculate 'k' for the HSL to RGB formula
    const k = (n) => (n + h / 30) % 12;
    // 'a' is an intermediate value derived from saturation and lightness
    const a = s * Math.min(l, 1 - l);
    // 'f' calculates the individual R, G, B components before scaling to 0-255
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    return {
        r: Math.max(0, Math.min(255, Math.round(f(0) * 255))), // Red component
        g: Math.max(0, Math.min(255, Math.round(f(8) * 255))), // Green component
        b: Math.max(0, Math.min(255, Math.round(f(4) * 255)))  // Blue component
    };
}

/**
 * Converts RGB color values to HSL color values.
 * @param {number} r - Red (0-255).
 * @param {number} g - Green (0-255).
 * @param {number} b - Blue (0-255).
 * @returns {{h: number, s: number, l: number}} - HSL color object with h (0-360), s (0-100), l (0-100).
 */
export function rgbToHsl(r, g, b) {
    // Normalize R, G, B to the range [0, 1]
    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b); // Find the maximum component value
    let min = Math.min(r, g, b); // Find the minimum component value
    let h, s, l = (max + min) / 2; // Calculate lightness

    if (max === min) {
        h = s = 0; // Achromatic (grayscale)
    } else {
        let d = max - min; // Difference between max and min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min); // Calculate saturation

        // Calculate hue based on which component is max
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6; // Normalize hue to [0, 1]
    }

    h = Math.round(h * 360); // Convert hue to degrees (0-360)
    s = Math.round(s * 100); // Convert saturation to percentage (0-100)
    l = Math.round(l * 100); // Convert lightness to percentage (0-100)

    return { h, s, l };
}

/**
 * Converts OKLCH color values to RGB color values (approximate for display/editor use).
 * @param {number} L - Lightness (0-1).
 * @param {number} C - Chroma.
 * @param {number} H - Hue (0-360).
 * @returns {{r: number, g: number, b: number}} - RGB color object with values from 0-255.
 */
export function oklchToRgb(L, C, H) {
    // Convert OKLCH to OKLab (a, b components)
    const hRad = H * Math.PI / 180; // Convert hue from degrees to radians
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);

    // Call oklabToRgb to do the rest of the conversion
    return oklabToRgb(L, a, b);
}

/**
 * Converts RGB color values to OKLCH color values.
 * @param {number} r - Red (0-255).
 * @param {number} g - Green (0-255).
 * @param {number} b - Blue (0-255).
 * @returns {{L: number, C: number, H: number}} - OKLCH color object.
 */
export function rgbToOklch(r, g, b) {
    const oklab = rgbToOklab(r, g, b);
    const L = oklab.L;
    const a = oklab.a;
    const b_comp = oklab.b;

    // Convert OKLab (a, b) to OKLCH (C, H)
    const C = Math.sqrt(a * a + b_comp * b_comp); // Chroma
    let H = (Math.atan2(b_comp, a) * 180 / Math.PI + 360) % 360; // Hue in degrees

    // If chroma is very close to zero, hue is undefined, conventionally set to 0.
    if (C < 1e-6) { // Use a small epsilon for floating point comparison
        H = 0;
    }

    return { L: parseFloat(L.toFixed(3)), C: parseFloat(C.toFixed(3)), H: parseFloat(H.toFixed(1)) };
}

/**
 * Converts LAB color values to RGB color values.
 * Uses D65/2° standard illuminant for XYZ conversion.
 * @param {number} L - Lightness (0-100).
 * @param {number} a - Green-Red axis (-128 to 127 approx).
 * @param {number} b - Blue-Yellow axis (-128 to 127 approx).
 * @returns {{r: number, g: number, b: number}} - RGB color object with values from 0-255.
 */
export function labToRgb(L, a, b) {
    // D65/2° standard illuminant reference white point values
    const D65_Xn = 95.047;
    const D65_Yn = 100.0;
    const D65_Zn = 108.883;

    // Convert LAB to XYZ
    // Intermediate functions for f_x, f_y, f_z
    const f_y = (L + 16) / 116;
    const f_x = a / 500 + f_y;
    const f_z = f_y - b / 200;

    // Apply inverse f-function to get X, Y, Z ratios relative to reference white
    const inverse_f = (t) => t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787;

    const X = inverse_f(f_x) * D65_Xn;
    const Y = inverse_f(f_y) * D65_Yn;
    const Z = inverse_f(f_z) * D65_Zn;

    // Convert XYZ to linear sRGB
    // Normalize XYZ values to [0, 1] range for matrix multiplication
    const X_norm = X / 100;
    const Y_norm = Y / 100;
    const Z_norm = Z / 100;

    let r_linear = X_norm * 3.2406 + Y_norm * -1.5372 + Z_norm * -0.4986;
    let g_linear = X_norm * -0.9689 + Y_norm * 1.8758 + Z_norm * 0.0415;
    let b_linear = X_norm * 0.0557 + Y_norm * -0.2040 + Z_norm * 1.0570;

    // Apply sRGB gamma correction and clamp to 0-255
    const gammaCorrectAndClamp = (v) => {
        v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
        return Math.max(0, Math.min(255, Math.round(v * 255)));
    };

    return {
        r: gammaCorrectAndClamp(r_linear),
        g: gammaCorrectAndClamp(g_linear),
        b: gammaCorrectAndClamp(b_linear)
    };
}

/**
 * Converts LCH color values to RGB color values by first converting to LAB.
 * @param {number} L - Lightness (0-100).
 * @param {number} C - Chroma.
 * @param {number} H - Hue (0-360).
 * @returns {{r: number, g: number, b: number}} - RGB color object with values from 0-255.
 */
export function lchToRgb(L, C, H) {
    // Convert LCH (L, C, H) to LAB (L, a, b)
    const hRad = H * Math.PI / 180; // Convert hue from degrees to radians
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);
    // Then convert LAB to RGB
    return labToRgb(L, a, b);
}

/**
 * Converts HWB color values to RGB color values.
 * @param {number} h - Hue (0-360).
 * @param {number} w - Whiteness (0-100).
 * @param {number} bl - Blackness (0-100).
 * @returns {{r: number, g: number, b: number}} - RGB color object with values from 0-255.
 */
export function hwbToRgb(h, w, bl) {
    h = h % 360; // Ensure hue is within 0-360
    w /= 100; // Normalize whiteness to [0, 1]
    bl /= 100; // Normalize blackness to [0, 1]

    // Get the base RGB color from HSL (with full saturation and 50% lightness)
    const baseRgb = hslToRgb(h, 100, 50);
    const red = baseRgb.r;
    const green = baseRgb.g;
    const blue = baseRgb.b;

    // Apply whiteness and blackness to the base RGB color
    const r_final = red * (1 - w - bl) + w * 255;
    const g_final = green * (1 - w - bl) + w * 255;
    const b_final = blue * (1 - w - bl) + w * 255;

    // Clamp and round the final RGB values to 0-255
    return {
        r: Math.max(0, Math.min(255, Math.round(r_final))),
        g: Math.max(0, Math.min(255, Math.round(g_final))),
        b: Math.max(0, Math.min(255, Math.round(b_final)))
    };
}

/**
 * Converts RGB color values to LAB color values.
 * @param {number} r - Red (0-255).
 * @param {number} g - Green (0-255).
 * @param {number} b - Blue (0-255).
 * @returns {{L: number, a: number, b: number}} - LAB color object.
 */
export function rgbToLab(r, g, b) {
    // Normalize RGB to [0, 1]
    r /= 255;
    g /= 255;
    b /= 255;

    // Apply inverse gamma correction (sRGB to linear sRGB)
    const gammaCorrected = (v) => {
        return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
    };
    r = gammaCorrected(r);
    g = gammaCorrected(g);
    b = gammaCorrected(b);

    // Convert linear sRGB to XYZ using D65 illuminant
    // Reference white D65: Xn=0.95047, Yn=1.00000, Zn=1.08883
    const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    const Y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    const Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

    // Apply a special function 'f' for CIELAB transformation
    const f = (v) => v > 0.008856 ? Math.cbrt(v) : (7.787 * v) + 16 / 116;
    const fX = f(X);
    const fY = f(Y);
    const fZ = f(Z);

    // Calculate L, a, b components
    const L = (116 * fY) - 16;
    const a_comp = 500 * (fX - fY);
    const b_comp = 200 * (fY - fZ);

    return { L: parseFloat(L.toFixed(1)), a: parseFloat(a_comp.toFixed(1)), b: parseFloat(b_comp.toFixed(1)) };
}

/**
 * Converts RGB color values to LCH color values.
 * @param {number} r - Red (0-255).
 * @param {number} g - Green (0-255).
 * @param {number} b - Blue (0-255).
 * @returns {{L: number, C: number, H: number}} - LCH color object.
 */
export function rgbToLch(r, g, b) {
    // First convert RGB to LAB
    const lab = rgbToLab(r, g, b);
    const L = lab.L;
    const a = lab.a;
    const b_comp = lab.b;

    // Calculate Chroma (C) and Hue (H) from LAB's a and b components
    const C = Math.sqrt(a * a + b_comp * b_comp);
    // Ensure hue is positive and within 0-360 range
    let H = (Math.atan2(b_comp, a) * 180 / Math.PI + 360) % 360; // Hue in degrees

    // If chroma is very close to zero, hue is undefined, conventionally set to 0.
    if (C < 1e-6) {
        H = 0;
    }

    return { L: parseFloat(L.toFixed(1)), C: parseFloat(C.toFixed(1)), H: parseFloat(H.toFixed(1)) };
}

/**
 * Converts RGB color values to HWB color values.
 * @param {number} r - Red (0-255).
 * @param {number} g - Green (0-255).
 * @param {number} b - Blue (0-255).
 * @returns {{h: number, w: number, b: number}} - HWB color object.
 */
export function rgbToHwb(r, g, b) {
    // Normalize RGB to [0, 1]
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b); // Max component
    const min = Math.min(r, g, b); // Min component

    let h = 0;
    // Calculate hue
    if (max === min) {
        h = 0; // Achromatic
    } else if (max === r) {
        h = (60 * ((g - b) / (max - min)) + 360) % 360;
    } else if (max === g) {
        h = (60 * ((b - r) / (max - min)) + 120) % 360;
    } else if (max === b) {
        h = (60 * ((r - g) / (max - min)) + 240) % 360;
    }

    // Calculate whiteness and blackness
    const w = min * 100;
    const bl = (1 - max) * 100;

    return { h: parseFloat(h.toFixed(1)), w: parseFloat(w.toFixed(1)), b: parseFloat(bl.toFixed(1)) };
}

/**
 * Converts RGB color values to a hexadecimal string.
 * @param {number} r - Red (0-255).
 * @param {number} g - Green (0-255).
 * @param {number} b - Blue (0-255).
 * @returns {string} - Hexadecimal color string (e.g., "#RRGGBB").
 */
export function rgbToHex(r, g, b) {
    // Helper function to convert a single color component to a two-digit hex string
    const toHex = (c) => {
        const hex = Math.round(c).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts a hexadecimal color string to RGB color values.
 * Supports "#RRGGBB" and "RRGGBB" formats.
 * @param {string} hex - Hexadecimal color string.
 * @returns {{r: number, g: number, b: number}} - RGB color object with values from 0-255.
 */
export function hexToRgb(hex) {
    // Remove '#' if present
    const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;

    // Parse R, G, B components
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return { r, g, b };
}

/**
 * Converts Oklab color values (L, a, b) to RGB color values.
 * @param {number} L - Lightness (0-1).
 * @param {number} a - Green-Red axis.
 * @param {number} b - Blue-Yellow axis.
 * @returns {{r: number, g: number, b: number}} - RGB color object with values from 0-255.
 */
export function oklabToRgb(L, a, b) {
    // Convert OKLab (L, a, b) to LMS' (l_prime, m_prime, s_prime)
    // These are the cube roots of LMS values based on the Oklab specification.
    const l_prime = L + a * 0.3963377774 + b * 0.2158037573;
    const m_prime = L - a * 0.1055613458 - b * 0.0638541728;
    const s_prime = L - a * 0.1055613458 + b * 0.0638541728; // Corrected sign for 'b' in s_prime calculation

    // Cube the LMS' values to get linear LMS
    const l_linear = l_prime * l_prime * l_prime;
    const m_linear = m_prime * m_prime * m_prime;
    const s_linear = s_prime * s_prime * s_prime;

    // Convert linear LMS to linear sRGB using the inverse transformation matrix
    let r_linear = +4.0767416621 * l_linear - 3.3077115913 * m_linear + 0.2309699292 * s_linear;
    let g_linear = -1.2684380046 * l_linear + 2.6097574011 * m_linear - 0.3413193965 * s_linear;
    let b_linear = -0.0041960863 * l_linear - 0.7034186147 * m_linear + 1.707614701 * s_linear;

    // Apply sRGB Opto-Electronic Transfer Function (OETF, also known as gamma correction)
    const srgbOetf = (val) => {
        // Clamp to [0, 1] before OETF application for robustness
        val = Math.max(0, Math.min(1, val));
        return val <= 0.0031308
            ? 12.92 * val
            : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
    };

    return {
        r: Math.max(0, Math.min(255, Math.round(srgbOetf(r_linear) * 255))),
        g: Math.max(0, Math.min(255, Math.round(srgbOetf(g_linear) * 255))),
        b: Math.max(0, Math.min(255, Math.round(srgbOetf(b_linear) * 255)))
    };
}

/**
 * Converts RGB color values to Oklab color values (L, a, b).
 * @param {number} r - Red (0-255).
 * @param {number} g - Green (0-255).
 * @param {number} b - Blue (0-255).
 * @returns {{L: number, a: number, b: number}} - Oklab color object.
 */
export function rgbToOklab(r, g, b) {
    // Convert sRGB to linear sRGB
    r /= 255;
    g /= 255;
    b /= 255;

    // Linear sRGB to LMS (intermediate values before cube root for OKLab)
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

    // Apply cube root OOTF to get l_, m_, s_
    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);

    // Convert LMS' to OKLab (L, a, b) using the transformation matrix
    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

    return { L, a, b: b_ };
}


// Object to organize color conversion functions for easy access
export const convert = {
    from: {
        lch: lchToRgb,
        lab: labToRgb,
        hwb: hwbToRgb,
        hsl: hslToRgb,
        oklch: oklchToRgb,
        oklab: oklabToRgb,
    },
    to: {
        lch: rgbToLch,
        lab: rgbToLab,
        hwb: rgbToHwb,
        hsl: rgbToHsl,
        oklch: rgbToOklch,
        oklab: rgbToOklab,
    },
    LoadHex: rgbToHex,
};
// Updated regex patterns for more accurate parsing of color strings including floats and percentages.
const regex = {
    rgb: /\brgb\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)/gi,
    hex: /\b#([0-9A-Fa-f]{3,6})\b/gi, // Note: hex supports 3 or 6 digits currently in your regex
    hsl: /\bhsl\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)%\s*,\s*(-?\d*\.?\d+)%\s*\)/gi,
    hwb: /\bhwb\(\s*(-?\d*\.?\d+)\s+(-?\d*\.?\d+)%\s+(-?\d*\.?\d+)%(?:\s*\/\s*(-?\d*\.?\d+))?\s*\)/gi,
    lab: /\blab\(\s*(-?\d*\.?\d+)%?\s+([-?\d*\.?\d]+)\s+([-?\d*\.?\d]+)(?:\s*\/\s*(-?\d*\.?\d+))?\s*\)/gi,
    lch: /\blch\(\s*(-?\d*\.?\d+)%?\s+([\d*\.?\d]+)\s+(-?\d*\.?\d+)(?:\s*\/\s*(-?\d*\.?\d+))?\s*\)/gi,
    oklab: /\boklab\(\s*(-?\d*\.?\d+)\s+(-?\d*\.?\d+)\s+(-?\d*\.?\d+)(?:\s*\/\s*(-?\d*\.?\d+))?\s*\)/gi,
    oklch: /\boklch\(\s*(-?\d*\.?\d+)\s+([\d*\.?\d]+)\s+(-?\d*\.?\d+)(?:\s*\/\s*(-?\d*\.?\d+))?\s*\)/gi,
};

// Define the order in which to process color methods. More specific should generally come first if there
// are potential substring matches, but for these distinct function names, order is less critical.
// Include all methods you want to process in the loop, including hsl and rgb.
const targetMethods = [
    "oklch",
    "oklab",
    "lch",
    "lab",
    "hwb",
    "hsl", // Added HSL
    "rgb", // Added RGB
];

/**
 * Loads color values from a string, converts them to RGB, and then to hexadecimal format.
 * It replaces the original color string with its hexadecimal equivalent.
 * Supports HSL, HWB, LAB, LCH, OKLAB, OKLCH, and RGB formats.
 *
 * @param {string} string - The input string containing color values. Defaults to an empty string.
 * @returns {object} An object containing the score (number of conversions) and the modified string.
 */
export default function LoadColorFallback(string = '') {
    let result = string, score = 0;

    // Process each specified color method.
    for (const method of targetMethods) {
        const currentRegex = regex[method];
        if (!currentRegex) { // Corrected: If regex doesn't exist, skip.
            console.warn(`No regex defined for method: ${method}`);
            continue;
        }

        // Use replace with a callback function to perform conversion
        result = result.replace(currentRegex, (match, ...args) => {
            if (!['rgb', 'hsl'].includes(method)) score++;

            let convertedRgb;
            // The last two elements of args are the offset and the full string, we only care about capture groups.
            // Adjust slice to get only the captured groups, excluding offset and original string from replace callback.
            const captureGroups = args.slice(0, args.length - 2);
            const alpha = captureGroups[captureGroups.length - 1]; // Alpha is the last captured group if present

            switch (method) {
                case "hsl":
                    // hsl(h, s%, l%) -> h, s, l are numbers
                    convertedRgb = convert.from.hsl(
                        parseFloat(captureGroups[0]),
                        parseFloat(captureGroups[1]),
                        parseFloat(captureGroups[2])
                    );
                    break;
                case "hwb":
                    // hwb(h w% b% / a) -> h, w, b are numbers, a is optional
                    convertedRgb = convert.from.hwb(
                        parseFloat(captureGroups[0]),
                        parseFloat(captureGroups[1]),
                        parseFloat(captureGroups[2])
                    );
                    break;
                case "lab":
                    // lab(L a b / a) -> L, a, b are numbers. L might have %
                    // Ensure L is correctly parsed, remove % if present.
                    const L_lab = parseFloat(captureGroups[0].replace('%', ''));
                    convertedRgb = convert.from.lab(
                        L_lab,
                        parseFloat(captureGroups[1]),
                        parseFloat(captureGroups[2])
                    );
                    break;
                case "lch":
                    // lch(L C H / a) -> L, C, H are numbers. L might have %
                    // Ensure L is correctly parsed, remove % if present.
                    const L_lch = parseFloat(captureGroups[0].replace('%', ''));
                    convertedRgb = convert.from.lch(
                        L_lch,
                        parseFloat(captureGroups[1]),
                        parseFloat(captureGroups[2])
                    );
                    break;
                case "oklab":
                    // oklab(L a b / a) -> L, a, b are numbers (L is 0-1)
                    convertedRgb = convert.from.oklab(
                        parseFloat(captureGroups[0]),
                        parseFloat(captureGroups[1]),
                        parseFloat(captureGroups[2])
                    );
                    break;
                case "oklch":
                    // oklch(L C H / a) -> L, C, H are numbers (L is 0-1)
                    convertedRgb = convert.from.oklch(
                        parseFloat(captureGroups[0]),
                        parseFloat(captureGroups[1]),
                        parseFloat(captureGroups[2])
                    );
                    break;
                case "rgb":
                    // rgb(r, g, b) -> r, g, b are numbers
                    convertedRgb = {
                        r: parseFloat(captureGroups[0]),
                        g: parseFloat(captureGroups[1]),
                        b: parseFloat(captureGroups[2])
                    };
                    break;
                default:
                    console.warn(`Unhandled color method in loadColorFallback: ${method}`);
                    return match; // Return original match if no conversion logic
            }

            // If a valid RGB object was obtained, convert it to Hex
            if (convertedRgb && typeof convertedRgb.r === 'number' && typeof convertedRgb.g === 'number' && typeof convertedRgb.b === 'number') {
                // Pass alpha if it was captured and is a valid number, otherwise default to 1
                const finalAlpha = alpha !== undefined && !isNaN(parseFloat(alpha)) ? parseFloat(alpha) : 1;
                return convert.LoadHex(convertedRgb.r, convertedRgb.g, convertedRgb.b, finalAlpha);
            }
            return match; // Return original match if conversion was not successful
        });
    }

    // Handle hexadecimal conversion separately, as it uses hexToRgb directly
    // and doesn't fit the `convert.from[method]` pattern for parsing.
    result = result.replace(regex.hex, (match, hexValue) => {
        score++;
        const rgb = hexToRgb(hexValue);
        // hexToRgb as implemented above does not return alpha, so assuming 1
        return convert.LoadHex(rgb.r, rgb.g, rgb.b);
    });

    return Boolean(score) ? [result, string] : [string];
}
