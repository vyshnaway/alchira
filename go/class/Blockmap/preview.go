package blockmap

import (
	"fmt"
	"strings"
)

func (This *Class) print() []string {
	const tab = "  "
	result := []string{}
	for k, v := range This.PropRange() {
		result = append(result, k+" : "+v)
	}
	for k, v := range This.BlockRange() {
		result = append(result, k+" {")
		for _, vv := range v.print() {
			result = append(result, tab+vv)
		}
		result = append(result, "}")
	}
	return result
}

func (This *Class) Print() {
	fmt.Println("\n---\n" + strings.Join(This.print(), "\n") + "\n---\n")
}

func (This *Class) Skeleton() any {
	result := map[string]any{}
	
	for k, v := range This.PropRange() {
		if strings.HasPrefix(k, "--") {
			result[k] = v
		}
	}

	for k, v := range This.BlockRange() {
		result[k] = v.Skeleton()
	}
	return result
}
