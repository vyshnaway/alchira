package style_test

import (
	_style_ "main/style"
	// _cache_ "main/cache"
	// _Cursor_ "main/class/Cursor"
	"main/shell"
	// _utils_ "main/utils"
	// _slices_ "slices"
	// _strings_ "strings"
	"testing"
)

func TestBlock(t *testing.T) {
	shell.Render.Raw(_style_.Block_Parse(`
	.m-auto { margin: auto; }
	.m-0 { margin: 0; }
	.m-1 { margin: 0.25rem; }
	.m-2 { margin: 0.5rem; }
	.m-3 { margin: 0.75rem; }
	.m-4 { margin: 1rem; }
	.m-5 { margin: 1.25rem; }
	.m-6 { margin: 1.5rem; }
	.m-8 { margin: 2rem; }
	.m-10 { margin: 2.5rem; }
	.m-12 { margin: 3rem; }
	.m-16 { margin: 4rem; }
	.m-20 { margin: 5rem; }
	.m-24 { margin: 6rem; }
	.m-32 { margin: 8rem;".m-32 { margin: 8rem; }" }
	`))
}