package handle

var Sandbox_State_Mem = map[string]any{}

func Sandbox_State_Set(key string, val any) (response any) {
	Sandbox_State_Mem[key] = val
	return map[string]any{"key": key, "value": val}
}

func Sandbox_State_Init(key string, val any) (response any) {
	if _, e := Sandbox_State_Mem[key]; !e {
		Sandbox_State_Mem[key] = val
	}
	return map[string]any{"key": key, "value": Sandbox_State_Mem[key]}
}
