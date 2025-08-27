import strutils, os

# Move cursor left by `chars` and clear to end of line
proc backspace*(chars: int) =
  if chars <= 0: return
  stdout.write("\x1b[" & $chars & "D")  # CSI {n}D: move cursor left
  stdout.write("\x1b[K")                # CSI K   : clear from cursor to end of line
  flushFile stdout

# Write `s` to the terminal, optionally moving up `backRows` lines first.
# Returns the number of lines just printed.
proc writer*(s: string; backRows = 0): int =
  if backRows > 0:
    stdout.write("\x1b[" & $backRows & "A")  # move cursor up
    stdout.write("\x1b[J")                   # clear from cursor down
  elif backRows < 0:
    # full clear + cursor home (like `console.clear()`)
    stdout.write("\x1b[2J\x1b[H")
  let rows = s.count("\n") + 1
  stdout.write(s & "\n")
  flushFile stdout
  return rows

## Run a frame‐based animation in the terminal.
#
#  frames: sequence of string–frames
#  durationMs: total time per loop in milliseconds
#  repeat:  0 => infinite, >0 => number of loops
proc animate*(frames: seq[string]; durationMs = 1000; loops = 0) =
  if frames.len == 0:
    return

  # How many loops we'll actually render (use 1 loop for infinite to compute speed)
  let loopsForTiming = if loops == 0: 1 else: loops
  let totalFrames = frames.len * loopsForTiming
  # at least 1 ms per frame
  let interval = max(durationMs div totalFrames, 1)

  var iteration = 0
  var frameIdx = 0
  var backRows = 0

  while loops == 0 or iteration < loops:
    backRows = writer(frames[frameIdx], backRows)
    sleep(interval)
    inc(frameIdx)
    if frameIdx >= frames.len:
      frameIdx = 0
      inc(iteration)