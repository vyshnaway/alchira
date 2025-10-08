package block

import (
	"fmt"
	"strings"
)

func (This *Type) print() []string {
	const tab = "  "
	result := []string{}

	This.PropRange(func(k, v string) {
		result = append(result, k+": "+v)
	})
	This.BlockRange(func(k string, v Type) {
		result = append(result, k+" {")
		for _, vv := range v.print() {
			result = append(result, tab+vv)
		}
		result = append(result, "}")
	})
	return result
}

func (This *Type) Print() *Type {
	fmt.Println("\n---\n" + strings.Join(This.print(), "\n") + "\n---\n")
	return This
}

func (This *Type) Skeleton() any {
	result := map[string]any{}

	This.PropRange(func(k string, v string) {
		if strings.HasPrefix(k, "--") {
			result[k] = v
		}
	})

	This.BlockRange(func(k string, v Type) {
		result[k] = v.Skeleton()
	})

	return result
}
