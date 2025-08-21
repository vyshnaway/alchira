import path from "path";
import chokidar from "chokidar";
import fileman from "../fileman.js";
import { t_Event, t_ProxyMap } from "../types.js";

export async function cssImport(filePathArray: string[] = []) {
	const processedFiles = new Set(
		filePathArray
			.reverse()
			.map((filePath) => path.resolve(filePath))
			.reverse(),
	);
	async function process(pathString: string) {
		const directory = path.dirname(pathString);
		let result = (await fileman.read.file(pathString)).data;
		for (const [match, filePath] of result.matchAll(
			/@import\s+url\(["']?(.*?)["']?\);/g,
		)) {
			const resolvedPath = path.resolve(directory, filePath);
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

export async function proxyMapDependency(proxyMap: t_ProxyMap[] = [], xtylesDirectory: string) {
	const warnings: string[] = [];
	const notifications: string[] = [];

	await Promise.all(
		proxyMap.map(async (map, index) => {
			if (!fileman.path.isIndependent(map.source, map.target)) {
				warnings.push(
					`[${index}]:source::"${map.source}" & [${index}]:target::"${map.target}" are not independent.`,
				);
			}
			if (!fileman.path.isIndependent(map.source, xtylesDirectory)) {
				warnings.push(
					`[${index}]:source::"${map.source}" should not dependent on "${xtylesDirectory}".`,
				);
			}
			if (!fileman.path.isIndependent(xtylesDirectory, map.target)) {
				warnings.push(
					`[${index}]:target::"${map.target}" should not be dependent on "${xtylesDirectory}".`,
				);
			}

			if (fileman.path.ifFolder(map.source)) {
				const targetStat = fileman.path.available(map.target);
				if (targetStat.type === "file") {
					warnings.push(
						`[${index}]:"${map.target}" expected folder instead of file.`,
					);
				} else {
					if (!targetStat.exist) {
						// if (fileman.path.isIndependent(xtylesDirectory, map.source)) {
						await fileman.clone.safe(map.source, map.target);
						notifications.push(
							`[${index}]:"${map.target}" cloned from [${index}]:"${map.source}"`,
						);
					}
					const sourceStylesheetExists = fileman.path.ifFile(
						fileman.path.join(map.source, map.stylesheet),
					);
					const targetStylesheetExists = fileman.path.ifFile(
						fileman.path.join(map.target, map.stylesheet),
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
				fileman.path.isIndependent(proxyMap[i].target, proxyMap[j].source) ||
				fileman.path.isIndependent(proxyMap[j].source, proxyMap[i].target)
			) {
				warnings.push(
					`[${i}]:target::"${proxyMap[i].target}" & [${j}]:source::"${proxyMap[j].source}" are not independent.`,
				);
			}
			if (
				fileman.path.isIndependent(proxyMap[i].source, proxyMap[j].target) ||
				fileman.path.isIndependent(proxyMap[j].target, proxyMap[i].source)
			) {
				warnings.push(
					`[${i}]:source::"${proxyMap[i].source}" & [${j}]:target::"${proxyMap[j].target}" are not independent.`,
				);
			}
		}
	}

	return { warnings, notifications };
}

export async function proxyMapSync(proxyMap: t_ProxyMap[] = []) {
	await Promise.all(
		proxyMap.map(async (map) => {
			map.extensions.xcss = [];
			const syncResult = await fileman.sync.bulk(
				map.target,
				map.source,
				Object.keys(map.extensions),
				["xcss"],
				[map.stylesheet],
			);
			if (syncResult.status) {
				map.fileContents = syncResult.fileContents;
				map.stylesheetContent = (await fileman.read.file(fileman.path.join(map.target, map.stylesheet))).data;
			}
		}),
	);
}





// Shared event queue module
export const EventQueue = (() => {
	let queue: t_Event[] = [];

	function addEvent(event: t_Event): void {
		queue.push(event);
	}

	function hasEvents(): boolean {
		return queue.length > 0;
	}

	function clear(): void {
		queue = [];
	}

	function dequeue(): t_Event | null {
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
		acc[path.resolve(folder)] = folder;
		return acc;
	}, { '': '' });
	const resolvedFolders = Object.keys(folderMaps);
	const resolvedIgnores = ignores.map((p) => path.join(path.resolve(p), "**"));

	const handleEventInternal = async (action: string, filePath: string) => {
		const event: t_Event = {
			timeStamp: '',
			action: '',
			folder: '',
			filePath: '',
			fileContent: '',
			extension: path.extname(filePath)?.slice(1),
		};

		const t = new Date();
		event.timeStamp = t.getHours().toString().padStart(2, "0") + `:` +
			t.getMinutes().toString().padStart(2, "0") + `:` +
			t.getSeconds().toString().padStart(2, "0");

		event.action = action;
		event.folder = folderMaps[resolvedFolders.find((folder) => filePath.startsWith(folder)) || ''];
		event.filePath = path.relative(event.folder, filePath);

		if (action === "add" || action === "change") {
			const content = await fileman.read.file(filePath);
			if (content.status) {
				event.fileContent = content.data;
			}
		}

		EventQueue.addEvent(event);
	};

	const watcher = chokidar.watch(resolvedFolders, {
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
		.on("all", (event, filePath) => handleEventInternal(event, filePath))
		.on("error", (error: unknown) => {
			if (error instanceof Error) {
				console.error(`Watcher error: ${error.message}`);
			}
		});

	return () => { watcher.close(); };
}