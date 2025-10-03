package event

import (
	_fmt_ "fmt"
	_fileman_ "main/fileman"
	_os_ "os"
	"path/filepath"
	_strings_ "strings"
	_time_ "time"

	_fsnotify_ "github.com/fsnotify/fsnotify"
)

func Init(folders, ignores []string) (stop func(), err error) {
	// Map resolved folders
	folderMaps := map[string]string{}
	for _, folder := range folders {
		abs, _ := _fileman_.Path_Resolves(folder)
		folderMaps[abs] = folder
	}
	var resolvedFolders []string
	for k := range folderMaps {
		resolvedFolders = append(resolvedFolders, k)
	}
	var resolvedIgnores []string
	for _, p := range ignores {
		abs, _ := _fileman_.Path_Resolves(p)
		resolvedIgnores = append(resolvedIgnores, abs)
	}

	watcher, err := _fsnotify_.NewWatcher()
	if err != nil {
		return nil, err
	}

	for _, folder := range resolvedFolders {
		if err := watcher.Add(folder); err != nil {
			return nil, err
		}
	}

	handleEvent := func(action, filePath string) {
		event := Event{}
		now := _time_.Now()
		event.TimeStamp = now.Format("15:04:05")
		event.Action = action

		var folder string
		for _, f := range resolvedFolders {
			if _strings_.HasPrefix(filePath, f) { // Check for folder conflict
				folder = folderMaps[f]
				break
			}
		}
		event.Folder = folder
		event.FilePath, _ = filepath.Rel(folder, filePath)
		event.Extension = filepath.Ext(filePath)
		if len(event.Extension) > 0 {
			event.Extension = event.Extension[1:]
		}
		// Only read content on "create" or "write"
		if action == "create" || action == "write" {
			data, err := _fileman_.Read_File(filePath, false)
			if err == nil {
				event.FileContent = string(data)
			}
		}
		Add(event)
	}

	done := make(chan struct{})
	go func() {
		defer watcher.Close()
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				// Map fsnotify events to JS actions
				act := ""
				switch {
				case event.Op&_fsnotify_.Create == _fsnotify_.Create:
					act = "add"
				case event.Op&_fsnotify_.Write == _fsnotify_.Write:
					act = "change"
				case event.Op&_fsnotify_.Remove == _fsnotify_.Remove:
					act = "unlink"
				}
				if act != "" {
					// Optionally apply ignore rules here.
					ignore := false
					for _, ig := range resolvedIgnores {
						if filepath.HasPrefix(event.Name, ig) {
							ignore = true
							break
						}
					}
					if !ignore {
						handleEvent(act, event.Name)
					}
				}
			case err, ok := <-watcher.Errors:
				if ok {
					_fmt_.Fprintf(_os_.Stderr, "Watcher error: %v\n", err)
				}
			case <-done:
				return
			}
		}
	}()

	stop = func() { close(done) }
	return stop, nil
}
