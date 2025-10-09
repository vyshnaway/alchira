package test

import (
	_style "main/internal/style"
	_testing "testing"
)

func Test_Hashrule(t *_testing.T) {
	content := `
@hover $scale-125;
--box-shadow: #77777777;
~ glass$--container /test/glass$container /test/$---hU;
= p-24 m-0 border-0 radius-16 kf$fade-in;
box-shadow: inset 0 0 15px -5px #00000044;
m-auto { k: l; } 
@after {
	= position-absolute inset-0 layer-neg-2 radius-16 tx$content-clear;
	filter: url(#glass-distortion);
}
.m-auto { 
    box-shadow: 0px 6px 12px -6px #77777777;
    
    &::before {
        = position-absolute inset-0 layer-neg-1 radius-16 tx$content-clear;

        box-shadow: inset 0 0 15px -5px #00000044;
    }
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
	`
	res1 := _style.Parse_CssSnippet(content, "initial", "selector", true, true)
	res1.Result.Print()
	res2 := _style.Parse_CssSnippet(content, "initial", "selector", false, false)
	res2.Result.Print()
}

/*

*/
