package style_test

import (
	_style_ "main/style"
	"main/utils"
	// _cache_ "main/cache"
	// _Cursor_ "main/class/Cursor"
	"main/shell"
	// _utils_ "main/utils"
	// _slices_ "slices"
	// _strings_ "strings"
	"testing"
)

func TestBlock(t *testing.T){
	content_spread := `
@hover $scale-125;
klo: op;

m-auto{
    k: l;
}

~ glass$--container /test/glass$container /test/$---hU;
= p-24 m-0 border-0 radius-16 kf$fade-in;

--box-shadow: #77777777;
.m-auto{
    box-shadow: 0px 6px 12px -6px #77777777;
}

&::before{
    = position-absolute inset-0 layer-neg-1 radius-16 tx$content-clear;
    box-shadow: inset 0 0 15px -5px #00000044;
}

@after{
    = position-absolute inset-0 layer-neg-2 radius-16 tx$content-clear;
    filter: url(#glass-distortion);
}
	`
	content_condensed := `@hover $scale-125;klo:op;m-auto{k:l;}~ glass$--container /test/glass$container /test/$---hU;= p-24 m-0 border-0 radius-16 kf$fade-in;.m-auto{box-shadow:0px 6px 12px -6px #77777777;}--box-shadow:#77777777;&::before{= position-absolute inset-0 layer-neg-1 radius-16 tx$content-clear;box-shadow:inset 0 0 15px -5px #00000044;}@after{= position-absolute inset-0 layer-neg-2 radius-16 tx$content-clear;filter:url(#glass-distortion);}`

	res_spread := _style_.Block_Parse(content_spread)
	res_condensed := _style_.Block_Parse(content_condensed)
	
	shell.Render.Raw("Json 1")
	shell.Render.Raw(res_spread)
	shell.Render.Raw("---")
	shell.Render.Raw("Json 2")
	shell.Render.Raw(res_condensed)
	
	shell.Render.Raw(utils.Code_JsonBuild(res_spread, "") == utils.Code_JsonBuild(res_condensed, ""))
}
