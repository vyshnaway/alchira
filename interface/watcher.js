import path from 'path'
import chokidar from 'chokidar'
import shell from './console.js';
import fileman from './fileman.js';
import { handleEvent } from './eventface.js';

export async function cssImport(filePathArray = []) {
    const processedFiles = new Set(filePathArray.reverse().map(filePath => path.resolve(filePath)).reverse());
    async function process(pathString) {
        const directory = path.dirname(pathString)
        let result = (await fileman.read.file(pathString)).data;
        for (const [match, filePath] of result.matchAll(/@import\s+url\(["']?(.*?)["']?\);/g)) {
            const resolvedPath = path.resolve(directory, filePath);
            result = result.replace(match, !processedFiles.has(resolvedPath) ? await process(resolvedPath) : "");
        }
        return result;
    }
    const result = await Promise.all(Array.from(processedFiles).map(async file => await process(file)));
    return result.join("")
}

export async function proxyMapDependency(proxyMap = [], xtylesDirectory) {
    const warnings = [];
    const notifications = [];

    await Promise.all(proxyMap.map(async (map, index) => {
        if (!fileman.path.isIndependent(map.source, map.target)) {
            warnings.push(`[${index}]:source::"${map.source}" & [${index}]:target::"${map.target}" are not independent.`);
        }
        if (!fileman.path.isIndependent(map.source, xtylesDirectory)) {
            warnings.push(`[${index}]:source::"${map.source}" should not dependent on "${xtylesDirectory}".`);
        }
        if (!fileman.path.isIndependent(xtylesDirectory, map.target)) {
            warnings.push(`[${index}]:target::"${map.target}" should not be dependent on "${xtylesDirectory}".`);
        }

        if (fileman.path.ifFolder(map.source)) {
            const targetStat = fileman.path.available(map.target);
            if (targetStat.type === "file") {
                warnings.push(`[${index}]:"${map.target}" expected folder instead of file.`);
            } else {
                if (fileman.path.isIndependent(xtylesDirectory, map.source)) {
                    await fileman.clone.safe(map.source, map.target);
                    notifications.push(`[${index}]:"${map.target}" cloned from [${index}]:"${map.source}"`)
                }
                const sourceStylesheetExists = fileman.path.ifFile(fileman.path.join(map.source, map.stylesheet));
                const targetStylesheetExists = fileman.path.ifFile(fileman.path.join(map.target, map.stylesheet));
                if (!sourceStylesheetExists) { warnings.push(`[${index}]:stylesheet::"${map.stylesheet}" file not found in "${map.source}" folder.`); }
                if (!targetStylesheetExists) { warnings.push(`[${index}]:stylesheet::"${map.stylesheet}" file not found in "${map.target}" folder.`); }
            }
        } else {
            warnings.push(`[${index}]:"${map.source}" folder not found.`);
        }
    }));

    for (let i = 0; i < proxyMap.length; i++) {
        for (let j = i + 1; j < proxyMap.length; j++) {
            if (fileman.path.isIndependent(proxyMap[i].target, proxyMap[j].source) || fileman.path.isIndependent(proxyMap[j].source, proxyMap[i].target)) {
                warnings.push(`[${i}]:target::"${proxyMap[i].target}" & [${j}]:source::"${proxyMap[j].source}" are not independent.`);
            }
            if (fileman.path.isIndependent(proxyMap[i].source, proxyMap[j].target) || fileman.path.isIndependent(proxyMap[j].target, proxyMap[i].source)) {
                warnings.push(`[${i}]:source::"${proxyMap[i].source}" & [${j}]:target::"${proxyMap[j].target}" are not independent.`);
            }
        }
    }

    return { warnings, notifications };
}

export async function proxyMapSync(proxyMap = []) {
    await Promise.all(proxyMap.map(async (map) => {
        const syncResult = await fileman.sync.bulk(map.target, map.source, Object.keys(map.extensions), [map.stylesheet]);
        Object.assign(map, syncResult);
        map.stylesheetContent = (await fileman.read.file(fileman.path.join(map.target, map.stylesheet))).data
    }));
    return proxyMap;
}

export function watchFolders(folders = [], xcssFolder, onEvent = handleEvent) { // Default to imported handleEvent
    // Resolve paths to absolute paths
    const resolvedFolders = folders.map(folder => path.resolve(folder));
    const resolvedXcssFolder = path.resolve(xcssFolder);
    const allPaths = [...resolvedFolders, resolvedXcssFolder];

    // Define the path to ignore: xtyles/.cache/ and its contents
    const cachePathToIgnore = path.join(resolvedXcssFolder, '.cache', '**');

    const watcher = chokidar.watch(allPaths, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 200,
            pollInterval: 100,
        },
        usePolling: true,
        interval: 100,
        binaryInterval: 300,
        alwaysStat: true,
        ignored: [
            /(^|[\/\\])\../,
            '**/node_modules/**',
            cachePathToIgnore
        ]
    });

    console.log(`Watching folders: ${allPaths.join(', ')}`);
    console.log(`Ignoring changes in: ${cachePathToIgnore}`);

    const handleEventInternal = async (action, filePath) => {
        console.log(`Raw event - Action: ${action}, Path: ${filePath}`);

        const result = {
            action: null,
            folder: null,
            filePath: null,
            fileContent: null,
            extension: null,
        };

        if (filePath.startsWith(resolvedXcssFolder)) {
            result.action = 'xtylesUpdate';
            result.folder = resolvedXcssFolder;
        } else {
            result.action = action;
            result.folder = resolvedFolders.find((folder) => filePath.startsWith(folder)) || null;
        }

        if (!result.folder) {
            console.warn(`No matching folder found for ${filePath}, but proceeding with event`);
            result.folder = filePath.startsWith(resolvedXcssFolder) ? resolvedXcssFolder : resolvedFolders[0];
        }

        result.filePath = path.relative(result.folder, filePath);
        result.extension = path.extname(filePath).slice(1);

        if (action !== 'folderUpdate') {
            try {
                const content = (await fileman.read.file(filePath, 'utf-8')).data;
                result.fileContent = fileman.read.file(content);
            } catch (error) {
                console.error(`Error reading file ${filePath}: ${error.message}`);
                result.fileContent = null;
            }
        }

        console.log(`Detected ${action}: ${filePath}`);
        onEvent(result); // Calls the imported handleEvent
    };

    watcher
        .on('change', (filePath) => {
            console.log(`Change event triggered for ${filePath}`);
            handleEventInternal('fileEdit', filePath);
        })
        .on('add', (filePath) => {
            console.log(`Add event triggered for ${filePath}`);
            handleEventInternal('fileAdd', filePath);
        })
        .on('unlink', (filePath) => {
            console.log(`Unlink event triggered for ${filePath}`);
            handleEventInternal('fileDelete', filePath);
        })
        .on('addDir', (filePath) => {
            console.log(`AddDir event triggered for ${filePath}`);
            handleEventInternal('folderUpdate', filePath);
        })
        .on('unlinkDir', (filePath) => {
            console.log(`UnlinkDir event triggered for ${filePath}`);
            handleEventInternal('folderUpdate', filePath);
        })
        .on('error', (error) => console.error(`Watcher error: ${error.message}`))
        .on('ready', () => console.log('Watcher is ready and listening for changes'));

    return () => {
        console.log('Stopping watcher');
        watcher.close();
    };
}