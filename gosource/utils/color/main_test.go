package utils

import (
	"fmt"
	"testing"
)

func Test(t *testing.T) {
	converter := New_SwitchRGB()

	fmt.Println("--- HSL to RGB ---")
	hslResult := converter.From.Hsl(0, 100, 50, 1) // Red
	fmt.Printf("HSL(0, 100, 50) -> RGB: R:%.0f, G:%.0f, B:%.0f, Alpha:%.1f, Converted: %s\n",
		hslResult.R, hslResult.G, hslResult.B, hslResult.Alpha, hslResult.Converted)
	hslResultAlpha := converter.From.Hsl(120, 50, 50, 0.5) // Green with alpha
	fmt.Printf("HSL(120, 50, 50, 0.5) -> RGB: R:%.0f, G:%.0f, B:%.0f, Alpha:%.1f, Converted: %s\n",
		hslResultAlpha.R, hslResultAlpha.G, hslResultAlpha.B, hslResultAlpha.Alpha, hslResultAlpha.Converted)
	fmt.Println()

	fmt.Println("--- RGB to HSL ---")
	rgbToHslResult := converter.To.Hsl(255, 0, 0, 1) // Red
	fmt.Printf("RGB(255, 0, 0) -> HSL: H:%.0f, S:%.0f, L:%.0f, Alpha:%.1f, Converted: %s\n",
		rgbToHslResult.H, rgbToHslResult.S, rgbToHslResult.L, rgbToHslResult.Alpha, rgbToHslResult.Converted)
	rgbToHslResultAlpha := converter.To.Hsl(128, 191, 128, 0.7) // Greenish with alpha
	fmt.Printf("RGB(128, 191, 128, 0.7) -> HSL: H:%.0f, S:%.0f, L:%.0f, Alpha:%.1f, Converted: %s\n",
		rgbToHslResultAlpha.H, rgbToHslResultAlpha.S, rgbToHslResultAlpha.L, rgbToHslResultAlpha.Alpha, rgbToHslResultAlpha.Converted)
	fmt.Println()

	fmt.Println("--- LAB to RGB ---")
	labResult := converter.From.Lab(50, 20, 30, 1)
	fmt.Printf("LAB(50, 20, 30) -> RGB: R:%.0f, G:%.0f, B:%.0f, Alpha:%.1f, Converted: %s\n",
		labResult.R, labResult.G, labResult.B, labResult.Alpha, labResult.Converted)
	fmt.Println()

	fmt.Println("--- RGB to LAB ---")
	rgbToLabResult := converter.To.Lab(128, 0, 255, 1) // Purple
	fmt.Printf("RGB(128, 0, 255) -> LAB: L:%.1f, a:%.1f, b:%.1f, Alpha:%.1f, Converted: %s\n",
		rgbToLabResult.L, rgbToLabResult.A, rgbToLabResult.BComp, rgbToLabResult.Alpha, rgbToLabResult.Converted)
	fmt.Println()

	fmt.Println("--- LCH to RGB ---")
	lchResult := converter.From.Lch(50, 50, 90, 1) // A greenish-yellow LCH
	fmt.Printf("LCH(50, 50, 90) -> RGB: R:%.0f, G:%.0f, B:%.0f, Alpha:%.1f, Converted: %s\n",
		lchResult.R, lchResult.G, lchResult.B, lchResult.Alpha, lchResult.Converted)
	fmt.Println()

	fmt.Println("--- RGB to LCH ---")
	rgbToLchResult := converter.To.Lch(0, 128, 255, 1) // Blue
	fmt.Printf("RGB(0, 128, 255) -> LCH: L:%.1f, C:%.1f, H:%.1f, Alpha:%.1f, Converted: %s\n",
		rgbToLchResult.L, rgbToLchResult.C, rgbToLchResult.HComp, rgbToLchResult.Alpha, rgbToLchResult.Converted)
	fmt.Println()

	fmt.Println("--- HWB to RGB ---")
	hwbResult := converter.From.Hwb(0, 0, 0, 1) // Red
	fmt.Printf("HWB(0, 0, 0) -> RGB: R:%.0f, G:%.0f, B:%.0f, Alpha:%.1f, Converted: %s\n",
		hwbResult.R, hwbResult.G, hwbResult.B, hwbResult.Alpha, hwbResult.Converted)
	hwbResult2 := converter.From.Hwb(120, 50, 20, 1) // Greenish, some white, some black
	fmt.Printf("HWB(120, 50, 20) -> RGB: R:%.0f, G:%.0f, B:%.0f, Alpha:%.1f, Converted: %s\n",
		hwbResult2.R, hwbResult2.G, hwbResult2.B, hwbResult2.Alpha, hwbResult2.Converted)
	fmt.Println()

	fmt.Println("--- RGB to HWB ---")
	rgbToHwbResult := converter.To.Hwb(255, 128, 0, 1) // Orange
	fmt.Printf("RGB(255, 128, 0) -> HWB: H:%.1f, W:%.1f, B:%.1f, Alpha:%.1f, Converted: %s\n",
		rgbToHwbResult.H, rgbToHwbResult.W, rgbToHwbResult.Bl, rgbToHwbResult.Alpha, rgbToHwbResult.Converted)
	fmt.Println()

	fmt.Println("--- RGB to Hex ---")
	hexResult := rgbToHex(255, 0, 0, 1)
	fmt.Printf("RGB(255, 0, 0) -> Hex: %s\n", hexResult)
	hexResultAlpha := rgbToHex(255, 0, 0, 0.5)
	fmt.Printf("RGB(255, 0, 0, 0.5) -> Hex: %s\n", hexResultAlpha)
	fmt.Println()

	fmt.Println("--- Hex to RGB ---")
	hexToRgbResult, err := hexToRgb("#37ff00ff")
	if err != nil {
		fmt.Printf("Error: %v\n", err)
	} else {
		fmt.Printf("Hex(#FF0000) -> RGB: R:%.0f, G:%.0f, B:%.0f, Alpha:%.1f, Converted: %s\n",
			hexToRgbResult.R, hexToRgbResult.G, hexToRgbResult.B, hexToRgbResult.Alpha, hexToRgbResult.Converted)
	}
	hexToRgbResultAlpha, err := hexToRgb("#FF000080")
	if err != nil {
		fmt.Printf("Error: %v\n", err)
	} else {
		fmt.Printf("Hex(#FF000080) -> RGB: R:%.0f, G:%.0f, B:%.0f, Alpha:%.3f, Converted: %s\n",
			hexToRgbResultAlpha.R, hexToRgbResultAlpha.G, hexToRgbResultAlpha.B, hexToRgbResultAlpha.Alpha, hexToRgbResultAlpha.Converted)
	}
	hexToRgbResultShort, err := hexToRgb("#F00")
	if err != nil {
		fmt.Printf("Error: %v\n", err)
	} else {
		fmt.Printf("Hex(#F00) -> RGB: R:%.0f, G:%.0f, B:%.0f, Alpha:%.1f, Converted: %s\n",
			hexToRgbResultShort.R, hexToRgbResultShort.G, hexToRgbResultShort.B, hexToRgbResultShort.Alpha, hexToRgbResultShort.Converted)
	}
	hexToRgbResultShortAlpha, err := hexToRgb("#F008")
	if err != nil {
		fmt.Printf("Error: %v\n", err)
	} else {
		fmt.Printf("Hex(#F008) -> RGB: R:%.0f, G:%.0f, B:%.0f, Alpha:%.3f, Converted: %s\n",
			hexToRgbResultShortAlpha.R, hexToRgbResultShortAlpha.G, hexToRgbResultShortAlpha.B, hexToRgbResultShortAlpha.Alpha, hexToRgbResultShortAlpha.Converted)
	}
	fmt.Println()

	fmt.Println("--- OKLAB to RGB ---")
	oklabResult := converter.From.Oklab(0.5, 0.1, 0.05, 1) // Example Oklab values
	fmt.Printf("OKLAB(0.5, 0.1, 0.05) -> RGB: R:%.0f, G:%.0f, B:%.0f, Alpha:%.1f, Converted: %s\n",
		oklabResult.R, oklabResult.G, oklabResult.B, oklabResult.Alpha, oklabResult.Converted)
	fmt.Println()

	fmt.Println("--- RGB to OKLAB ---")
	rgbToOklabResult := converter.To.Oklab(255, 128, 0, 1) // Orange
	fmt.Printf("RGB(255, 128, 0) -> OKLAB: L:%.6f, a:%.6f, b:%.6f, Alpha:%.1f, Converted: %s\n",
		rgbToOklabResult.L, rgbToOklabResult.A, rgbToOklabResult.BComp, rgbToOklabResult.Alpha, rgbToOklabResult.Converted)
	fmt.Println()

	fmt.Println("--- OKLCH to RGB ---")
	oklchResult := converter.From.Oklch(0.7, 0.15, 150, 1) // Example Oklch values
	fmt.Printf("OKLCH(0.7, 0.15, 150) -> RGB: R:%.0f, G:%.0f, B:%.0f, Alpha:%.1f, Converted: %s\n",
		oklchResult.R, oklchResult.G, oklchResult.B, oklchResult.Alpha, oklchResult.Converted)
	fmt.Println()

	fmt.Println("--- RGB to OKLCH ---")
	rgbToOklchResult := converter.To.Oklch(0, 255, 0, 1) // Green
	fmt.Printf("RGB(0, 255, 0) -> OKLCH: L:%.3f, C:%.3f, H:%.1f, Alpha:%.1f, Converted: %s\n",
		rgbToOklchResult.L, rgbToOklchResult.C, rgbToOklchResult.HComp, rgbToOklchResult.Alpha, rgbToOklchResult.Converted)
	fmt.Println()
}
