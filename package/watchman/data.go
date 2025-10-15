package watchman

import (
	_watcher "github.com/radovskyb/watcher"
	_fileman "main/package/fileman"
	_filepath "path/filepath"
	"strings"
	_sync "sync"
	"time"
)

type E_Action int

const (
	E_Action_Reload E_Action = iota
	E_Action_Access
	E_Action_Update
	E_Action_Refactor
)

type Event struct {
	Action      E_Action
	TimeStamp   string
	Folder      string
	FilePath    string
	FileContent string
	Extension   string
}

type T_Watcher struct {
	hook            *_watcher.Watcher
	mutex           *_sync.Mutex
	queue           []Event
	Close           func()
	folderMaps      map[string]string
	resolvedFolders []string
	resolvedIgnores []string
}

func (This *T_Watcher) HandleEvent(action E_Action, filePath string) {
	event := Event{}
	now := time.Now()
	event.TimeStamp = now.Format("15:04:05")
	event.Action = action

	var folder = ""
	for _, f := range This.resolvedFolders {
		if strings.HasPrefix(filePath, f) {
			folder = This.folderMaps[f]
			break
		}
	}
	if folder == "" {
		return
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
	This.Add(event)
}

func (This *T_Watcher) Add(event Event) {
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
	return &evt
}

func (This *T_Watcher) Clear() {
	This.mutex.Lock()
	defer This.mutex.Unlock()
	This.queue = This.queue[:0]
}

func (This *T_Watcher) Reset() {
	This.mutex.Lock()
	defer This.mutex.Unlock()
	This.queue = []Event{}
}

func (This *T_Watcher) Length() int {
	This.mutex.Lock()
	defer This.mutex.Unlock()
	return len(This.queue)
}
