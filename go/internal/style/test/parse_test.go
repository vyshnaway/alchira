package test

import (
	console "main/package/console"
	_style "main/internal/style"
	// _util "main/package/utils"
	_testing "testing"
)

func Test_Block(t *_testing.T) {
	content_spread := `
@hover $scale-125;
klo: op;


~ glass$--container /test/glass$container /test/$---hU;
= p-24 m-0 border-0 radius-16 kf$fade-in;

--box-shadow: #77777777;
:m-auto{
    k: l;
}
	`

// .m-auto{
//     box-shadow: 0px 6px 12px -6px #77777777;
// }

// &::before{
//     = position-absolute inset-0 layer-neg-1 radius-16 tx$content-clear;
//     box-shadow: inset 0 0 15px -5px #00000044;
// }

// @after{
//     = position-absolute inset-0 layer-neg-2 radius-16 tx$content-clear;
//     filter: url(#glass-distortion);
// }
	// content_condensed := `@hover $scale-125;klo:op;m-auto{k:l;}~ glass$--container /test/glass$container /test/$---hU;= p-24 m-0 border-0 radius-16 kf$fade-in;.m-auto{box-shadow:0px 6px 12px -6px #77777777;}--box-shadow:#77777777;&::before{= position-absolute inset-0 layer-neg-1 radius-16 tx$content-clear;box-shadow:inset 0 0 15px -5px #00000044;}@after{= position-absolute inset-0 layer-neg-2 radius-16 tx$content-clear;filter:url(#glass-distortion);}`

	res_spread := _style.Parse_Filter(content_spread)
	// res_condensed := _css.ParsePartial(content_condensed)

	console.Render.Raw(res_spread)
	console.Render.Raw(res_spread.Properties.Keys())
	console.Render.Raw(res_spread.Blocks.Keys())
	console.Render.Raw(res_spread.Variables.Keys())
	// console.Render.Raw(res_condensed)

	// console.Render.Raw(_util.Code_JsonBuild(res_spread, "") == _util.Code_JsonBuild(res_condensed, ""))
}
