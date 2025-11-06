package watchman

import (
	"context"
	_fmt "fmt"
	_os "os"
	_sync "sync"
	_time "time"

	_fsnotify "github.com/fsnotify/fsnotify"
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
	polledWatcher   *_watcher.Watcher
	notifyWatcher   *_fsnotify.Watcher
	mutex           *_sync.Mutex
	queue           []*Event
	close           chan struct{}
	Status          bool
	Close           func()
	PollIntervalMs  int
	ignoredFolders  map[string]string
	watchingFolders map[string]string
	ctx             context.Context
	cancel          context.CancelFunc
}

func New() *T_Watcher {
	ctx, cancel := context.WithCancel(context.Background())
	var notifyWatcher *_fsnotify.Watcher = nil
	if watcher, e := _fsnotify.NewWatcher(); e == nil {
		notifyWatcher = watcher
	}

	return &T_Watcher{
		notifyWatcher:   notifyWatcher,
		polledWatcher:   _watcher.New(),
		mutex:           &_sync.Mutex{},
		queue:           []*Event{},
		close:           make(chan struct{}),
		Close:           func() {},
		Status:          false,
		PollIntervalMs:  0,
		ignoredFolders:  map[string]string{},
		watchingFolders: map[string]string{},
		ctx:             ctx,
		cancel:          cancel,
	}
}

func (This *T_Watcher) Start() {
	This.Status = true

	if This.notifyWatcher != nil {
		go func() {
			for {
				if !This.Status {
					return
				}

				select {
				case <-This.ctx.Done():
					return
				case event, ok := <-This.notifyWatcher.Events:
					if !ok {
						return
					}
					var act E_Action

					switch {
					case event.Op&_fsnotify.Create == _fsnotify.Create:
						info, err := _os.Stat(event.Name)
						if err == nil && info.IsDir() {
							This.Reset()
							act = E_Action_Refactor
						} else {
							act = E_Action_Update
						}

					case event.Op&_fsnotify.Write == _fsnotify.Write:
						act = E_Action_Update

					default:
						This.Reset()
						act = E_Action_Refactor
					}

					This.HandleEvent(act, event.Name, "")

				case err, ok := <-This.notifyWatcher.Errors:
					if !ok {
						return
					}
					_fmt.Fprintf(_os.Stderr, "Watcher error: %v\r\n", err)

				case <-This.close:
					return
				}
			}
		}()
	}

	if This.polledWatcher != nil && This.PollIntervalMs > 0 {

		go func() {
			for {
				if !This.Status {
					return
				}

				select {
				case <-This.ctx.Done():
					return
				case event, ok := <-This.polledWatcher.Event:
					if !ok {
						return
					}
					var act E_Action
					switch event.Op {

					case _watcher.Create:
						info, err := _os.Stat(event.Path)
						if err == nil && info.IsDir() {
							This.Reset()
							act = E_Action_Refactor
						} else {
							act = E_Action_Update
						}

					case _watcher.Write:
						act = E_Action_Update

					default:
						This.Reset()
						act = E_Action_Refactor
					}

					This.HandleEvent(act, event.Path, "")

				case err, ok := <-This.polledWatcher.Error:
					if !ok {
						return
					}
					_fmt.Fprintf(_os.Stderr, "Watcher error: %v\r\n", err)

				case <-This.close:
					return
				}
			}
		}()

		go func() {
			err := This.polledWatcher.Start(_time.Millisecond * _time.Duration(This.PollIntervalMs))
			if err != nil {
				_fmt.Fprintf(_os.Stderr, "Watcher start error: %v\r\n", err)
			}
		}()
	}

	This.Close = func() {
		This.mutex.Lock()
		defer This.mutex.Unlock()
		if This.Status {
			This.Status = false
			This.cancel()
			This.polledWatcher.Close()
			if This.notifyWatcher != nil {
				This.notifyWatcher.Close()
			}
			close(This.close)
		}
	}
}
