package script

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	_model "main/models"

	// "main/package/console"
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
) (string, []string) {

	runes := []rune(value)
	appends := []string{}
	awaitop := false
	scribed := value
	valuelen := len(value)
	var waitop rune = 0
	var lastCh rune = 0
	var entry _string.Builder

	var stream _string.Builder
	entry.Reset()
	waitop = 0
	lastCh = 0
	awaitop = false

	for marker := range valuelen {
		ch := runes[marker]
		if awaitop {
			if ok := symclass_chars.Match([]byte{byte(ch)}); ok {
				entry.WriteRune(ch)
			} else {
				entrystring := entry.String()

				switch waitop {
				case op_lodash:
					if fileData.Cache.Loadashes[entrystring] {
						stream.WriteString(_fmt.Sprintf("%s%s", fileData.Label, entrystring))
						awaitop = false
					}

				case op_order:
					if method != E_Method_LoadHash {
						if found_Entry, found_Status := orderedMapping[entrystring]; found_Status {
							stream.WriteString(found_Entry)
							awaitop = false
						}
					}

				case op_append:
					if method != E_Method_LoadHash {
						if res := _action.Index_Finder(entrystring, fileData.Cache.LocalMap); res.Index > 0 {
							appends = append(appends, res.Data.SrcData.NativeStaple)
							awaitop = false
						}
					}
					fallthrough
				case op_scatter:
					if method != E_Method_LoadHash {
						if res := _action.Index_Finder(entrystring, fileData.Cache.LocalMap); res.Index > 0 {
							if method == E_Method_DebugHash {
								classname := res.Data.SrcData.DebugScatterClass
								stream.WriteString(classname)
								if waitop == op_scatter {
									_config.Style.Sandbox_Scattered[classname] = res.Index
								} else {
									_config.Style.Sandbox_Append[classname] = res.Index
								}
							} else if method == E_Method_PreviewHash || _config.Static.PREVIEW {
								stream.WriteString(res.Data.SrcData.PreviewScatterClass)
							} else {
								stream.WriteString(res.Data.SrcData.PublishScatterClass)
							}
							awaitop = false
						}
					}
				case op_finalize:
					if method != E_Method_LoadHash {
						if res := _action.Index_Finder(entrystring, fileData.Cache.LocalMap); res.Index > 0 {
							if method == E_Method_DebugHash {
								classname := res.Data.SrcData.DebugFinalClass
								stream.WriteString(classname)
								_config.Style.Sandbox_Final[classname] = res.Index
							} else if method == E_Method_PreviewHash || _config.Static.PREVIEW {
								stream.WriteString(res.Data.SrcData.PreviewFinalClass)
							} else {
								stream.WriteString(res.Data.SrcData.PublishFinalClass)
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
		} else if checkOpSlash(isWatching, lastCh, ch) {
			awaitop = true
			waitop = ch
		} else {
			if lastCh == '\\' {
				stream.WriteRune('\\')
			}
			if ch != '\\' {
				stream.WriteRune(ch)
			}
		}
		lastCh = ch
	}

	scribed = stream.String()

	return scribed, appends
}
