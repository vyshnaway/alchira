import chokidar from 'chokidar'
import fileman from './files.js'

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

const xtylesDirectory = "./xtyles";

export async function proxyMapDependency(proxyMap = []) {
    const cssWarnings = [];
    const folderWarnings = [];
    const notifications = [];

    await Promise.all(proxyMap.map(async (map, index) => {
        if (fileman.path.isAncestor(map.source, map.target) || fileman.path.isAncestor(map.target, map.source) ||
            fileman.path.isAncestor(map.source, xtylesDirectory) || fileman.path.isAncestor(map.target, xtylesDirectory) ||
            fileman.path.isAncestor(xtylesDirectory, map.target) || fileman.path.isAncestor(xtylesDirectory, map.source)) {
            folderWarnings.push(`[${index}]:source::"${map.source}" & [${index}]:target::"${map.target}" are not independent.`);
        }

        if (fileman.path.ifFolder(map.source)) {
            const targetStat = fileman.path.available(map.target);
            if (targetStat.type === "file") {
                folderWarnings.push(`[${index}]:"${map.target}" expected folder instead of file.`);
            } else {
                if (!targetStat.exist) {
                    await fileman.clone.safe(map.source, map.target);
                    notifications.push(`[${index}]:"${map.target}" created from [${index}]:"${map.source}"`)
                }
                const sourceStylesheetExists = fileman.path.ifFile(fileman.path.join(map.source, map.stylesheet));
                const targetStylesheetExists = fileman.path.ifFile(fileman.path.join(map.target, map.stylesheet));
                if (!sourceStylesheetExists || !targetStylesheetExists) {
                    cssWarnings.push(`[${index}]:"${map.stylesheet}" file not found in ${sourceStylesheetExists ? 'target' : 'source'} folder.`);
                }
            }
        } else {
            folderWarnings.push(`[${index}]:"${map.source}" folder not found.`);
        }
    }));

    for (let i = 0; i < proxyMap.length; i++) {
        for (let j = i + 1; j < proxyMap.length; j++) {
            if (fileman.path.isAncestor(proxyMap[i].target, proxyMap[j].source) || fileman.path.isAncestor(proxyMap[j].source, proxyMap[i].target)) {
                folderWarnings.push(`[${i}]:target::"${proxyMap[i].target}" & [${j}]:source::"${proxyMap[j].source}" are not independent.`);
            }
            if (fileman.path.isAncestor(proxyMap[i].source, proxyMap[j].target) || fileman.path.isAncestor(proxyMap[j].target, proxyMap[i].source)) {
                folderWarnings.push(`[${i}]:source::"${proxyMap[i].source}" & [${j}]:target::"${proxyMap[j].target}" are not independent.`);
            }
        }
    }

    return { cssWarnings, folderWarnings, notifications };
}

export async function proxyMapSync(proxyMap = []) {
    await Promise.all(proxyMap.map(async (map) => {
        const syncResult = await fileman.sync.bulk(fileman.target, fileman.source, Object.keys(map.extensions), fileman.path.join(map.stylesheet));
        Object.assign(map, syncResult);
        map.stylesheetContent = await fileman.read.file(fileman.path.join(map.source, map.stylesheet))
    }));
    return proxyMap;
}

export async function watchFolders(folders = [], xcssFolder) {
    return new Promise((resolve) => {
        const result = { action: null, folder: null, filePath: null, fileContent: null };
        const watcher = chokidar.watch(folders, { persistent: true });

        const handleEvent = async (action = "", path = "") => {
            watcher.close();
            result.filePath = path;
            if (path.startsWith(xcssFolder)) {
                result.action = "xtylesUpdate";
                result.folder = xcssFolder;
            } else {
                result.action = action;
                result.folder = folders.find(folder => path.startsWith(folder))
            }

            if (action !== "folderUpdate") {
                try {
                    const content = fileman.read.file(fs.readFile(path, 'utf-8'));
                    result.fileContent = content;
                } catch (error) {
                    console.error(`Error reading file ${path}: ${error}`);
                    result.fileContent = null;
                }
            }
            console.log(`Detected ${action}: ${path}`);
            resolve(result);
        };

        watcher
            .on('change', (path) => handleEvent('fileEdit', path))
            .on('add', (path) => handleEvent('fileAdd', path))
            .on('unlink', (path) => handleEvent('fileDelete', path))
            .on('addDir', (path) => handleEvent('folderUpdate', path))
            .on('unlinkDir', (path) => handleEvent('folderUpdate', path))
    });
}