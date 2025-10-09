package event

import (
	_fmt "fmt"
	_fileman "main/package/fileman"
	_os "os"
	_filepath "path/filepath"
	_strings "strings"
	_sync "sync"
	_time "time"

	_fsnotify_ "github.com/fsnotify/fsnotify"
)

func Create(folders, ignores []string) (instance *Watcher, err error) {
	WATCHER := Watcher{
		mutex: _sync.Mutex{},
		queue: []Event{},
	}

	// Map resolved folders
	folderMaps := map[string]string{}
	for _, folder := range folders {
		abs, _ := _fileman.Path_Resolves(folder)
		folderMaps[abs] = folder
	}
	var resolvedFolders []string
	for k := range folderMaps {
		resolvedFolders = append(resolvedFolders, k)
	}
	var resolvedIgnores []string
	for _, p := range ignores {
		abs, _ := _fileman.Path_Resolves(p)
		resolvedIgnores = append(resolvedIgnores, abs)
	}

	w, err := _fsnotify_.NewWatcher()
	if err != nil {
		return nil, err
	}

	for _, folder := range resolvedFolders {
		if err := w.Add(folder); err != nil {
			return nil, err
		}
	}

	handleEvent := func(action E_Action, filePath string) {
		event := Event{}
		now := _time.Now()
		event.TimeStamp = now.Format("15:04:05")
		event.Action = action

		var folder string
		for _, f := range resolvedFolders {
			if _strings.HasPrefix(filePath, f) {
				folder = folderMaps[f]
				break
			}
		}

		event.Folder = folder
		event.FilePath, _ = _filepath.Rel(folder, filePath)
		event.Extension = _filepath.Ext(filePath)
		if len(event.Extension) > 0 {
			event.Extension = event.Extension[1:]
		}

		if action == E_Action_Update {
			data, err := _fileman.Read_File(filePath, false)
			if err == nil {
				event.FileContent = string(data)
			}
		}
		WATCHER.Add(event)
	}

	done := make(chan struct{})
	go func() {
		defer w.Close()
		for {
			select {
			case event, ok := <-w.Events:
				if !ok {
					return
				}
				var act E_Action
				switch {
				case event.Op&_fsnotify_.Create == _fsnotify_.Create:
					fallthrough
				case event.Op&_fsnotify_.Write == _fsnotify_.Write:
					act = E_Action_Update
				case event.Op&_fsnotify_.Remove == _fsnotify_.Remove:
					act = E_Action_Unlink
				default:
					act = E_Action_Access
				}
				if act != E_Action_Access {
					ignore := false
					for _, ig := range resolvedIgnores {
						if _fileman.Path_IsSubpath(event.Name, ig) {
							ignore = true
							break
						}
					}
					if !ignore {
						handleEvent(act, event.Name)
					}
				}
			case err, ok := <-w.Errors:
				if ok {
					_fmt.Fprintf(_os.Stderr, "Watcher error: %v\n", err)
				}
			case <-done:
				return
			}
		}
	}()

	WATCHER.Close = func() { close(done) }
	return &WATCHER, nil
}
