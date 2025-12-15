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
// const content = `
// .glass-type {
//     &[data-glass-type='frosted'] {
//         &:after {
//             backdrop-filter: blur(1px);
//         }
//         &:-before {
//             background-color: rgba(255, 255, 255, 0.6);
//         }
//         &::-after {
//             backdrop-filter: blur(.5px);
//         }
//         &::before {
//             background-color: rgba(255, 255, 255, 0.25);
//         }
//         & :before {
//             background-color: rgba(255, 255, 255, 0.25);
//         }
//         &.before {
//             background-color: rgba(255, 255, 255, 0.25);
//         }
//         @before {
//             background-color: rgba(255, 255, 255, 0.25);
//         }
//     }
//     &:before {
//         = position-absolute inset-0 layer-neg-1 radius-16 tx$content-clear;

//         box-shadow: inset 0 0 15px -5px #00000044;
//     }
//     &::before {
//         = position-absolute inset-0 layer-neg-1 radius-16 tx$content-clear;

//         box-shadow: inset 0 0 15px -5px #00000044;
//     }
// }
// 	`
const content = `
        #live-preview-output-container {

            &[data-live-preview-output-container-preserve="true"] {
                box-shadow: 0px 0px 32px -24px rgba(128, 128, 128, 0.5);
            }

            &[data-live-preview-output-container-resize="true"] {
                outline: solid 1px rgba(128, 128, 128, 0.5);
                overflow: auto;
                min-width: 1rem;
                min-height: 1rem;
                resize: both !important;
            }

            &[data-live-preview-output-container-debug="true"] {
                outline: rgba(255, 0, 0, 0.4) solid 1px !important;

                & * {
                    outline: rgba(255, 0, 0, 0.4) solid 1px !important;

                    &:hover {
                        outline: rgb(255, 0, 0) solid 1px !important;
                    }
                }
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
    res1.Result.Print()
	_console.Render.Raw(_css.Render_Vendored(res1.Result, true))
}
