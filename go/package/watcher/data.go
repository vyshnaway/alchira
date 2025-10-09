package event

import (
	_sync "sync"
)

type E_Action int

const (
	E_Action_Reload E_Action = iota
	E_Action_Access
	E_Action_Update
	E_Action_Unlink
)

type Event struct {
	Action      E_Action
	TimeStamp   string
	Folder      string
	FilePath    string
	FileContent string
	Extension   string
}

type Watcher struct {
	mutex _sync.Mutex
	queue []Event
	Close func()
}

func (This *Watcher) Add(event Event) {
	This.mutex.Lock()
	defer This.mutex.Unlock()
	This.queue = append(This.queue, event)
}

func (This *Watcher) Pull() *Event {
	This.mutex.Lock()
	defer This.mutex.Unlock()
	if len(This.queue) == 0 {
		return nil
	}
	evt := This.queue[0]
	This.queue = This.queue[1:]
	return &evt
}

func (This *Watcher) Clear() {
	This.mutex.Lock()
	defer This.mutex.Unlock()
	This.queue = This.queue[:0]
}

func (This *Watcher) Reset() {
	This.mutex.Lock()
	defer This.mutex.Unlock()
	This.queue = []Event{}
}

func (This *Watcher) Length() int {
	This.mutex.Lock()
	defer This.mutex.Unlock()
	return len(This.queue)
}
