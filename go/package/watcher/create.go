package event

import (
	"errors"
	_fmt "fmt"
	_fileman "main/package/fileman"
	_os "os"
	_filepath "path/filepath"
	_strings "strings"
	_sync "sync"
	_time "time"

	_watcher "github.com/radovskyb/watcher"
)

func Create(folders, ignores []string, interval int) (instance *T_Watcher, err error) {
	WATCHER := T_Watcher{
		mutex: _sync.Mutex{},
		queue: []Event{},
	}

	// Map resolved folders
	folderMaps := map[string]string{}
	for _, folder := range folders {
		abs, _ := _fileman.Path_Resolves(folder)
		folderMaps[abs] = folder
	}
	var resolvedFolders []string
	for k := range folderMaps {
		resolvedFolders = append(resolvedFolders, k)
	}
	var resolvedIgnores []string
	for _, p := range ignores {
		abs, _ := _fileman.Path_Resolves(p)
		resolvedIgnores = append(resolvedIgnores, abs)
	}

	handleEvent := func(action E_Action, filePath string) {
		event := Event{}
		now := _time.Now()
		event.TimeStamp = now.Format("15:04:05")
		event.Action = action

		var folder string
		for _, f := range resolvedFolders {
			if _strings.HasPrefix(filePath, f) {
				folder = folderMaps[f]
				break
			}
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
		WATCHER.Add(event)
	}

	w := _watcher.New()
	w.SetMaxEvents(1)
	w.FilterOps(_watcher.Move, _watcher.Remove, _watcher.Write, _watcher.Rename, _watcher.Create)

	errs := []error{}
	for _, folder := range resolvedFolders {
		if err := w.AddRecursive(folder); err != nil {
			errs = append(errs, err)
		}
	}
	w.Ignore(resolvedIgnores...)

	done := make(chan struct{})
	go func() {
		for {
			select {
			case event, ok := <-w.Event:
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
				handleEvent(act, event.Name())
			case err, ok := <-w.Error:
				if ok {
					_fmt.Fprintf(_os.Stderr, "Watcher error: %v\r\n", err)
				}
			case <-done:
				return
			}
		}
	}()

	go func() {
		err := w.Start(_time.Millisecond * _time.Duration(interval))
		if err != nil {
			_fmt.Fprintf(_os.Stderr, "Watcher start error: %v\r\n", err)
		}
	}()

	WATCHER.Close = func() {
		close(done)
		w.Close()
	}
	return &WATCHER, errors.Join(errs...)
}
