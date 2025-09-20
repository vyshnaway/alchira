package utils

import (
	"fmt"
	"math"
	"strconv"
	"strings"
)

// ColorResult defines the structure for returned color values,
// including RGB, HSL, LAB, LCH, HWB, OKLAB, OKLCH components, alpha,
// and a CSS-like string representation.
type ColorResult struct {
	R         float64 // Red component (0-255)
	G         float64 // Green component (0-255)
	B         float64 // Blue component (0-255)
	H         float64 // Hue component (0-360)
	S         float64 // Saturation component (0-100)
	L         float64 // Lightness component (0-100 for HSL, 0-100 for LAB/LCH/OKLAB/OKLCH)
	A         float64 // 'a' component for LAB/OKLAB
	BComp     float64 // 'b' component for LAB/OKLAB
	C         float64 // Chroma component for LCH/OKLCH
	HComp     float64 // Hue component for LCH/OKLCH (0-360)
	W         float64 // Whiteness component for HWB (0-100)
	Bl        float64 // Blackness component for HWB (0-100)
	Alpha     float64 // Alpha component (0-1)
	Converted string  // CSS-like string representation (e.g., "rgb(255, 0, 0)")
}

// hslToRgb converts HSL color values to RGB.
// h: Hue (0-360), s: Saturation (0-100), l: Lightness (0-100), alpha: Opacity (0-1).
func color_HslToRgb(h, s, l, alpha float64) ColorResult {
	s /= 100
	l /= 100

	k := func(n float64) float64 {
		return math.Mod(n+h/30, 12)
	}

	_a := s * math.Min(l, 1-l)

	f := func(n float64) float64 {
		return l - _a*math.Max(-1, math.Min(k(n)-3, math.Min(9-k(n), 1)))
	}

	r := math.Max(0, math.Min(255, math.Round(f(0)*255)))
	g := math.Max(0, math.Min(255, math.Round(f(8)*255)))
	b := math.Max(0, math.Min(255, math.Round(f(4)*255)))
	a := math.Max(0, math.Min(1, alpha))

	converted := fmt.Sprintf("rgb(%.0f, %.0f, %.0f)", r, g, b)
	if a != 1 {
		converted = fmt.Sprintf("rgba(%.0f, %.0f, %.0f, %.3f)", r, g, b, a)
	}

	return ColorResult{R: r, G: g, B: b, Alpha: a, Converted: converted}
}

// rgbToHsl converts RGB color values to HSL.
// r, g, b: Red, Green, Blue components (0-255), alpha: Opacity (0-1).
func color_RgbToHsl(r, g, b, alpha float64) ColorResult {
	r /= 255
	g /= 255
	b /= 255

	max := math.Max(r, math.Max(g, b))
	min := math.Min(r, math.Min(g, b))

	var h, s float64
	l := (max + min) / 2

	if max == min {
		h = 0
		s = 0
	} else {
		d := max - min
		if l > 0.5 {
			s = d / (2 - max - min)
		} else {
			s = d / (max + min)
		}

		switch max {
		case r:
			h = (g - b) / d
			if g < b {
				h += 6
			}
		case g:
			h = (b-r)/d + 2
		case b:
			h = (r-g)/d + 4
		default:
			h = 0
		}
		h /= 6
	}

	h = math.Round(h * 360)
	s = math.Round(s * 100)
	l = math.Round(l * 100)
	a := math.Max(0, math.Min(1, alpha))

	converted := fmt.Sprintf("hsl(%.0f %.0f%% %.0f%%)", h, s, l)
	if a != 1 {
		converted = fmt.Sprintf("hsl(%.0f %.0f%% %.0f%% / %.3f)", h, s, l, a)
	}

	return ColorResult{H: h, S: s, L: l, Alpha: a, Converted: converted}
}

// labToRgb converts CIELAB color values to RGB.
// L: Lightness (0-100), a, b: Chromaticity components (-128 to 127 approx), alpha: Opacity (0-1).
func color_LabToRgb(L, a, b, alpha float64) ColorResult {
	const D65_Xn = 95.047
	const D65_Yn = 100.0
	const D65_Zn = 108.883

	f_y := (L + 16) / 116
	f_x := a/500 + f_y
	f_z := f_y - b/200

	inverse_f := func(t float64) float64 {
		if math.Pow(t, 3) > 0.008856 {
			return math.Pow(t, 3)
		}
		return (t - 16/116.0) / 7.787
	}

	X := inverse_f(f_x) * D65_Xn
	Y := inverse_f(f_y) * D65_Yn
	Z := inverse_f(f_z) * D65_Zn

	X_norm := X / 100
	Y_norm := Y / 100
	Z_norm := Z / 100

	r_linear := X_norm*3.2406 + Y_norm*-1.5372 + Z_norm*-0.4986
	g_linear := X_norm*-0.9689 + Y_norm*1.8758 + Z_norm*0.0415
	b_linear := X_norm*0.0557 + Y_norm*-0.2040 + Z_norm*1.0570

	gammaCorrectAndClamp := func(v float64) float64 {
		if v <= 0.0031308 {
			v = 12.92 * v
		} else {
			v = 1.055*math.Pow(v, 1/2.4) - 0.055
		}
		return math.Max(0, math.Min(255, math.Round(v*255)))
	}

	r := gammaCorrectAndClamp(r_linear)
	g := gammaCorrectAndClamp(g_linear)
	b_val := gammaCorrectAndClamp(b_linear)
	a_val := math.Max(0, math.Min(1, alpha))

	converted := fmt.Sprintf("rgb(%.0f, %.0f, %.0f)", r, g, b_val)
	if a_val != 1 {
		converted = fmt.Sprintf("rgba(%.0f, %.0f, %.0f, %.3f)", r, g, b_val, a_val)
	}

	return ColorResult{R: r, G: g, B: b_val, Alpha: a_val, Converted: converted}
}

// rgbToLab converts RGB color values to CIELAB.
// r, g, b: Red, Green, Blue components (0-255), alpha: Opacity (0-1).
func color_RgbToLab(r, g, b, alpha float64) ColorResult {
	r /= 255
	g /= 255
	b /= 255

	gammaCorrected := func(v float64) float64 {
		if v > 0.04045 {
			return math.Pow((v+0.055)/1.055, 2.4)
		}
		return v / 12.92
	}

	r = gammaCorrected(r)
	g = gammaCorrected(g)
	b = gammaCorrected(b)

	const D65_Xn = 0.95047
	const D65_Yn = 1.00000
	const D65_Zn = 1.08883

	X := (r*0.4124 + g*0.3576 + b*0.1805) / D65_Xn
	Y := (r*0.2126 + g*0.7152 + b*0.0722) / D65_Yn
	Z := (r*0.0193 + g*0.1192 + b*0.9505) / D65_Zn

	f := func(v float64) float64 {
		if v > 0.008856 {
			return math.Cbrt(v)
		}
		return (7.787 * v) + 16/116.0
	}

	fX := f(X)
	fY := f(Y)
	fZ := f(Z)

	L := (116 * fY) - 16
	aComp := 500 * (fX - fY)
	bComp := 200 * (fY - fZ)
	a_val := math.Max(0, math.Min(1, alpha))

	L = math.Round(L*10) / 10         // ToFixed(1)
	aComp = math.Round(aComp*10) / 10 // ToFixed(1)
	bComp = math.Round(bComp*10) / 10 // ToFixed(1)

	converted := fmt.Sprintf("lab(%.1f %.1f %.1f)", L, aComp, bComp)
	if a_val != 1 {
		converted = fmt.Sprintf("lab(%.1f %.1f %.1f / %.3f)", L, aComp, bComp, a_val)
	}

	return ColorResult{L: L, A: aComp, BComp: bComp, Alpha: a_val, Converted: converted}
}

// lchToRgb converts LCH color values to RGB.
// L: Lightness (0-100), C: Chroma (0-100+), H: Hue (0-360), alpha: Opacity (0-1).
func color_LchToRgb(L, C, H, alpha float64) ColorResult {
	hRad := H * math.Pi / 180
	_a := C * math.Cos(hRad)
	_b := C * math.Sin(hRad)
	rgb := color_LabToRgb(L, _a, _b, alpha)
	a_val := math.Max(0, math.Min(1, alpha))

	converted := fmt.Sprintf("rgb(%.0f, %.0f, %.0f)", rgb.R, rgb.G, rgb.B)
	if a_val != 1 {
		converted = fmt.Sprintf("rgba(%.0f, %.0f, %.0f, %.3f)", rgb.R, rgb.G, rgb.B, a_val)
	}

	return ColorResult{R: rgb.R, G: rgb.G, B: rgb.B, Alpha: a_val, Converted: converted}
}

// rgbToLch converts RGB color values to LCH.
// r, g, b: Red, Green, Blue components (0-255), alpha: Opacity (0-1).
func color_RgbToLch(r, g, b, alpha float64) ColorResult {
	lab := color_RgbToLab(r, g, b, alpha)
	L := lab.L
	_a := lab.A
	bComp := lab.BComp

	C := math.Sqrt(_a*_a + bComp*bComp)
	H := math.Mod(math.Atan2(bComp, _a)*180/math.Pi+360, 360)
	if C < 1e-6 {
		H = 0
	}
	a_val := math.Max(0, math.Min(1, alpha))

	L = math.Round(L*10) / 10 // ToFixed(1)
	C = math.Round(C*10) / 10 // ToFixed(1)
	H = math.Round(H*10) / 10 // ToFixed(1)

	converted := fmt.Sprintf("lch(%.1f %.1f %.1f)", L, C, H)
	if a_val != 1 {
		converted = fmt.Sprintf("lch(%.1f %.1f %.1f / %.3f)", L, C, H, a_val)
	}

	return ColorResult{L: L, C: C, HComp: H, Alpha: a_val, Converted: converted}
}

// hwbToRgb converts HWB color values to RGB.
// h: Hue (0-360), w: Whiteness (0-100), bl: Blackness (0-100), alpha: Opacity (0-1).
func color_HwbToRgb(h, w, bl, alpha float64) ColorResult {
	h = math.Mod(h, 360)
	w /= 100
	bl /= 100

	baseRgb := color_HslToRgb(h, 100, 50, 1) // HSL to RGB for base hue color

	rFinal := baseRgb.R*(1-w-bl) + w*255
	gFinal := baseRgb.G*(1-w-bl) + w*255
	bFinal := baseRgb.B*(1-w-bl) + w*255

	a_val := math.Max(0, math.Min(1, alpha))

	r := math.Max(0, math.Min(255, math.Round(rFinal)))
	g := math.Max(0, math.Min(255, math.Round(gFinal)))
	b := math.Max(0, math.Min(255, math.Round(bFinal)))

	converted := fmt.Sprintf("rgb(%.0f, %.0f, %.0f)", r, g, b)
	if a_val != 1 {
		converted = fmt.Sprintf("rgba(%.0f, %.0f, %.0f, %.3f)", r, g, b, a_val)
	}

	return ColorResult{R: r, G: g, B: b, Alpha: a_val, Converted: converted}
}

// rgbToHwb converts RGB color values to HWB.
// r, g, b: Red, Green, Blue components (0-255), alpha: Opacity (0-1).
func color_RgbToHwb(r, g, b, alpha float64) ColorResult {
	r /= 255
	g /= 255
	b /= 255

	max := math.Max(r, math.Max(g, b))
	min := math.Min(r, math.Min(g, b))

	var h float64
	if max == min {
		h = 0
	} else if max == r {
		h = math.Mod((60*((g-b)/(max-min)) + 360), 360)
	} else if max == g {
		h = math.Mod((60*((b-r)/(max-min)) + 120), 360)
	} else if max == b {
		h = math.Mod((60*((r-g)/(max-min)) + 240), 360)
	}

	w := min * 100
	bl := (1 - max) * 100
	a_val := math.Max(0, math.Min(1, alpha))

	h = math.Round(h*10) / 10   // ToFixed(1)
	w = math.Round(w*10) / 10   // ToFixed(1)
	bl = math.Round(bl*10) / 10 // ToFixed(1)

	converted := fmt.Sprintf("hwb(%.1f %.1f%% %.1f%%)", h, w, bl)
	if a_val != 1 {
		converted = fmt.Sprintf("hwb(%.1f %.1f%% %.1f%% / %.3f)", h, w, bl, a_val)
	}

	return ColorResult{H: h, W: w, Bl: bl, Alpha: a_val, Converted: converted}
}

// rgbToHex converts RGB color values to a hexadecimal string.
// r, g, b: Red, Green, Blue components (0-255), alpha: Opacity (0-1).
func color_rgbToHex(r, g, b, alpha float64) string {
	toHex := func(c float64) string {
		hex := strconv.FormatInt(int64(math.Round(c)), 16)
		if len(hex) == 1 {
			return "0" + hex
		}
		return hex
	}

	aVal := math.Max(0, math.Min(1, alpha))
	alphaHex := math.Round(aVal * 255)

	hexString := fmt.Sprintf("#%s%s%s", toHex(r), toHex(g), toHex(b))
	if alphaHex != 255 {
		hexString += toHex(alphaHex)
	}
	return hexString
}

// hexToRgb converts a hexadecimal color string to RGB.
// hex: Hexadecimal color string (e.g., "#RRGGBB", "#RRGGBBAA", "#RGB", "#RGBA").
func color_HexToRgb(hex string) (ColorResult, error) {
	cleanHex := strings.TrimPrefix(hex, "#")
	var r, g, b int64
	var alpha float64 = 1.0

	switch len(cleanHex) {
	case 8: // RRGGBBAA
		r, _ = strconv.ParseInt(cleanHex[0:2], 16, 64)
		g, _ = strconv.ParseInt(cleanHex[2:4], 16, 64)
		b, _ = strconv.ParseInt(cleanHex[4:6], 16, 64)
		alphaVal, _ := strconv.ParseInt(cleanHex[6:8], 16, 64)
		alpha = float64(alphaVal) / 255.0
	case 6: // RRGGBB
		r, _ = strconv.ParseInt(cleanHex[0:2], 16, 64)
		g, _ = strconv.ParseInt(cleanHex[2:4], 16, 64)
		b, _ = strconv.ParseInt(cleanHex[4:6], 16, 64)
	case 4: // RGBA
		r, _ = strconv.ParseInt(strings.Repeat(string(cleanHex[0]), 2), 16, 64)
		g, _ = strconv.ParseInt(strings.Repeat(string(cleanHex[1]), 2), 16, 64)
		b, _ = strconv.ParseInt(strings.Repeat(string(cleanHex[2]), 2), 16, 64)
		alphaVal, _ := strconv.ParseInt(strings.Repeat(string(cleanHex[3]), 2), 16, 64)
		alpha = float64(alphaVal) / 255.0
	case 3: // RGB
		r, _ = strconv.ParseInt(strings.Repeat(string(cleanHex[0]), 2), 16, 64)
		g, _ = strconv.ParseInt(strings.Repeat(string(cleanHex[1]), 2), 16, 64)
		b, _ = strconv.ParseInt(strings.Repeat(string(cleanHex[2]), 2), 16, 64)
	default:
		return ColorResult{}, fmt.Errorf("invalid hex color format: %s", hex)
	}

	alpha = math.Round(alpha*1000) / 1000 // ToFixed(3)

	converted := fmt.Sprintf("rgb(%.0f, %.0f, %.0f)", float64(r), float64(g), float64(b))
	if alpha != 1 {
		converted = fmt.Sprintf("rgba(%.0f, %.0f, %.0f, %.3f)", float64(r), float64(g), float64(b), alpha)
	}

	return ColorResult{R: float64(r), G: float64(g), B: float64(b), Alpha: alpha, Converted: converted}, nil
}

// oklabToRgb converts Oklab color values to RGB.
// L: Lightness (0-1), a, b: Chromaticity components (-0.5 to 0.5 approx), alpha: Opacity (0-1).
func color_OklabToRgb(L, a, b, alpha float64) ColorResult {
	lPrime := L + a*0.3963377774 + b*0.2158037573
	mPrime := L - a*0.1055613458 - b*0.0638541728
	sPrime := L - a*0.0894841775 - b*1.2914855480

	lLinear := lPrime * lPrime * lPrime
	mLinear := mPrime * mPrime * mPrime
	sLinear := sPrime * sPrime * sPrime

	rLinear := +4.0767416621*lLinear - 3.3077115913*mLinear + 0.2309699292*sLinear
	gLinear := -1.2684380046*lLinear + 2.6097574011*mLinear - 0.3413193965*sLinear
	bLinear := -0.0041960863*lLinear - 0.7034186147*mLinear + 1.707614701*sLinear

	srgbOetf := func(val float64) float64 {
		val = math.Max(0, math.Min(1, val))
		if val <= 0.0031308 {
			return 12.92 * val
		}
		return 1.055*math.Pow(val, 1/2.4) - 0.055
	}

	r := math.Max(0, math.Min(255, math.Round(srgbOetf(rLinear)*255)))
	g := math.Max(0, math.Min(255, math.Round(srgbOetf(gLinear)*255)))
	b_val := math.Max(0, math.Min(255, math.Round(srgbOetf(bLinear)*255)))
	a_val := math.Max(0, math.Min(1, alpha))

	converted := fmt.Sprintf("rgb(%.0f, %.0f, %.0f)", r, g, b_val)
	if a_val != 1 {
		converted = fmt.Sprintf("rgba(%.0f, %.0f, %.0f, %.3f)", r, g, b_val, a_val)
	}

	return ColorResult{R: r, G: g, B: b_val, Alpha: a_val, Converted: converted}
}

// rgbToOklab converts RGB color values to Oklab.
// r, g, b: Red, Green, Blue components (0-255), alpha: Opacity (0-1).
func color_RgbToOklab(r, g, b, alpha float64) ColorResult {
	srgbInverseOetf := func(val float64) float64 {
		val /= 255
		if val <= 0.04045 {
			return val / 12.92
		}
		return math.Pow((val+0.055)/1.055, 2.4)
	}

	rLinear := srgbInverseOetf(r)
	gLinear := srgbInverseOetf(g)
	bLinear := srgbInverseOetf(b)

	l := 0.4122214708*rLinear + 0.5363325363*gLinear + 0.0514459929*bLinear
	m := 0.2119034982*rLinear + 0.6806995451*gLinear + 0.1073969566*bLinear
	s := 0.0883024619*rLinear + 0.2817188376*gLinear + 0.6299787005*bLinear

	l_val := math.Cbrt(l)
	m_val := math.Cbrt(m)
	s_val := math.Cbrt(s)

	L := 0.2104542553*l_val + 0.7936177850*m_val - 0.0040720468*s_val
	a_val := 1.9779984951*l_val - 2.4285922050*m_val + 0.4505937099*s_val
	b_val := 0.0259040371*l_val + 0.7827717662*m_val - 0.8086757660*s_val

	alpha_val := math.Max(0, math.Min(1, alpha))

	L = math.Round(L*1000000) / 1000000         // ToFixed(6)
	a_val = math.Round(a_val*1000000) / 1000000 // ToFixed(6)
	b_val = math.Round(b_val*1000000) / 1000000 // ToFixed(6)

	converted := fmt.Sprintf("oklab(%.6f %.6f %.6f)", L, a_val, b_val)
	if alpha_val != 1 {
		converted = fmt.Sprintf("oklab(%.6f %.6f %.6f / %.3f)", L, a_val, b_val, alpha_val)
	}

	return ColorResult{L: L, A: a_val, BComp: b_val, Alpha: alpha_val, Converted: converted}
}

// oklchToRgb converts Oklch color values to RGB.
// L: Lightness (0-1), C: Chroma (0-0.5 approx), H: Hue (0-360), alpha: Opacity (0-1).
func color_OklchToRgb(L, C, H, alpha float64) ColorResult {
	hRad := H * math.Pi / 180
	_a := C * math.Cos(hRad)
	_b := C * math.Sin(hRad)
	rgb := color_OklabToRgb(L, _a, _b, alpha)
	a_val := math.Max(0, math.Min(1, alpha))

	converted := fmt.Sprintf("rgb(%.0f, %.0f, %.0f)", rgb.R, rgb.G, rgb.B)
	if a_val != 1 {
		converted = fmt.Sprintf("rgba(%.0f, %.0f, %.0f, %.3f)", rgb.R, rgb.G, rgb.B, a_val)
	}

	return ColorResult{R: rgb.R, G: rgb.G, B: rgb.B, Alpha: a_val, Converted: converted}
}

// rgbToOklch converts RGB color values to Oklch.
// r, g, b: Red, Green, Blue components (0-255), alpha: Opacity (0-1).
func color_RgbToOklch(r, g, b, alpha float64) ColorResult {
	oklab := color_RgbToOklab(r, g, b, alpha)
	L := oklab.L
	_a := oklab.A
	_b := oklab.BComp

	C := math.Sqrt(_a*_a + _b*_b)
	H := math.Mod(math.Atan2(_b, _a)*180/math.Pi+360, 360)
	if C < 1e-6 {
		H = 0
	}
	a_val := math.Max(0, math.Min(1, alpha))

	L = math.Round(L*1000) / 1000 // ToFixed(3)
	C = math.Round(C*1000) / 1000 // ToFixed(3)
	H = math.Round(H*10) / 10     // ToFixed(1)

	converted := fmt.Sprintf("oklch(%.3f %.3f %.1f)", L, C, H)
	if a_val != 1 {
		converted = fmt.Sprintf("oklch(%.3f %.3f %.1f / %.3f)", L, C, H, a_val)
	}

	return ColorResult{L: L, C: C, HComp: H, Alpha: a_val, Converted: converted}
}

type t_color_RGB_From = struct {
	Lch   func(L, C, H, alpha float64) ColorResult
	Lab   func(L, a, b, alpha float64) ColorResult
	Hwb   func(h, w, bl, alpha float64) ColorResult
	Hsl   func(h, s, l, alpha float64) ColorResult
	Oklch func(L, C, H, alpha float64) ColorResult
	Oklab func(L, a, b, alpha float64) ColorResult
}

type t_color_RGB_To = struct {
	Lch   func(r, g, b, alpha float64) ColorResult
	Lab   func(r, g, b, alpha float64) ColorResult
	Hwb   func(r, g, b, alpha float64) ColorResult
	Hsl   func(r, g, b, alpha float64) ColorResult
	Oklch func(r, g, b, alpha float64) ColorResult
	Oklab func(r, g, b, alpha float64) ColorResult
}

var ColorRGB = struct {
	From t_color_RGB_From
	To t_color_RGB_To
	LoadHex func(hex string) (ColorResult, error)
}{
	From: t_color_RGB_From{
		Lch:   color_LchToRgb,
		Lab:   color_LabToRgb,
		Hwb:   color_HwbToRgb,
		Hsl:   color_HslToRgb,
		Oklch: color_OklchToRgb,
		Oklab: color_OklabToRgb,
	},
	To: t_color_RGB_To{
		Lch:   color_RgbToLch,
		Lab:   color_RgbToLab,
		Hwb:   color_RgbToHwb,
		Hsl:   color_RgbToHsl,
		Oklch: color_RgbToOklch,
		Oklab: color_RgbToOklab,
	},
	LoadHex: color_HexToRgb,
}
