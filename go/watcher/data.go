package event

import (
	"sync"
)

type Action int

const (
	Action_Reload Action = iota
	Action_Access
	Action_Update
	Action_Unlink
)

type Event struct {
	Action      Action
	TimeStamp   string
	Folder      string
	FilePath    string
	FileContent string
	Extension   string
}

type Watcher struct {
	mutex sync.Mutex
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
