package utils

import (
	_math_ "math"
)

func Number_TrimDecimals(f float64, limit int) float64 {
	limiter := _math_.Pow10(limit)
	return _math_.Round(f*limiter) / limiter
}

type number_IsInteger_return struct {
	Integer  int
	Reminder float64
	Status   bool
}

func Number_FloatIsInteger(val float64) number_IsInteger_return {
	Integer := int(val)
	Reminder := _math_.Mod(val, 1.0)
	Status := Reminder == 0
	return number_IsInteger_return{
		Integer,
		Reminder,
		Status,
	}
}
