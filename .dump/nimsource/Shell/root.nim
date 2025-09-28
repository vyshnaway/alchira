import strutils, terminal, render, style, sequtils

# Named color/style presets
type
  Preset* = object
    title*, text*, link*, primary*, secondary*, tertiary*, warning*, success*, failed*: seq[string]

let preset*: Preset = Preset(
  title:     @[style.TC_Normal_Green],
  text:      @[style.TC_Normal_White],
  link:      @[style.AS_Underline],
  primary:   @[style.TC_Normal_Yellow],
  secondary: @[style.TC_Bright_Yellow],
  tertiary:  @[style.TC_Bright_Black],
  warning:   @[style.TC_Normal_Yellow],
  success:   @[style.TC_Normal_Green],
  failed:    @[style.TC_Normal_Red]
)

type
  Config* = object
    taskActive*: bool
    postActive*: bool
    tabSpace*: int

  Divider* = object
    top*, mid*, low*: string

  Canvas* = object
    config*: Config
    divider*: Divider
    tab*: string

# Global canvas instance
var canvas*: Canvas = Canvas(
  config: Config(taskActive: true, postActive: true, tabSpace: 2),
  divider: Divider(top: "‾", mid: "─", low: "_"),
  tab: " "
)

# Terminal width (fallback to 48 if unknown)
proc width*(): int =
  if isatty(stdout):
    let (cols, _) = terminalSize()
    if cols > 0: return cols
  return 48

# Initialize canvas dimensions and repeats
proc init*(taskActive = true, postActive = true, tabWidth = 2) =
  let w = width()
  canvas.tab = repeat(' ', tabWidth)
  canvas.config.taskActive = taskActive
  canvas.config.postActive = postActive
  canvas.divider.low = repeat($canvas.divider.low[0], w)
  canvas.divider.mid = repeat($canvas.divider.mid[0], w)
  canvas.divider.top = repeat($canvas.divider.top[0], w)

# Format a string with ANSI codes, then reset
proc format*(s: string = ""; styles: seq[string]): string =
  let prefix = if styles.len > 0:
    "\x1b[" & styles.join(";") & "m"
  else: ""
  return prefix & s & "\x1b[0m"

# Post a styled string via the render module
proc post*(s: string; styles: varargs[string]): void =
  render.writer(format(s, styles.toSeq()))
