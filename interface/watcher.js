import path from 'path'
import chokidar from 'chokidar'
import fileman from './fileman.js'

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

export async function watchFolders(folders = [], xcssFolder) {
    return new Promise((resolve) => {
        const result = { action: null, folder: null, filePath: null, fileContent: null, extension: null };
        const watcher = chokidar.watch(folders, { persistent: true });

        const handleEvent = async (action = "", filePath = "") => {
            watcher.close();
            if (filePath.startsWith(xcssFolder)) {
                result.action = "xtylesUpdate";
                result.folder = xcssFolder;
            } else {
                result.action = action;
                result.folder = folders.find(folder => filePath.startsWith(folder))
            }
            result.filePath = path.relative(result.folder, filePath);
            result.extension = path.extname(filePath).slice(1);

            if (action !== "folderUpdate") {
                try {
                    const content = fileman.read.file(fs.readFile(filePath, 'utf-8'));
                    result.fileContent = content;
                } catch (error) {
                    console.error(`Error reading file ${filePath}: ${error}`);
                    result.fileContent = null;
                }
            }
            console.log(`Detected ${action}: ${filePath}`);
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