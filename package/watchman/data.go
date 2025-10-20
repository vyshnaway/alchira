package watchman

import (
	_fileman "main/package/fileman"
	_filepath "path/filepath"
	_sync "sync"
	"time"

	_watcher "github.com/radovskyb/watcher"
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

// If content == "", file content is refetched from path as fallback
func (This *T_Watcher) HandleEvent(action E_Action, filePath string, content string) {

	event := Event{}
	now := time.Now()
	event.Action = action
	event.Extension = _filepath.Ext(filePath)
	if len(event.Extension) > 0 {
		event.Extension = event.Extension[1:]
	}

	for _, parant := range This.resolvedFolders {
		if _fileman.Path_HasChildPath(parant, filePath) {
			event.Folder = This.folderMaps[parant]
			event.FilePath = filePath[len(parant)+1:]
			event.TimeStamp = now.Format("15:04:05")
			break
		}
	}
	if event.Folder == "" {
		return
	}

	if action == E_Action_Update {
		if content != "" {
			event.FileContent = content
		} else if data, err := _fileman.Read_File(filePath, false); err == nil {
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

func (This *T_Watcher) DeBuf() []Event {
	This.mutex.Lock()
	defer This.mutex.Unlock()
	if len(This.queue) == 0 {
		return nil
	}
	evts := This.queue
	This.queue = []Event{}
	return evts
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
