import loadColorFallback from "./color.js";

console.log(loadColorFallback(`
    This is a test string with various colors:
    rgb(255, 0, 0) - red
    hsl(120, 100%, 50%) - green
    #0000ff - blue
    #f09 - pink
    hwb(240 0% 0% / 0.5) - blue with transparency
    lab(50% 0 0) - middle gray
    lch(70% 30 200) - some LCH color
    oklab(0.7 0.1 0.2g / 0.8) - some Oklab color
    oklch(0.5 0.2 150) - some Oklch color
    Another rgb(0, 128, 255)
    Some text without color.    
`))