package compose_test

import (
	"main/compose"
	"main/shell"
	"main/style"
	"testing"
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
const content2 = `
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
	`

func Test_Partials(t *testing.T) {
	res1 := style.Parse_CssSnippet(content, "initial", "selector", true, true)
	shell.Render.Raw(compose.Render_Prefixer(res1.Result, []string{}))
}
