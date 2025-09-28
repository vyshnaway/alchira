//  import * as _Config from "../type/config.js";
// import * as _File from "../type/file.js";
// import * as _Style from "../type/style.js";
// import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
import * as _Support from "../type/support.js";

// import FS from "fs";
import PATH from "path";
import FILEMAN from "../fileman.js";
import CHOKIDAR from "chokidar";


export const queue: _Support.Event[] = [];


export function add(event: _Support.Event): void {
	queue.push(event);
}
export function pull(): _Support.Event | null {
	return queue.length > 0 ? queue.shift()! : null;
}
export function clear(): void {
	queue.length = 0;
}


export function Init(folders: string[] = [], ignores: string[] = []) {
	const folderMaps = folders.reduce((acc, folder) => {
		acc[PATH.resolve(folder)] = folder;
		return acc;
	}, {} as Record<string, string>);
	const resolvedFolders = Object.keys(folderMaps);
	const resolvedIgnores = ignores.map((p) => PATH.resolve(p));

	const handleEventInternal = async (action: string, filePath: string) => {
		const event: _Support.Event = {
			timeStamp: '',
			action: '',
			folder: '',
			filePath: '',
			fileContent: '',
			extension: PATH.extname(filePath)?.slice(1),
		};

		const t = new Date();
		event.timeStamp = t.getHours().toString().padStart(2, "0") + `:` +
			t.getMinutes().toString().padStart(2, "0") + `:` +
			t.getSeconds().toString().padStart(2, "0");

		event.action = action;
		event.folder = folderMaps[resolvedFolders.find((folder) => filePath.startsWith(folder)) || ''];
		event.filePath = PATH.relative(event.folder, filePath);

		if (action === "add" || action === "change") {
			const content = await FILEMAN.read.file(filePath);
			if (content.status) {
				event.fileContent = content.data;
			}
		}

		add(event);
	};

	const watcher = CHOKIDAR.watch(resolvedFolders, {
		persistent: true,
		ignoreInitial: true,
		alwaysStat: true,
		awaitWriteFinish: {
			stabilityThreshold: 200,
			pollInterval: 100,
		},
		ignored: [/(^|[/\\])\../, "**/node_modules/**", ...resolvedIgnores],
		usePolling: true,
		interval: 100,
		binaryInterval: 300,
	});

	watcher
		.on("all", (event: string, filePath: string) => handleEventInternal(event, filePath))
		.on("error", (error: unknown) => {
			if (error instanceof Error) {
				console.error(`Watcher error: ${error.message}`);
			}
		});

	return () => { watcher.close(); };
}



// export function watchFolders(folders: string[] = [], ignores: string[] = []) {
// 	const folderMaps = folders.reduce((acc: Record<string, string>, folder) => {
// 		acc[PATH.resolve(folder)] = folder;
// 		return acc;
// 	}, { '': '' });

// 	const resolvedFolders = Object.keys(folderMaps);
// 	const resolvedIgnores = ignores.map((p) => PATH.resolve(p));

// 	const watchers: FS.FSWatcher[] = [];

// 	const isIgnored = (filePath: string): boolean => {
// 		return resolvedIgnores.some(ignorePath => filePath.startsWith(ignorePath)) ||
// 			filePath.includes("node_modules") ||
// 			PATH.basename(filePath).startsWith(".");
// 	};

// 	const handleEventInternal = async (action: string, filePath: string) => {
// 		if (isIgnored(filePath)) { return; }

// 		const event: _Support.Event = {
// 			timeStamp: '',
// 			action: '',
// 			folder: '',
// 			filePath: '',
// 			fileContent: '',
// 			extension: PATH.extname(filePath)?.slice(1),
// 		};

// 		const t = new Date();
// 		event.timeStamp = `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}:${t.getSeconds().toString().padStart(2, "0")}`;
// 		event.action = action;
// 		event.folder = folderMaps[resolvedFolders.find((folder) => filePath.startsWith(folder)) || ''];
// 		event.filePath = PATH.relative(event.folder, filePath);

// 		if (action === "add" || action === "change") {
// 			const content = await FILEMAN.read.file(filePath);
// 			if (content.status) {
// 				event.fileContent = content.data;
// 			}
// 		}

// 		EventQueue.addEvent(event);
// 	};

// 	const watchFolder = (folder: string) => {
// 		const watcher = FS.watch(folder, { recursive: true }, (eventType, filename) => {
// 			if (!filename) { return; }
// 			const fullPath = PATH.join(folder, filename);
// 			const action = eventType === "rename" ? "add" : "change";
// 			handleEventInternal(action, fullPath);
// 		});

// 		watcher.on("error", (error) => {
// 			console.error(`Watcher error: ${error.message}`);
// 		});

// 		watchers.push(watcher);
// 	};

// 	resolvedFolders.forEach(watchFolder);

// 	return () => {
// 		watchers.forEach(w => w.close());
// 	};
// }
