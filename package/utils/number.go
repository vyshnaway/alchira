package utils

import (
	_math "math"
)

// Rounds of number to given limit of decimal places
func Number_TrimDecimals(f float64, limit int) float64 {
	limiter := _math.Pow10(limit)
	return _math.Round(f*limiter) / limiter
}

// Check if a float64 is an integer
func Number_FloatIsInt(val float64) (Ok bool, Integer int, Decimal float64) {
	integer := int(val)
	decimal := _math.Mod(val, 1.0)
	ok := decimal == 0
	return ok, integer, decimal
}

// Returns absolue value of an integer
func Number_AbsInt(x int) int {
	if x < 0 {
		return -x
	}
	return x
}
