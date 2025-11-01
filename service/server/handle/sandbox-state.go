package handle

var Sandbox_State_Memory = map[string]any{}

func Sandbox_State(keyRef, v string) (response any) {

	var newVal any
	if val, exist := Sandbox_State_Memory[keyRef]; exist {
		newVal = val
	} else {
		Sandbox_State_Memory[keyRef] = newVal
	}

	return map[string]any{"key": keyRef, "value": newVal}
}
