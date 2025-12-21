package script

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	_model "main/models"

	_reader "main/package/reader"
	_string "strings"
)

func Value_Builder(
	value string,
	method E_Method,
	fileData *_model.File_Stash,
	fileCursor *_reader.T_Reader,
	isWatching bool,
	orderedMapping map[string]string,
) string {

	awaitop := false
	scribed := value
	nr := _reader.New(value + " ")
	var waitop rune = 0
	var entry, stream _string.Builder
	awaitop = false

	for nr.Streaming {
		ch := nr.Active.Char

		if awaitop {
			if ok := symlink_chars.Match([]byte{byte(ch)}); ok {
				entry.WriteRune(ch)
			} else {
				entrystring := entry.String()

				switch waitop {
				case op_lodash:
					if fileData.Cache.Loadashes[entrystring] {
						stream.WriteString(_fmt.Sprintf("%s%s", fileData.Label, entrystring))
						awaitop = false
					}

				case op_mid:
					if method != E_Method_LoadHash {
						if found_Entry, found_Status := orderedMapping[entrystring]; found_Status {
							stream.WriteString(found_Entry)
							awaitop = false
						}
					}

				case op_low:
					if method != E_Method_LoadHash {
						if res := _action.Index_Finder(entrystring, fileData.Cache.LocalMap); res.Index > 0 {
							if method == E_Method_DebugHash {
								classname := res.Data.SrcData.DebugLow
								stream.WriteString(classname)
								if waitop == op_low {
									_config.Style.Sketchpad.Low[classname] = res.Index
								} else {
									_config.Style.Sketchpad.Mac[classname] = res.Index
								}
							} else if method == E_Method_PreviewHash || _config.Static.PREVIEW {
								stream.WriteString(res.Data.SrcData.PreviewLow)
							} else {
								stream.WriteString(res.Data.SrcData.PublishLow)
							}
							awaitop = false
						}
					}

				case op_top:
					if method != E_Method_LoadHash {
						if res := _action.Index_Finder(entrystring, fileData.Cache.LocalMap); res.Index > 0 {
							if method == E_Method_DebugHash {
								classname := res.Data.SrcData.DebugTop
								stream.WriteString(classname)
								_config.Style.Sketchpad.Top[classname] = res.Index
							} else if method == E_Method_PreviewHash || _config.Static.PREVIEW {
								stream.WriteString(res.Data.SrcData.PreviewTop)
							} else {
								stream.WriteString(res.Data.SrcData.PublishTop)
							}
							awaitop = false
						}
					}
				}

				if awaitop {
					if !isWatching {
						stream.WriteRune('\\')
					}
					stream.WriteRune(waitop)
					stream.WriteString(entrystring)
				}
				stream.WriteRune(ch)
				entry.Reset()
				waitop = 0
				awaitop = false
			}
		} else if checkOpSlash(isWatching, nr.Active.Last, ch) {
			awaitop = true
			waitop = ch
		} else {
			if nr.Active.Last == '\\' {
				stream.WriteRune('\\')
			}
			if ch != '\\' {
				stream.WriteRune(ch)
			}
		}
		nr.Increment()
	}

	scribed = stream.String()

	return _string.TrimSpace(scribed)
}
