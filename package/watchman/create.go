package watchman

import (
	"errors"
	_fmt "fmt"
	"main/package/fileman"
	_os "os"
	_filepath "path/filepath"
	_sync "sync"
	_time "time"

	_fsnotify "github.com/fsnotify/fsnotify"
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
	done := make(chan struct{})

	// fs Notify watcher

	if watcher, e := _fsnotify.NewWatcher(); e == nil {
		for _, folder := range This.resolvedFolders {
			if fileman.Path_IfDir(folder) {
				_filepath.Walk(folder, func(path string, info _os.FileInfo, err error) error {
					if info.IsDir() {
						watcher.Add(path)
					}
					return nil
				})
			}

			watcher.Add(folder)
		}
		This.NotifyWatcher = watcher

		go func() {
			for {
				select {
				case event, ok := <-This.NotifyWatcher.Events:
					if !ok {
						continue
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

				case err, ok := <-This.NotifyWatcher.Errors:
					if ok {
						_fmt.Fprintf(_os.Stderr, "Watcher error: %v\r\n", err)
					}

				case <-done:
					return
				}
			}
		}()
	}

	// Fallback low fidelity polling watcher

	This.PollInterval = pollInterval
	This.PolledWatcher = _watcher.New()
	This.PolledWatcher.SetMaxEvents(maxevents)

	errs := []error{}
	for _, folder := range This.resolvedFolders {
		if err := This.PolledWatcher.AddRecursive(folder); err != nil {
			errs = append(errs, err)
		}
	}
	This.PolledWatcher.Ignore(This.resolvedIgnores...)

	go func() {
		for {
			select {
			case event, ok := <-This.PolledWatcher.Event:
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

			case err, ok := <-This.PolledWatcher.Error:
				if ok {
					_fmt.Fprintf(_os.Stderr, "Watcher error: %v\r\n", err)
				}

			case <-done:
				return
			}
		}
	}()

	go func() {
		err := This.PolledWatcher.Start(_time.Millisecond * _time.Duration(This.PollInterval))
		if err != nil {
			_fmt.Fprintf(_os.Stderr, "Watcher start error: %v\r\n", err)
		}
	}()

	This.Close = func() {
		// close(done)
		This.status = false
		if This.PolledWatcher != nil {
			This.PolledWatcher.Close()
		}
		if This.NotifyWatcher != nil {
			This.NotifyWatcher.Close()
		}
	}
	return errors.Join(errs...)

}

func Quick(folders, ignores []string, pollInterval int) (instance *T_Watcher, err error) {
	w := New(folders, ignores)
	e := w.Start(1, pollInterval)
	return w, e
}
