package script

import (
	"math"
	"strings"
)
type SplinePoint struct {
	X, Y float64
}

func GenerateEquidistantSpline(yCoords []float64, m int) []float64 {
	n := len(yCoords)
	if n < 2 {
		return yCoords
	}

	// 1. Setup system for Cubic Spline (Natural: second derivatives at ends = 0)
	// Between points i and i+1: S_i(x) = a_i + b_i(x-i) + c_i(x-i)^2 + d_i(x-i)^3
	a := yCoords
	c := make([]float64, n)
	l := make([]float64, n)
	mu := make([]float64, n)
	z := make([]float64, n)

	l[0] = 1.0
	for i := 1; i < n-1; i++ {
		alpha := 3.0 * (a[i+1] - 2*a[i] + a[i-1])
		l[i] = 4.0 - mu[i-1] // simplified since h=1
		mu[i] = 1.0 / l[i]
		z[i] = (alpha - z[i-1]) / l[i]
	}
	l[n-1] = 1.0

	b := make([]float64, n-1)
	d := make([]float64, n-1)
	
	// Back-substitution
	for j := n - 2; j >= 0; j-- {
		c[j] = z[j] - mu[j]*c[j+1]
		b[j] = (a[j+1] - a[j]) - (c[j+1]+2.0*c[j])/3.0
		d[j] = (c[j+1] - c[j]) / 3.0
	}

	// 2. Generate m samples from x=0 to x=n-1
	results := make([]float64, m)
	step := float64(n-1) / float64(m-1)

	for k := 0; k < m; k++ {
		x := float64(k) * step
		i := int(math.Floor(x))
		if i >= n-1 {
			i = n - 2
		}
		dx := x - float64(i)
		// Evaluate cubic polynomial
		results[k] = a[i] + b[i]*dx + c[i]*math.Pow(dx, 2) + d[i]*math.Pow(dx, 3)
	}

	return results
}

const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

func FloatToBase(val float64, base int, precision int) string {
	if base < 2 || base > len(charset) {
		return "Invalid Base"
	}

	// 1. Handle sign
	sign := ""
	if val < 0 {
		sign = "-"
		val = math.Abs(val)
	}

	// 2. Integer Part
	intPart := int64(math.Floor(val))
	fracPart := val - float64(intPart)

	var sb strings.Builder
	sb.WriteString(sign)

	// Base conversion for Integer Part
	if intPart == 0 {
		sb.WriteByte('0')
	} else {
		temp := ""
		for intPart > 0 {
			temp = string(charset[intPart%int64(base)]) + temp
			intPart /= int64(base)
		}
		sb.WriteString(temp)
	}

	// 3. Fractional Part
	if precision > 0 {
		sb.WriteByte('.')
		for i := 0; i < precision; i++ {
			fracPart *= float64(base)
			digit := int(math.Floor(fracPart))
			sb.WriteByte(charset[digit])
			fracPart -= float64(digit)
		}
	}

	return sb.String()
}