package test

import (
	"main/package/console"
	"main/package/css"
	"testing"
)

func Test_Blocksort(t *testing.T) {

	console.Render.Raw(css.Blocksort([]string{
		"@container (max-width:256px)",
		"@container (min-width:256px)",
		"@container (max-width:224px)",
		"@container (min-width:224px)",
		"@container (max-width:320px)",
		"@container (min-width:320px)",
	}))
}
