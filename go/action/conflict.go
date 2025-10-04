package action

import (
	_fmt_ "fmt"
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	_types_ "main/types"
	_filepath_ "path/filepath"
	_sync_ "sync"
)

// ProxyMapDependency validates and processes proxy map dependencies
func Conflict_Sync_Test() Verify_ProxyMapDependency_return {
	proxymap := _cache_.Static.ProxyMap
	configdir := _cache_.Path_Folder["scaffold"].Path

	result := Verify_ProxyMapDependency_return{
		Warnings: []string{},
		Messages: []string{},
	}

	var wg _sync_.WaitGroup
	warning_channel := make(chan string, len(proxymap)*12)
	notification_channel := make(chan string, len(proxymap)*3)

	for index, ip := range proxymap {
		wg.Add(1)

		go func(i int, m _types_.Config_ProxyMap) {
			defer wg.Done()

			if ok, err := _fileman_.Path_IsIndependent(ip.Source, configdir); !ok {
				if err == nil {
					warning_channel <- _fmt_.Sprintf("[%d]:source:\"%s\" should not depend on \"%s\".", i, m.Source, configdir)
				} else {
					warning_channel <- err.Error()
				}
			}
			if ok, err := _fileman_.Path_IsIndependent(ip.Target, configdir); !ok {
				if err == nil {
					warning_channel <- _fmt_.Sprintf("[%d]:target:\"%s\" should not depend on \"%s\".", i, m.Target, configdir)
				} else {
					warning_channel <- err.Error()
				}
			}

			source_type, source_err := _fileman_.Path_Check(m.Source)
			target_type, target_err := _fileman_.Path_Check(m.Target)

			if target_type == _fileman_.Path_Check_Type_Dir && (source_type == _fileman_.Path_Check_Type_Nil || source_type == _fileman_.Path_Check_Type_Dir) {
				if err := _fileman_.Clone_Safe(m.Target, m.Source, []string{}); err == nil {
					notification_channel <- _fmt_.Sprintf("[%d]:\"%s\" cloned from [%d]:\"%s\"", i, m.Source, i, m.Target)
				}
			}
			if source_type == _fileman_.Path_Check_Type_Dir && (target_type == _fileman_.Path_Check_Type_Nil || target_type == _fileman_.Path_Check_Type_Dir) {
				if err := _fileman_.Clone_Safe(m.Source, m.Target, []string{}); err == nil {
					notification_channel <- _fmt_.Sprintf("[%d]:\"%s\" cloned from [%d]:\"%s\"", i, m.Target, i, m.Source)
				}
			}

			if source_type != _fileman_.Path_Check_Type_Dir && source_type != _fileman_.Path_Check_Type_Nil {
				if source_err == nil {
					warning_channel <- _fmt_.Sprintf("[%d]:source:\"%s\" dir unavailable.", i, m.Source)
				} else {
					warning_channel <- _fmt_.Sprintf("[%d]:source:\"%s\" %s.", i, m.Source, source_err)
				}
			}

			if target_type != _fileman_.Path_Check_Type_Dir && target_type != _fileman_.Path_Check_Type_Nil {
				if target_err == nil {
					warning_channel <- _fmt_.Sprintf("[%d]:target:\"%s\" dir unavailable.", i, m.Source)
				} else {
					warning_channel <- _fmt_.Sprintf("[%d]:target:\"%s\" %s.", i, m.Target, target_err)
				}
			}

			source_isdir := _fileman_.Path_IfDir(m.Source)
			target_isdir := _fileman_.Path_IfDir(m.Target)
			if source_isdir && target_isdir {
				if !_fileman_.Path_IfFile(_filepath_.Join(m.Source, m.Stylesheet)) {
					warning_channel <- _fmt_.Sprintf("[%d]:stylesheet:\"%s\" file not found in \"%s\" dir.", i, m.Stylesheet, m.Source)
				}
				if !_fileman_.Path_IfFile(_filepath_.Join(m.Target, m.Stylesheet)) {
					warning_channel <- _fmt_.Sprintf("[%d]:stylesheet:\"%s\" file not found in \"%s\" dir.", i, m.Stylesheet, m.Target)
				}

				for j, jp := range proxymap[i+1:] {
					if ok, err := _fileman_.Path_IsIndependent(ip.Source, jp.Source); !ok {
						if err == nil {
							warning_channel <- _fmt_.Sprintf("[%d]:source:\"%s\" & [%d]:source:\"%s\" are not independent.", i, ip.Source, j, jp.Source)
						} else {
							warning_channel <- err.Error()
						}
					}
					if ok, err := _fileman_.Path_IsIndependent(ip.Target, jp.Target); !ok {
						if err == nil {
							warning_channel <- _fmt_.Sprintf("[%d]:target:\"%s\" & [%d]:target:\"%s\" are not independent.", i, ip.Target, j, jp.Target)
						} else {
							warning_channel <- err.Error()
						}
					}
					if ok, err := _fileman_.Path_IsIndependent(ip.Source, jp.Target); !ok {
						if err == nil {
							warning_channel <- _fmt_.Sprintf("[%d]:source:\"%s\" & [%d]:target:\"%s\" are not independent.", i, ip.Source, j, jp.Target)
						} else {
							warning_channel <- err.Error()
						}
					}
					if ok, err := _fileman_.Path_IsIndependent(ip.Target, jp.Source); !ok {
						if err == nil {
							warning_channel <- _fmt_.Sprintf("[%d]:target:\"%s\" & [%d]:source:\"%s\" are not independent.", i, ip.Target, j, jp.Source)
						} else {
							warning_channel <- err.Error()
						}
					}
				}
			}

		}(index, ip)
	}

	go func() {
		wg.Wait()
		close(warning_channel)
		close(notification_channel)
	}()

	for w := range warning_channel {
		result.Warnings = append(result.Warnings, w)
	}
	for n := range notification_channel {
		result.Messages = append(result.Messages, n)
	}

	return result
}
