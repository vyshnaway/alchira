package test

import (
	_css "main/package/css"
	shell "main/package/shell"
	"main/package/utils"
	"testing"
)

func TestBlock(t *testing.T) {
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

	res_spread := _css.ParsePartial(content_spread)
	res_condensed := _css.ParsePartial(content_condensed)

	shell.Render.Raw("Json 1")
	shell.Render.Raw(res_spread)
	shell.Render.Raw("---")
	shell.Render.Raw("Json 2")
	shell.Render.Raw(res_condensed)

	shell.Render.Raw(utils.Code_JsonBuild(res_spread, "") == utils.Code_JsonBuild(res_condensed, ""))
}

func Test_Block2(t *testing.T) {
	content_spread := `~ $---hU;padding: 6rem;margin: 0;border-width: 0;border-radius: 4rem;display: flex;align-items: center;justify-content: center;position: fixed;text-decoration: none;cursor: pointer;background: none;font-size: var(---font-size-h1);isolation: isolate;transition: all 300ms ease;box-shadow: 0px 6px 12px -6px #77777777;&:hover{transform: scale(1.25);}&::after{position: absolute;top: 0;right: 0;bottom: 0;left: 0;z-index: -2;border-radius: 4rem;content: '';filter: url(#glass-distortion);}&::before{position: absolute;top: 0;right: 0;bottom: 0;left: 0;z-index: -1;border-radius: 4rem;content: '';box-shadow: inset 0 0 15px -5px #00000044;}&.glass-type{&[data-glass-type='frosted']{&::after{backdrop-filter: blur(1px);}&::before{background-color: rgba(255, 255, 255, 0.6);}}&[data-glass-type='liquid']{&::after{backdrop-filter: blur(.5px);}&::before{background-color: rgba(255, 255, 255, 0.25);}}}`

	res_spread := _css.ParsePartial(content_spread)

	shell.Render.Raw("Json 1")
	shell.Render.Raw(res_spread)

	// utils.Code_JsonBuild(res_spread, "")

}
