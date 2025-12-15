package action

import (
	_fmt "fmt"
	_config "main/configs"
	_model "main/models"
	_fileman "main/package/fileman"
	_sync "sync"
)

// ProxyMapDependency validates and processes proxy map dependencies
func Conflict_Sync_Test() Verify_ProxyMapDependency_return {
	proxymap := _config.Saved.ProxyMap
	configdir := _config.Path_Folder["blueprint"].Path

	result := Verify_ProxyMapDependency_return{
		Warnings: []string{},
		Messages: []string{},
	}

	var wg _sync.WaitGroup
	warning_channel := make(chan string, len(proxymap)*9)
	notification_channel := make(chan string, len(proxymap)*3)

	for index, ip := range proxymap {
		wg.Add(1)
		go func(i int, m _model.Config_ProxyMap) {
			defer wg.Done()

			if ok, err := _fileman.Path_IsIndependent(ip.Source, configdir); !ok {
				if err == nil {
					warning_channel <- _fmt.Sprintf("[%d]:source:\"%s\" should not depend on \"%s\".", i, m.Source, configdir)
				} else {
					warning_channel <- err.Error()
				}
			}
			if ok, err := _fileman.Path_IsIndependent(ip.Target, configdir); !ok {
				if err == nil {
					warning_channel <- _fmt.Sprintf("[%d]:target:\"%s\" should not depend on \"%s\".", i, m.Target, configdir)
				} else {
					warning_channel <- err.Error()
				}
			}

			source_type, source_err := _fileman.Path_Check(m.Source)
			target_type, target_err := _fileman.Path_Check(m.Target)

			if source_err != nil {
				warning_channel <- _fmt.Sprintf("[%d]:source:\"%s\" %s.", i, m.Source, source_err)
				return
			} else if target_err != nil {
				warning_channel <- _fmt.Sprintf("[%d]:target:\"%s\" %s.", i, m.Target, target_err)
				return
			}

			if target_type == _fileman.Path_Check_Type_Dir {
				if !(source_type == _fileman.Path_Check_Type_Nil || source_type == _fileman.Path_Check_Type_Dir) {
					warning_channel <- _fmt.Sprintf("Invalid index of [%d]:\"%s\"", i, m.Source)
					return
				} else if !_config.Static.SERVER && source_type == _fileman.Path_Check_Type_Nil {
					if err := _fileman.Clone_Safe(m.Target, m.Source, []string{}); err == nil {
						notification_channel <- _fmt.Sprintf("[%d]:\"%s\" cloned from [%d]:\"%s\"", i, m.Source, i, m.Target)
					} else {
						warning_channel <- _fmt.Sprintf("[%d]:\"%s\" clone from [%d] failed:\"%s\"", i, m.Source, i, m.Target)
						return
					}
				}
			} else if source_type == _fileman.Path_Check_Type_Dir {
				if target_type != _fileman.Path_Check_Type_Nil {
					warning_channel <- _fmt.Sprintf("Invalid index of [%d]:\"%s\"", i, m.Target)
					return
				} else if !_config.Static.SERVER && target_type == _fileman.Path_Check_Type_Nil{
					if err := _fileman.Clone_Safe(m.Source, m.Target, []string{}); err == nil {
						notification_channel <- _fmt.Sprintf("[%d]:\"%s\" cloned from [%d]:\"%s\"", i, m.Target, i, m.Source)
					} else {
						warning_channel <- _fmt.Sprintf("[%d]:\"%s\" clone from [%d] failed:\"%s\"", i, m.Target, i, m.Source)
						return
					}
				}
			} else {
				warning_channel <- _fmt.Sprintf("[%d]:source:\"%s\" dir unavailable.", i, m.Source)
				warning_channel <- _fmt.Sprintf("[%d]:target:\"%s\" dir unavailable.", i, m.Target)
				return
			}

			source_isdir := _fileman.Path_IfDir(m.Source)
			target_isdir := _fileman.Path_IfDir(m.Target)
			if source_isdir && target_isdir {
				if !_fileman.Path_IfFile(_fileman.Path_Join(m.Source, m.Stylesheet)) {
					warning_channel <- _fmt.Sprintf("[%d]:stylesheet:\"%s\" file not found in \"%s\" dir.", i, m.Stylesheet, m.Source)
				}
				if !_fileman.Path_IfFile(_fileman.Path_Join(m.Target, m.Stylesheet)) {
					warning_channel <- _fmt.Sprintf("[%d]:stylesheet:\"%s\" file not found in \"%s\" dir.", i, m.Stylesheet, m.Target)
				}

				for j, jp := range proxymap[i+1:] {
					if ok, err := _fileman.Path_IsIndependent(ip.Source, jp.Source); !ok {
						if err == nil {
							warning_channel <- _fmt.Sprintf("[%d]:source:\"%s\" & [%d]:source:\"%s\" are not independent.", i, ip.Source, j, jp.Source)
						} else {
							warning_channel <- err.Error()
						}
					}
					if ok, err := _fileman.Path_IsIndependent(ip.Target, jp.Target); !ok {
						if err == nil {
							warning_channel <- _fmt.Sprintf("[%d]:target:\"%s\" & [%d]:target:\"%s\" are not independent.", i, ip.Target, j, jp.Target)
						} else {
							warning_channel <- err.Error()
						}
					}
					if ok, err := _fileman.Path_IsIndependent(ip.Source, jp.Target); !ok {
						if err == nil {
							warning_channel <- _fmt.Sprintf("[%d]:source:\"%s\" & [%d]:target:\"%s\" are not independent.", i, ip.Source, j, jp.Target)
						} else {
							warning_channel <- err.Error()
						}
					}
					if ok, err := _fileman.Path_IsIndependent(ip.Target, jp.Source); !ok {
						if err == nil {
							warning_channel <- _fmt.Sprintf("[%d]:target:\"%s\" & [%d]:source:\"%s\" are not independent.", i, ip.Target, j, jp.Source)
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
