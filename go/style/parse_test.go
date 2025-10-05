package style_test

import (
	_style_ "main/style"
	"testing"
)

func Test_Snippet(t *testing.T) {
	content := `
.m-auto { 
    ~ glass$--container /test/glass$container /test/$---hU;
    = p-24 m-0 border-0 radius-16 d-flex align-center justify-center position-fixed tx$decoration-none cursor-pointer bg$none tx$size-h1 isolate an$transition-all kf$fade-in;
    --box-shadow: #77777777;
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
}
	`
	res1 := _style_.Parse_CssSnippet(content, "initial", "selector", true, true)
	res2 := _style_.Parse_CssSnippet(content, "initial", "selector", false, false)
	res1.Result.Print()
	res2.Result.Print()
}

    // &.glass-type {
    //     &[data-glass-type='frosted'] {
    //         &::after {
    //             backdrop-filter: blur(1px);
    //         }
    //         &::before {
    //             background-color: rgba(255, 255, 255, 0.6);
    //         }
    //     }
    //     &[data-glass-type='liquid'] {
    //         &::after {
    //             backdrop-filter: blur(.5px);
    //         }
    //         &::before {
    //             background-color: rgba(255, 255, 255, 0.25);
    //         }
    //     }
    // }