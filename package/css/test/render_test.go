package test

import (
	"main/configs"
	_style "main/internal/style"
	_console "main/package/console"
	_css "main/package/css"
	_testing "testing"
)

// @hover $scale-125;
// --box-shadow: #77777777;
// box-shadow: inset 0 0 15px -5px #00000044;
//
//	m-auto {
//	    k: l;
//	}
//
//	@after {
//		= position-absolute inset-0 layer-neg-2 radius-16 tx$content-clear;
//		filter: url(#glass-distortion);
//	}
const content = `
.glass-type {
    &[data-glass-type='frosted'] {
        &:after {
            backdrop-filter: blur(1px);
        }
        &:-before {
            background-color: rgba(255, 255, 255, 0.6);
        }
        &::-after {
            backdrop-filter: blur(.5px);
        }
        &::before {
            background-color: rgba(255, 255, 255, 0.25);
        }
        & :before {
            background-color: rgba(255, 255, 255, 0.25);
        }
        &.before {
            background-color: rgba(255, 255, 255, 0.25);
        }
        @before {
            background-color: rgba(255, 255, 255, 0.25);
        }
    }
    &:before {
        = position-absolute inset-0 layer-neg-1 radius-16 tx$content-clear;

        box-shadow: inset 0 0 15px -5px #00000044;
    }
    &::before {
        = position-absolute inset-0 layer-neg-1 radius-16 tx$content-clear;

        box-shadow: inset 0 0 15px -5px #00000044;
    }
}
	`

// const content = `
// &:after {
//     backdrop-filter: blur(1px);
// }
// &:-before {
//     background-color: rgba(255, 255, 255, 0.6);
// }
// &::-after {
//     backdrop-filter: blur(.5px);
// }
// &::before {
//     background-color: rgba(255, 255, 255, 0.25);
// }
// & :before {
//     background-color: rgba(255, 255, 255, 0.25);
// }
// &.before {
//     background-color: rgba(255, 255, 255, 0.25);
// }
// @before {
//     background-color: rgba(255, 255, 255, 0.25);
// }
// 	`

func Test_Partials(t *_testing.T) {
    configs.Reset(false)
	res1 := _style.Parse_CssSnippet(content, "initial", "selector", true)
	_console.Render.Raw(_css.Render_Vendored(res1.Result, true))
}
