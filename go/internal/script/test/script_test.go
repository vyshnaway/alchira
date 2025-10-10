package script_test

import (
	_action "main/internal/action"
	_script "main/internal/script"
	S "main/package/console"
	_reader "main/package/reader"
	_testing "testing"
)

func Test_File(t *_testing.T) {
	data := _action.Store(_action.Store_FileGroup_Target, "file/path", `
# -webapps@1.0.1 : Available SymClasses

> /test/glass$container


# Declarations

[<summ}on |<summon glass$$$container="~ $---hU;padding: 6rem;margin: 0;border-width: 0;border-radius: 4rem;display: flex;align-items: center;justify-content: center;position: fixed;text-decoration: none;cursor: pointer;background: none;font-size: var(---font-size-h1);isolation: isolate;transition: all 300ms ease;box-shadow: 0px 6px 12px -6px #77777777;&:hover{transform: scale(1.25);}&::after{position: absolute;top: 0;right: 0;bottom: 0;left: 0;z-index: -2;border-radius: 4rem;content: '';filter: url(#glass-distortion);}&::before{position: absolute;top: 0;right: 0;bottom: 0;left: 0;z-index: -1;border-radius: 4rem;content: '';box-shadow: inset 0 0 15px -5px #00000044;}&.glass-type{&[data-glass-type='frosted']{&::after{backdrop-filter: blur(1px);}&::before{background-color: rgba(255, 255, 255, 0.6);}}&[data-glass-type='liquid']{&::after{backdrop-filter: blur(.5px);}&::before{background-color: rgba(255, 255, 255, 0.25);}}}" {@container (min-width:384px)}&="display: flex;" style=" background-image: linear-gradient(#ffffff 0.9px, transparent 0.9px), linear-gradient(to right, #ffffff 0.9px, #cacaca 1px); background-size: 18px 18px; " data-glass-type="frosted" class="glass-type"> Test </summon><ghj
-$jk="op">.] 

|<staple -$---hU> <svg xmlns="http://www.w3.org/2000/svg" style="display: none;"> <defs> <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%"> <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" /> <feGaussianBlur in="noise" stdDeviation="2" result="blurred" /> <feDisplacementMap in="SourceGraphic" in2="blurred" scale="77" xChannelSelector="R" yChannelSelector="G" /> </filter> </defs> </svg> </staple> 
		`,
		"target",
		"source",
		"lbl",
	)
	res := _script.Rider(&data, []string{"class"}, _script.E_Action_Read)
	S.Render.Raw(res)
	S.Post(res.Scribed)
}

func Test_Tag(t *_testing.T) {
	content := `<ghj
-$jk="op"><summon [<k glass$$$container="~ $---hU;padding: 6rem;margin: 0;border-width: 0;border-radius: 4rem;display: flex;align-items: center;justify-content: center;position: fixed;text-decoration: none;cursor: pointer;background: none;font-size: var(---font-size-h1);isolation: isolate;transition: all 300ms ease;box-shadow: 0px 6px 12px -6px #77777777;&:hover{transform: scale(1.25);}&::after{position: absolute;top: 0;right: 0;bottom: 0;left: 0;z-index: -2;border-radius: 4rem;content: '';filter: url(#glass-distortion);}&::before{position: absolute;top: 0;right: 0;bottom: 0;left: 0;z-index: -1;border-radius: 4rem;content: '';box-shadow: inset 0 0 15px -5px #00000044;}&.glass-type{&[data-glass-type='frosted']{&::after{backdrop-filter: blur(1px);}&::before{background-color: rgba(255, 255, 255, 0.6);}}&[data-glass-type='liquid']{&::after{backdrop-filter: blur(.5px);}&::before{background-color: rgba(255, 255, 255, 0.25);}}}" {@container (min-width:384px)}&="display: flex;" style=" background-image: linear-gradient(#ffffff 0.9px, transparent 0.9px), linear-gradient(to right, #ffffff 0.9px, #cacaca 1px); background-size: 18px 18px; " data-glass-type="frosted" class="glass-type"> Test </summon>] </summon> 

<staple -$---hU> <svg xmlns="http://www.w3.org/2000/svg" style="display: none;"> <defs> <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%"> <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" /> <feGaussianBlur in="noise" stdDeviation="2" result="blurred" /> <feDisplacementMap in="SourceGraphic" in2="blurred" scale="77" xChannelSelector="R" yChannelSelector="G" /> </filter> </defs> </svg> </staple> 
		`
	data := _action.Store(_action.Store_FileGroup_Target,
		"file/path",
		content,
		"target",
		"source",
		"lbl",
	)

	cursor := _reader.New(content)
	res := _script.Tag_Scanner(&data, []string{"class"}, _script.E_Action_Read, &cursor)
	S.Render.Raw(res)
	S.Post(content[:cursor.Active.Marker])
}
