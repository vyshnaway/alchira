package test

import (
	"fmt"
	css "main/package/css"
	shell "main/package/shell"
	"testing"
)

const content1 = `
back: blur(1px);
backdrop: blur(1px);
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
@-before {
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
.before {
	background-color: rgba(255, 255, 255, 0.25);
	& :after {
		background-color: rgba(255, 255, 255, 0.25);
	}
	:before {
		background-color: rgba(255, 255, 255, 0.25);
		& :before {
			background-color: rgba(255, 255, 255, 0.25);
			background: rgba(255, 255, 255, 0.25);
		}
	}
}
`

const content2 = `
backdrop: blur(1px);
@before {
	&.before {
		background-color: rgba(255, 255, 255, 0.25);
	}
	background-color: rgba(255, 255, 255, 0.25);
}
.glass-type {
	backdrop: blur(1px);
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
	@-before {
		background-color: rgba(255, 255, 255, 0.25);
	}
	& :before {
		background-color: rgba(255, 255, 255, 0.25);
	}
	&.before {
		background-color: rgba(255, 255, 255, 0.25);
	}
	@before {
		&.before {
			background-color: rgba(255, 255, 255, 0.25);
		}
		background-color: rgba(255, 255, 255, 0.25);
	}
	.before {
		background-color: rgba(255, 255, 255, 0.25);
	}
}
`

const content3 = `
.glass-type {
	@before {
		background-color: rgba(255, 255, 255, 0.25);
	}
	.before {
		background: rgba(255, 255, 255, 0.25);
	}
	backdrop-filter: blur(1px);
    &[data-glass-type='frosted'] {
		backdrop-filter: blur(1px);
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
        box-shadow: inset 0 0 15px -5px #00000044;
    }
    &::before {
        box-shadow: inset 0 0 15px -5px #00000044;
    }
}
	
.glass {
	&@before {
		background-color: rgba(255, 255, 255, 0.25);
	}
}
	`

func Test(t *testing.T) {
	bm1 := css.NewBlock()
	bm1.SetProp("color", "red")
	nested := css.NewBlock()
	nested.SetProp("weight", "bold")
	bm1.SetBlock("style", nested)

	bm2 := css.NewBlock()
	bm2.SetProp("color", "blue")
	nested2 := css.NewBlock()
	nested2.SetProp("weight", "normal")
	bm2.SetBlock("style", nested2)

	bm1.Mixin(bm2)
	ok, val := bm1.GetProp("color") // Returns "blue", true
	fmt.Println(val, ok)            // Output: blue true

	// Fixed: Properly handle GetBlock return values
	ok, block := bm1.GetBlock("style")
	var nestedVal string
	if ok {
		ok, nestedVal = block.GetProp("weight") // Returns "normal", true
	} else {
		nestedVal, ok = "", false // Handle missing block
	}
	fmt.Println(nestedVal, ok) // Output: normal true

	bm3 := bm1.Clone()
	bm3.Mixin(bm2)
	bm3.SetProp("color", "green")
	if ok, block := bm3.GetBlock("style"); ok {
		block.SetProp("weight", "italic")
		block.SetProp("--weight", "italic")
	}
	val1, _ := bm1.GetProp("color") // Returns "blue"
	val2, _ := bm3.GetProp("color") // Returns "green"
	fmt.Println(val1, val2)         // Output: blue green

	bm1.Print()
	bm2.Print()
	bm3.Print()
	shell.Render.Raw(bm1.Skeleton())
	shell.Render.Raw(bm2.Skeleton())
	shell.Render.Raw(bm3.Skeleton())
}
