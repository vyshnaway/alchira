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
		status:          true,
		mutex:           &_sync.Mutex{},
		folderMaps:      folderMaps,
		resolvedFolders: resolvedFolders,
		resolvedIgnores: resolvedIgnores,
	}
}

func (This *T_Watcher) Start(maxevents, pollInterval int) error {

	This.PollInterval = pollInterval
	This.hook = _watcher.New()
	This.hook.SetMaxEvents(maxevents)

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
				if !ok {
					return
				}
				var act E_Action

				switch event.Op {

				case _watcher.Create:
					fallthrough
				case _watcher.Write:
					act = E_Action_Update

				default:
					This.Reset()
					act = E_Action_Refactor
				}

				This.HandleEvent(act, event.Path, "")

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
		err := This.hook.Start(_time.Millisecond * _time.Duration(This.PollInterval))
		if err != nil {
			_fmt.Fprintf(_os.Stderr, "Watcher start error: %v\r\n", err)
		}
	}()

	This.Close = func() {
		close(done)
		This.status = false
		This.hook.Close()
	}
	return errors.Join(errs...)

}

func Quick(folders, ignores []string, pollInterval int) (instance *T_Watcher, err error) {
	w := New(folders, ignores)
	e := w.Start(1, pollInterval)
	return w, e
}
