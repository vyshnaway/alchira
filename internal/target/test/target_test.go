package Target_test

import (
	_target "main/internal/target"
	_model "main/models"
	_testing "testing"
)

const content = `
<!doctype html>
<html lang="en">

<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<!-- style -->
</head>

<body data-sveltekit-preload-data="hover" class="=bg$pattern" bg$pattern="
	= bg$pattern-checkerboard d-flex justify-center align-center;
	min-width: 100vw;
	min-height: 100vh;
" {@media (min-width:512px)}&="
	--pattern-checker-bg1: var(---primary-100);
	--pattern-checker-bg2: var(---secondary-900);
">

	<stitch glass$$--container="= d-flex" &#{Cl1}&#{Cl2}&#{Load}&="= d-flex">Test
		<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
			<defs>
				<filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
					<feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92"
						result="noise" />
					<feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
					<feDisplacementMap in="SourceGraphic" in2="blurred" scale="77" xChannelSelector="R"
						yChannelSelector="G" />
				</filter>
			</defs>
		</svg>
	</stitch>

	<sketch style="
		background-image: linear-gradient(#ffffff 0.9px, transparent 0.9px), linear-gradient(to right, #ffffff 0.9px, #cacaca 1px);  
		background-size: 18px 18px;
	" data-glass-type="frosted" class="glass-type" glass$$$container="
		~ glass$$--container /test/glass$container /test/$---hU;
		= p-24 m-0 border-0 radius-16 d-flex align-center justify-center position-fixed tx$decoration-none cursor-pointer bg$none tx$size-h1 isolate an$transition-all kf$fade-in;
		box-shadow: 0px 6px 12px -6px #77777777;
		animation: .5s _keyframes_bg-fade-in forwards;
		&:hover {
			= tf$scale-125;
		}
		&::after {
			= position-absolute inset-0 layer-neg-2 radius-16 tx$content-clear;
			filter: url(#glass-distortion);
		}
		&::before {
			= position-absolute inset-0 layer-neg-1 radius-16 tx$content-clear;
			box-shadow: inset 0 0 15px -5px #00000044;
		}
		&.glass-type {
			&[data-glass-type='frosted'] {
				&::after {
					backdrop-filter: blur(1px);
				}
				&::before {
					background-color: rgba(255, 255, 255, 0.6);
				}
			}
			&[data-glass-type='liquid'] {
				&::after {
					backdrop-filter: blur(.5px);
				}
				&::before {
					background-color: rgba(255, 255, 255, 0.25);
				}
			}
		}
	" &="Use activation class glass-type for [data-glass-type='liquid'|'frosted']attribute">Test
	</sketch>

	<div data-glass-type='liquid' class="=glass$$$container ~glass-type =glass$$--container -lodash">
		Liquid Glass
	</div>

	<stitch />
</body>

</html>
`

const content1 = `
	<div data-glass-type='liquid' class="=glass$$$container ~glass-type =glass$$--container -lodash">
`

func Test_Main(t *_testing.T) {
	_target.New(_model.Config_ProxyStorage{
		Source:            "Source",
		Target:            "Target",
		Stylesheet:        "Stylesheet",
		StylesheetContent: "StylesheetContent",
		Extensions: map[string]_model.Config_Extension{
			"html": _model.Config_Extension{
				Watch: []string{"class"},
			},
		},
		Filepath_to_Content: map[string]string{
			"index.html": content1,
		},
	}, "lbl")
}
