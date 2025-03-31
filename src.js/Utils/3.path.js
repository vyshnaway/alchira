import path from 'path';
import fs from 'fs/promises'; // Added missing import

// Simplified fetchRoot using modern Node.js features
const fetchRoot = () => Promise.resolve(path.dirname(import.meta.url.pathname));

// Shared error handling for path checks
async function checkPath(pathStr, checkFn) {
    try {
        const stats = await fs.stat(pathStr);
        return checkFn(stats);
    } catch (error) {
        if (error.code === 'ENOENT') return false;
        console.error('Path check error:', error);
        return false;
    }
}

// Optimized pathChecker with shared error handling
const pathChecker = {
    async isFolder(folderPath) {
        return checkPath(folderPath, stats => stats.isDirectory());
    },
    async isFile(filePath) {
        return checkPath(filePath, stats => stats.isFile());
    },
    isAncestor(ancestor, descendant) {
        const relative = path.relative(ancestor, descendant);
        return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    }
};

// Optimized filterFiles with clearer logic and pre-compiled regex
const filterFiles = (source, suffixes = []) => {
    const allFiles = getAllFilesInDirectory(source); // Assuming this exists
    const result = {
        validFiles: [],
        ignFiles: [],
        atFiles: [],
        dotFiles: [],
        actFiles: [],
        specFiles: [],
        syncPaths: []
    };

    // Pre-compile regex patterns
    const ignPattern = /\/[\.@$][\.@$]/;
    const atPattern = /\/@[^.]+/;
    const specPattern = /\/$[^.]+/;
    const dotPattern = /\/\.[^.]+/;

    for (const file of allFiles) {
        if (ignPattern.test(file)) {
            result.ignFiles.push(file);
            continue;
        }

        result.validFiles.push(file);
        if (!suffixes.length || suffixes.some(suffix => file.endsWith(suffix))) {
            const syncPath = path.relative(source, file);
            if (atPattern.test(file)) {
                result.atFiles.push(file);
            } else if (specPattern.test(file)) {
                result.specFiles.push(file);
                result.syncPaths.push(syncPath.replace(/\/$/g, '/'));
            } else if (dotPattern.test(file)) {
                result.dotFiles.push(file);
                result.syncPaths.push(syncPath.replace(/\/\./g, '/'));
            } else {
                result.actFiles.push(file);
                result.syncPaths.push(syncPath);
            }
        }
    }

    return result;
};

// Optimized createSyncMap with reduced complexity
const createSyncMap = (map, files = [], folderTemplate = {}) => {
    const result = {
        keep: [],
        cache: {},
        switch: {},
        midway: Object.fromEntries(Object.keys(folderTemplate).map(key => [key, []]))
    };

    for (const file of files) {
        const subPath = path.relative(map.target, file).replace(/\/\./g, '/');
        const sourceFile = path.join(map.source, subPath);
        const midwayBase = path.join(map.midway, subPath);

        result.cache[file] = Object.fromEntries(
            Object.entries(folderTemplate).map(([key, value]) => {
                const fullPath = path.join(midwayBase, value);
                result.midway[key].push(fullPath);
                return [key, fullPath];
            })
        );

        result.keep.push(subPath);
        result.switch[file] = sourceFile;
        result.switch[sourceFile] = file;
    }

    return result;
};

// Optimized dirInspect with better error handling and modern features
const dirInspect = {
    files(dir) {
        try {
            return fs.readdirSync(dir, { withFileTypes: true })
                .filter(item => item.isDirectory())
                .map(item => item.name);
        } catch (error) {
            console.error(`Error reading directory: ${error.message}`);
            return [];
        }
    },
    folders(dir) {
        const results = [];
        try {
            function readDir(directory) {
                for (const item of fs.readdirSync(directory)) {
                    const fullPath = path.join(directory, item);
                    if (fs.statSync(fullPath).isDirectory()) {
                        results.push(fullPath);
                        readDir(fullPath);
                    }
                }
            }
            readDir(dir);
            return results;
        } catch (error) {
            console.error(`Error scanning folders: ${error.message}`);
            return results;
        }
    }
};

const normalizePath = (dir) => {
    if (!dir) return '.';
    const normalizedDir = path.normalize(dir);
    const noTrailingSlash = normalizedDir.replace(/\/$/g, '');

    if (path.isAbsolute(normalizedDir))
        return '.' + path.sep + noTrailingSlash.substring(1);
    else
        return noTrailingSlash;
}

export default {
    normalizePath,
    fetchRoot,
    dirInspect,
    pathChecker,
    filterFiles,
    createSyncMap
};