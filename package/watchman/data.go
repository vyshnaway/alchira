package watchman

import (
	_fileman "main/package/fileman"
	_os "os"
	_filepath "path/filepath"
	_time "time"

	_fsnotify "github.com/fsnotify/fsnotify"
	_watcher "github.com/radovskyb/watcher"
)

func (This *T_Watcher) Add_WatchingFolder(folders []string) {
	This.mutex.Lock()
	defer This.mutex.Unlock()

	for _, folder := range folders {

		abs, err := _fileman.Path_Resolves(folder)
		if _, exist := This.watchingFolders[abs]; !exist && err == nil && _fileman.Path_IfDir(folder) {

			if This.notifyWatcher != nil {
				This.notifyWatcher.Add(folder)
				This.polledWatcher.Add(folder)
				_filepath.Walk(folder, func(path string, info _os.FileInfo, err error) error {
					if err != nil {
						return err
					}
					if info.IsDir() {
						This.polledWatcher.Add(path)
						This.notifyWatcher.Add(path)
					}
					return nil
				})

			}

			This.watchingFolders[abs] = folder
		}
	}
}

func (This *T_Watcher) Add_IgnoredFolder(folders []string) {
	This.mutex.Lock()
	defer This.mutex.Unlock()
	for _, folder := range folders {
		abs, _ := _fileman.Path_Resolves(folder)
		This.ignoredFolders[abs] = folder
	}
}

// If content == "", file content is refetched from path as fallback
func (This *T_Watcher) HandleEvent(action E_Method, filePath string, content string) {

	event := Event{}
	event.Action = action
	if action != E_Method_Reload {
		for resFolder := range This.ignoredFolders {
			if _fileman.Path_HasChildPath(resFolder, filePath) {
				return
			}
		}

		now := _time.Now()
		event.Extension = _filepath.Ext(filePath)
		if len(event.Extension) > 0 {
			event.Extension = event.Extension[1:]
		}

		for resFolder, refFolder := range This.watchingFolders {
			if ok, relpath := _fileman.Path_RelChildPath(resFolder, filePath); ok {
				event.Folder = refFolder
				event.FilePath = relpath
				event.TimeStamp = now.Format("15:04:05")
				break
			}
		}

		if content != "" {
			event.FileContent = content
		} else if data, err := _fileman.Read_File(filePath, false); err == nil {
			event.FileContent = string(data)
		}
	}

	This.Add(&event)
}

func (This *T_Watcher) Add(event *Event) {
	This.mutex.Lock()
	defer This.mutex.Unlock()
	This.queue = append(This.queue, event)
}

func (This *T_Watcher) Pull() *Event {
	This.mutex.Lock()
	defer This.mutex.Unlock()
	if len(This.queue) == 0 {
		return nil
	}
	evt := This.queue[0]
	This.queue = This.queue[1:]
	return evt
}

func (This *T_Watcher) DeBuf() []*Event {
	This.mutex.Lock()
	defer This.mutex.Unlock()
	if len(This.queue) == 0 {
		return nil
	}
	evts := This.queue
	This.queue = []*Event{}
	return evts
}

func (This *T_Watcher) Reset() {
	This.DeBuf()
	This.mutex.Lock()
	defer This.mutex.Unlock()

	if This.Status {
		close(This.close) // close the signal channel
	}
	This.close = make(chan struct{}) // recreate for future use
	This.Status = false

	This.polledWatcher.Close()
	This.polledWatcher = _watcher.New()

	This.notifyWatcher.Close()
	watcher, e := _fsnotify.NewWatcher()
	if e == nil {
		This.notifyWatcher = watcher
	} else {
		This.notifyWatcher = nil
	}

	This.ignoredFolders = map[string]string{}
	This.watchingFolders = map[string]string{}
}

func (This *T_Watcher) Length() int {
	This.mutex.Lock()
	defer This.mutex.Unlock()
	return len(This.queue)
}
