package action

import (
	"fmt"
	_fileman_ "main/fileman"
	"os"
	"path/filepath"
	_strings_ "strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
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

    watcher, err := fsnotify.NewWatcher()
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
        now := time.Now()
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
                case event.Op&fsnotify.Create == fsnotify.Create:
                    act = "add"
                case event.Op&fsnotify.Write == fsnotify.Write:
                    act = "change"
                case event.Op&fsnotify.Remove == fsnotify.Remove:
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
                    fmt.Fprintf(os.Stderr, "Watcher error: %v\n", err)
                }
            case <-done:
                return
            }
        }
    }()

    stop = func() { close(done) }
    return stop, nil
}



// export function Init(folders: string[] = [], ignores: string[] = []) {
// 	const folderMaps = folders.reduce((acc, folder) => {
// 		acc[PATH.resolve(folder)] = folder;
// 		return acc;
// 	}, {} as Record<string, string>);
// 	const resolvedFolders = Object.keys(folderMaps);
// 	const resolvedIgnores = ignores.map((p) => PATH.resolve(p));

// 	const handleEventInternal = async (action: string, filePath: string) => {
// 		const event: _Support.Event = {
// 			timeStamp: '',
// 			action: '',
// 			folder: '',
// 			filePath: '',
// 			fileContent: '',
// 			extension: PATH.extname(filePath)?.slice(1),
// 		};

// 		const t = new Date();
// 		event.timeStamp = t.getHours().toString().padStart(2, "0") + `:` +
// 			t.getMinutes().toString().padStart(2, "0") + `:` +
// 			t.getSeconds().toString().padStart(2, "0");

// 		event.action = action;
// 		event.folder = folderMaps[resolvedFolders.find((folder) => filePath.startsWith(folder)) || ''];
// 		event.filePath = PATH.relative(event.folder, filePath);

// 		if (action === "add" || action === "change") {
// 			const content = await FILEMAN.read.file(filePath);
// 			if (content.status) {
// 				event.fileContent = content.data;
// 			}
// 		}

// 		add(event);
// 	};

// 	const watcher = CHOKIDAR.watch(resolvedFolders, {
// 		persistent: true,
// 		ignoreInitial: true,
// 		alwaysStat: true,
// 		awaitWriteFinish: {
// 			stabilityThreshold: 200,
// 			pollInterval: 100,
// 		},
// 		ignored: [/(^|[/\\])\../, "**/node_modules/**", ...resolvedIgnores],
// 		usePolling: true,
// 		interval: 100,
// 		binaryInterval: 300,
// 	});

// 	watcher
// 		.on("all", (event: string, filePath: string) => handleEventInternal(event, filePath))
// 		.on("error", (error: unknown) => {
// 			if (error instanceof Error) {
// 				console.error(`Watcher error: ${error.message}`);
// 			}
// 		});

// 	return () => { watcher.close(); };
// }
