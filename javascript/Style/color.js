export function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return { red: Math.max(0, Math.min(255, Math.round(f(0) * 255))), green: Math.max(0, Math.min(255, Math.round(f(8) * 255))), blue: Math.max(0, Math.min(255, Math.round(f(4) * 255))) };
}

// OKLCH to RGB conversion (approximate, for editor use)
export function oklchToRgb(L, C, H) {
    // Convert OKLCH to OKLab
    const hRad = H * Math.PI / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);
    // OKLab to linear sRGB
    const l_ = L;
    const m_ = l_ + 0.3963377774 * a + 0.2158037573 * b;
    const s_ = l_ - 0.1055613458 * a - 0.0638541728 * b;
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
    const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const b_ = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
    // Clamp and convert to 0-255
    return {
        r: Math.max(0, Math.min(255, Math.round(r * 255))),
        g: Math.max(0, Math.min(255, Math.round(g * 255))),
        b: Math.max(0, Math.min(255, Math.round(b_ * 255)))
    };
}

// RGB to OKLCH string (for presentation, not for round-trip accuracy)
export function rgbToOklch(r, g, b) {
    // Convert sRGB to linear
    r /= 255; g /= 255; b /= 255;
    // sRGB to OKLab
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);
    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
    const C = Math.sqrt(a * a + b_ * b_);
    const H = Math.atan2(b_, a) * 180 / Math.PI;
    return `${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)}`;
}

// LAB to RGB conversion
export function labToRgb(L, a, b) {
    // D65/2° standard illuminant
    const y = (L + 16) / 116;
    const x = a / 500 + y;
    const z = y - b / 200;
    const xyz = [x, y, z].map((v) => {
        const v3 = v ** 3;
        return (v3 > 0.008856 ? v3 : (v - 16 / 116) / 7.787) *
            [95.047, 100.0, 108.883][0]; // Changed to [0] because the original code had an out-of-bounds access.
    });
    // XYZ to RGB
    const [X, Y, Z] = xyz.map(v => v / 100);
    let r = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
    let g = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
    let bb = X * 0.0557 + Y * -0.2040 + Z * 1.0570;
    [r, g, bb] = [r, g, bb].map(v => {
        v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
        return Math.max(0, Math.min(255, Math.round(v * 255)));
    });
    return { r, g, b: bb };
}

// LCH to RGB conversion (via LAB)
export function lchToRgb(L, C, H) {
    const hRad = H * Math.PI / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);
    return labToRgb(L, a, b);
}

// HWB to RGB conversion
export function hwbToRgb(h, w, b) {
    // Convert HWB to RGB
    h = h % 360;
    w /= 100;
    b /= 100;
    const rgb = hslToRgb(h, 100, 50);
    const red = rgb.red;
    const green = rgb.green;
    const blue = rgb.blue;

    const r_final = red * (1 - w - b) + w * 255;
    const g_final = green * (1 - w - b) + w * 255;
    const b_final = blue * (1 - w - b) + w * 255;
    return {
        r: Math.max(0, Math.min(255, Math.round(r_final))),
        g: Math.max(0, Math.min(255, Math.round(g_final))),
        bb: Math.max(0, Math.min(255, Math.round(b_final)))
    };
}

// RGB to LAB string (for presentation)
export function rgbToLab(r, g, b) {
    // sRGB to XYZ
    r /= 255;
    g /= 255;
    b /= 255;

    const gammaCorrected = (v) => {
        return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
    };
    r = gammaCorrected(r);
    g = gammaCorrected(g);
    b = gammaCorrected(b);

    const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    const Y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    const Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

    const f = (v) => v > 0.008856 ? Math.cbrt(v) : (7.787 * v) + 16 / 116;
    const fX = f(X);
    const fY = f(Y);
    const fZ = f(Z);

    const L = (116 * fY) - 16;
    const a = 500 * (fX - fY);
    const bb = 200 * (fY - fZ);
    return `${L.toFixed(1)} ${a.toFixed(1)} ${bb.toFixed(1)}`;
}

// RGB to LCH string (for presentation)
export function rgbToLch(r, g, b) {
    const lab = rgbToLab(r, g, b);
    const parts = lab.split(" ").map(Number);
    const L = parts[0];
    const a = parts[1];
    const bb = parts[2];
    const C = Math.sqrt(a * a + bb * bb);
    const H = (Math.atan2(bb, a) * 180) / Math.PI;
    return `${L.toFixed(1)} ${C.toFixed(1)} ${H.toFixed(1)}`;
}

// RGB to HWB string (for presentation)
export function rgbToHwb(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    if (max === min) {
        h = 0;
    } else if (max === r) {
        h = (60 * ((g - b) / (max - min)) + 360) % 360;
    } else if (max === g) {
        h = (60 * ((b - r) / (max - min)) + 120) % 360;
    } else if (max === b) {
        h = (60 * ((r - g) / (max - min)) + 240) % 360;
    }
    const w = min * 100;
    const bb = (1 - max) * 100;
    return `${h.toFixed(1)} ${w.toFixed(1)}% ${bb.toFixed(1)}%`;
}
