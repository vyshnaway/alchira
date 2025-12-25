package handle

var Sketchpad_State_Mem = map[string]any{}

func Sketchpad_State_Set(key string, val any) (response any) {
	Sketchpad_State_Mem[key] = val
	return map[string]any{"key": key, "value": val}
}

func Sketchpad_State_Init(key string, val any) (response any) {
	if _, e := Sketchpad_State_Mem[key]; !e {
		Sketchpad_State_Mem[key] = val
	}
	return map[string]any{"key": key, "value": Sketchpad_State_Mem[key]}
}
