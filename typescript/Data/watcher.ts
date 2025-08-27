import FS from "fs";
import PATH from "path";
import FILEMAN from "../fileman.js";
// import chokidar from "chokidar";

import * as TYPE from "../types.js";

export async function cssImport(filePathArray: string[] = []) {
	const processedFiles = new Set(
		filePathArray
			.reverse()
			.map((filePath) => PATH.resolve(filePath))
			.reverse(),
	);
	async function process(pathString: string) {
		const directory = PATH.dirname(pathString);
		let result = (await FILEMAN.read.file(pathString)).data;
		for (const [match, filePath] of result.matchAll(
			/@import\s+url\(["']?(.*?)["']?\);/g,
		)) {
			const resolvedPath = PATH.resolve(directory, filePath);
			result = result.replace(
				match,
				!processedFiles.has(resolvedPath) ? await process(resolvedPath) : "",
			);
		}
		return result;
	}
	const result = await Promise.all(
		Array.from(processedFiles).map(async (file) => await process(file)),
	);
	return result.join("");
}

export async function proxyMapDependency(proxyMap: TYPE.ProxyMap[] = [], xtylesDirectory: string) {
	const warnings: string[] = [];
	const notifications: string[] = [];

	await Promise.all(
		proxyMap.map(async (map, index) => {
			if (!FILEMAN.path.isIndependent(map.source, map.target)) {
				warnings.push(
					`[${index}]:source::"${map.source}" & [${index}]:target::"${map.target}" are not independent.`,
				);
			}
			if (!FILEMAN.path.isIndependent(map.source, xtylesDirectory)) {
				warnings.push(
					`[${index}]:source::"${map.source}" should not dependent on "${xtylesDirectory}".`,
				);
			}
			if (!FILEMAN.path.isIndependent(xtylesDirectory, map.target)) {
				warnings.push(
					`[${index}]:target::"${map.target}" should not be dependent on "${xtylesDirectory}".`,
				);
			}

			if (FILEMAN.path.ifFolder(map.source)) {
				const targetStat = FILEMAN.path.available(map.target);
				if (targetStat.type === "file") {
					warnings.push(
						`[${index}]:"${map.target}" expected folder instead of file.`,
					);
				} else {
					if (!targetStat.exist) {
						// if (fileman.path.isIndependent(xtylesDirectory, map.source)) {
						await FILEMAN.clone.safe(map.source, map.target);
						notifications.push(
							`[${index}]:"${map.target}" cloned from [${index}]:"${map.source}"`,
						);
					}
					const sourceStylesheetExists = FILEMAN.path.ifFile(
						FILEMAN.path.join(map.source, map.stylesheet),
					);
					const targetStylesheetExists = FILEMAN.path.ifFile(
						FILEMAN.path.join(map.target, map.stylesheet),
					);
					if (!sourceStylesheetExists) {
						warnings.push(
							`[${index}]:stylesheet::"${map.stylesheet}" file not found in "${map.source}" folder.`,
						);
					}
					if (!targetStylesheetExists) {
						warnings.push(
							`[${index}]:stylesheet::"${map.stylesheet}" file not found in "${map.target}" folder.`,
						);
					}
				}
			} else {
				warnings.push(`[${index}]:"${map.source}" folder not found.`);
			}
		}),
	);

	for (let i = 0; i < proxyMap.length; i++) {
		for (let j = i + 1; j < proxyMap.length; j++) {
			if (
				FILEMAN.path.isIndependent(proxyMap[i].target, proxyMap[j].source) ||
				FILEMAN.path.isIndependent(proxyMap[j].source, proxyMap[i].target)
			) {
				warnings.push(
					`[${i}]:target::"${proxyMap[i].target}" & [${j}]:source::"${proxyMap[j].source}" are not independent.`,
				);
			}
			if (
				FILEMAN.path.isIndependent(proxyMap[i].source, proxyMap[j].target) ||
				FILEMAN.path.isIndependent(proxyMap[j].target, proxyMap[i].source)
			) {
				warnings.push(
					`[${i}]:source::"${proxyMap[i].source}" & [${j}]:target::"${proxyMap[j].target}" are not independent.`,
				);
			}
		}
	}

	return { warnings, notifications };
}

export async function proxyMapSync(proxyMaps: TYPE.ProxyMap[] = []): Promise<Record<string, TYPE.ProxyMapStatic>> {
	const ProxyMapStatic = proxyMaps.reduce((acc, map) => {
		acc[map.target] = {
			...map,
			fileContents: {},
			stylesheetContent: ''
		} as TYPE.ProxyMapStatic;
		return acc;
	}, {} as Record<string, TYPE.ProxyMapStatic>);

	await Promise.all(
		Object.values(ProxyMapStatic).map(async (map) => {
			map.extensions.xcss = [];
			const syncResult = await FILEMAN.sync.bulk(
				map.target,
				map.source,
				Object.keys(map.extensions),
				["xcss"],
				[map.stylesheet],
			);
			if (syncResult.status) {
				map.fileContents = syncResult.fileContents;
				map.stylesheetContent = (
					await FILEMAN.read.file(
						FILEMAN.path.join(map.target, map.stylesheet)
					)
				).data;
			}
		}),
	);

	return ProxyMapStatic;
}





// Shared event queue module
export const EventQueue = (() => {
	let queue: TYPE.Event[] = [];

	function addEvent(event: TYPE.Event): void {
		queue.push(event);
	}

	function hasEvents(): boolean {
		return queue.length > 0;
	}

	function clear(): void {
		queue = [];
	}

	function dequeue(): TYPE.Event | null {
		return queue.length > 0 ? queue.shift()! : null;
	}

	return {
		addEvent,
		hasEvents,
		clear,
		dequeue,
	};
})();



export function watchFolders(folders: string[] = [], ignores: string[] = []) {
	const folderMaps = folders.reduce((acc: Record<string, string>, folder) => {
		acc[PATH.resolve(folder)] = folder;
		return acc;
	}, { '': '' });

	const resolvedFolders = Object.keys(folderMaps);
	const resolvedIgnores = ignores.map((p) => PATH.resolve(p));

	const watchers: FS.FSWatcher[] = [];

	const isIgnored = (filePath: string): boolean => {
		return resolvedIgnores.some(ignorePath => filePath.startsWith(ignorePath)) ||
			filePath.includes("node_modules") ||
			PATH.basename(filePath).startsWith(".");
	};

	const handleEventInternal = async (action: string, filePath: string) => {
		if (isIgnored(filePath)) { return; }

		const event: TYPE.Event = {
			timeStamp: '',
			action: '',
			folder: '',
			filePath: '',
			fileContent: '',
			extension: PATH.extname(filePath)?.slice(1),
		};

		const t = new Date();
		event.timeStamp = `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}:${t.getSeconds().toString().padStart(2, "0")}`;
		event.action = action;
		event.folder = folderMaps[resolvedFolders.find((folder) => filePath.startsWith(folder)) || ''];
		event.filePath = PATH.relative(event.folder, filePath);

		if (action === "add" || action === "change") {
			const content = await FILEMAN.read.file(filePath);
			if (content.status) {
				event.fileContent = content.data;
			}
		}

		EventQueue.addEvent(event);
	};

	const watchFolder = (folder: string) => {
		const watcher = FS.watch(folder, { recursive: true }, (eventType, filename) => {
			if (!filename) { return; }
			const fullPath = PATH.join(folder, filename);
			const action = eventType === "rename" ? "add" : "change";
			handleEventInternal(action, fullPath);
		});

		watcher.on("error", (error) => {
			console.error(`Watcher error: ${error.message}`);
		});

		watchers.push(watcher);
	};

	resolvedFolders.forEach(watchFolder);

	return () => {
		watchers.forEach(w => w.close());
	};
}


// export function watchFolders(folders: string[] = [], ignores: string[] = []) {
// 	const folderMaps = folders.reduce((acc: Record<string, string>, folder) => {
// 		acc[path.resolve(folder)] = folder;
// 		return acc;
// 	}, { '': '' });
// 	const resolvedFolders = Object.keys(folderMaps);
// 	const resolvedIgnores = ignores.map((p) => path.join(path.resolve(p), "**"));

// 	const handleEventInternal = async (action: string, filePath: string) => {
// 		const event: TYPE.Event = {
// 			timeStamp: '',
// 			action: '',
// 			folder: '',
// 			filePath: '',
// 			fileContent: '',
// 			extension: path.extname(filePath)?.slice(1),
// 		};

// 		const t = new Date();
// 		event.timeStamp = t.getHours().toString().padStart(2, "0") + `:` +
// 			t.getMinutes().toString().padStart(2, "0") + `:` +
// 			t.getSeconds().toString().padStart(2, "0");

// 		event.action = action;
// 		event.folder = folderMaps[resolvedFolders.find((folder) => filePath.startsWith(folder)) || ''];
// 		event.filePath = path.relative(event.folder, filePath);

// 		if (action === "add" || action === "change") {
// 			const content = await fileman.read.file(filePath);
// 			if (content.status) {
// 				event.fileContent = content.data;
// 			}
// 		}

// 		EventQueue.addEvent(event);
// 	};

// 	const watcher = chokidar.watch(resolvedFolders, {
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
// 		.on("all", (event, filePath) => handleEventInternal(event, filePath))
// 		.on("error", (error: unknown) => {
// 			if (error instanceof Error) {
// 				console.error(`Watcher error: ${error.message}`);
// 			}
// 		});

// 	return () => { watcher.close(); };
// }