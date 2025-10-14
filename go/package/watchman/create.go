package watchman

import (
	"errors"
	_fmt "fmt"
	"main/package/fileman"
	_os "os"
	_sync "sync"
	_time "time"

	_watcher "github.com/radovskyb/watcher"
)

func New(folders, ignores []string) *T_Watcher {
	folderMaps := map[string]string{}
	for _, folder := range folders {
		abs, _ := fileman.Path_Resolves(folder)
		folderMaps[abs] = folder
	}
	var resolvedFolders []string
	for k := range folderMaps {
		resolvedFolders = append(resolvedFolders, k)
	}
	var resolvedIgnores []string
	for _, p := range ignores {
		abs, _ := fileman.Path_Resolves(p)
		resolvedIgnores = append(resolvedIgnores, abs)
	}
	return &T_Watcher{
		queue:           []Event{},
		mutex:           &_sync.Mutex{},
		folderMaps:      folderMaps,
		resolvedFolders: resolvedFolders,
		resolvedIgnores: resolvedIgnores,
	}
}

func (This *T_Watcher) Start(interval, maxevents int) error {
	This.hook = _watcher.New()
	This.hook.SetMaxEvents(maxevents)
	This.hook.FilterOps(_watcher.Move, _watcher.Remove, _watcher.Write, _watcher.Rename, _watcher.Create)

	errs := []error{}
	for _, folder := range This.resolvedFolders {
		if err := This.hook.AddRecursive(folder); err != nil {
			errs = append(errs, err)
		}
	}
	This.hook.Ignore(This.resolvedIgnores...)

	done := make(chan struct{})
	go func() {
		for {
			select {
			case event, ok := <-This.hook.Event:
				_fmt.Println("event")
				if !ok {
					return
				}
				var act E_Action
				switch event.Op {
				case _watcher.Create:
					fallthrough
				case _watcher.Rename:
					fallthrough
				case _watcher.Write:
					act = E_Action_Update
				case _watcher.Move:
					fallthrough
				case _watcher.Remove:
					act = E_Action_Refactor
				default:
					act = E_Action_Access
				}
				This.HandleEvent(act, event.Name())
			case err, ok := <-This.hook.Error:
				if ok {
					_fmt.Fprintf(_os.Stderr, "Watcher error: %v\r\n", err)
				}
			case <-done:
				return
			}
		}
	}()

	go func() {
		err := This.hook.Start(_time.Millisecond * _time.Duration(interval))
		if err != nil {
			_fmt.Fprintf(_os.Stderr, "Watcher start error: %v\r\n", err)
		}
	}()

	This.Close = func() {
		close(done)
		This.hook.Close()
	}
	return errors.Join(errs...)

}

func Instant(folders, ignores []string, interval int) (instance *T_Watcher, err error) {
	w := New(folders, ignores)
	e := w.Start(interval, 1)
	return w, e
}
