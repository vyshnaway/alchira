package event

import (
	"sync"
)

type Event struct {
	TimeStamp   string
	Action      string
	Folder      string
	FilePath    string
	FileContent string
	Extension   string
}

var (
	queueMu sync.Mutex
	queue   []Event
)

func Add(event Event) {
	queueMu.Lock()
	defer queueMu.Unlock()
	queue = append(queue, event)
}

func Pull() *Event {
	queueMu.Lock()
	defer queueMu.Unlock()
	if len(queue) == 0 {
		return nil
	}
	evt := queue[0]
	queue = queue[1:]
	return &evt
}

func Clear() {
	queueMu.Lock()
	defer queueMu.Unlock()
	queue = queue[:0]
}
