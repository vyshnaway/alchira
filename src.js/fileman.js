import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(fileURLToPath(import.meta.url), "../..")

const FILEMAN = {
    PATH: {
        join: (pathString1, pathString2) => {
            return path.join(pathString1, pathString2)
        },
        fromRoot: (...pathString) => {
            return path.join(root, ...pathString)
        },
        available: async (pathString) => {
            try {
                const stats = await fs.promises.stat(pathString);
                return { exist: true, type: stats.isDirectory() ? "folder" : "file" };
            } catch (error) {
                if (error.code === 'ENOENT') {
                    return { exist: false, type: null };
                }
                console.error('Path check error:', error);
                throw error; // Rethrow unexpected errors
            }
        },
        ifFolder: async (pathString) => {
            return (await FILEMAN.PATH.available(pathString)).type === "folder"
        },
        ifFile: async (pathString) => {
            return (await FILEMAN.PATH.available(pathString)).type === "file"
        },
        isAncestor: (ancestor, descendant) => {
            const relative = path.relative(ancestor, descendant);
            return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
        },
        listFiles: async (dir, fileList = []) => {
            if (!fs.existsSync(dir)) return fileList;
            const files = await fs.promises.readdir(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stats = await fs.promises.stat(filePath);
                if (stats.isDirectory()) {
                    fileList = await FILEMAN.PATH.listFiles(filePath, fileList);
                } else {
                    fileList.push(filePath);
                }
            }
            return fileList;
        },
    },
    CLONE: {
        hard: async (source, destination, ignoreFiles = []) => {
            const copyRecursiveAsync = async (src, dest) => {
                const stats = await fs.promises.stat(src);
                if (stats.isDirectory()) {
                    await fs.promises.mkdir(dest, { recursive: true });
                    const children = await fs.promises.readdir(src);
                    for (const child of children) {
                        const childSrc = path.join(src, child);
                        const childDest = path.join(dest, child);
                        if (!ignoreFiles.includes(childSrc)) {
                            await copyRecursiveAsync(childSrc, childDest);
                        }
                    }
                } else if (!ignoreFiles.includes(src)) {
                    await fs.promises.copyFile(src, dest);
                }
            };

            if (!fs.existsSync(source)) throw new Error('target folder does not exist.\n' + source);
            await copyRecursiveAsync(source, destination);
        },
        safe: async (source, destination, ignoreFiles = []) => {
            const destinationFiles = fs.existsSync(destination)
                ? (await FILEMAN.PATH.listFiles(destination)).map(file => path.join(source, file.replace(destination, '')))
                : [];
            await FILEMAN.CLONE.hard(source, destination, [...ignoreFiles, ...destinationFiles]);
        },
    },
    READ: {
        file: async (target, online = false) => {
            try {
                if (online) {
                    const response = await fetch(target);
                    if (!response.ok) throw new Error();
                    return { status: true, data: await response.text() };
                } else {
                    if (!fs.existsSync(target)) throw new Error(`File does not exist: ${target}`);
                    const fileData = await fs.promises.readFile(target, 'utf8');
                    return { status: true, data: fileData };
                }
            } catch (error) {
                return { status: false, data: "" };
            }
        },
        json: async (target, online = false) => {
            try {
                if (online) {
                    const response = await fetch(target);
                    if (!response.ok) throw new Error();
                    return { status: true, data: await response.json() };
                } else {
                    if (!fs.existsSync(target)) throw new Error();
                    return {
                        status: true,
                        data: JSON.parse(
                            (await fs.promises.readFile(target, 'utf8'))
                                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
                                .replace(/^\s*\/\/.*$/gm, '')    // Remove line comments
                        )
                    };
                }

            } catch (error) {
                return { status: false, data: {} };
            }
        },
        bulk: async (target, extensions = []) => {
            const result = {};
            extensions = extensions.map(ext => '.' + ext);
            const files = await FILEMAN.PATH.listFiles(target);
            for (const file of files) {
                if (extensions.includes(path.extname(file)) || extensions.length === 0) {
                    result[file] = await fs.promises.readFile(file, 'utf-8');
                }
            }
            return result;
        },
    },
    WRITE: {
        file: async (filePath, content) => {
            try {
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) await fs.promises.mkdir(dir, { recursive: true });
                await fs.promises.writeFile(filePath, content, 'utf8');
            } catch (err) {
                console.error(`Error writing to file ${filePath}:`, err);
            }
        },
        json: async (pathString, object) => {
            try {
                const dir = path.dirname(pathString);
                if (!fs.existsSync(dir)) await fs.promises.mkdir(dir, { recursive: true });
                await fs.promises.writeFile(pathString, JSON.stringify(object, null, 2), 'utf8');
            } catch (err) {
                console.error(`Error writing JSON data to ${pathString}:`, err);
            }
        },
        bulk: async (fileContentArray) => {
            for (const [filePath, content] of fileContentArray) {
                await FILEMAN.WRITE.file(filePath, content);
            }
        },
    },
    SYNC: {
        file: async (url, path) => {
            const latest = await FILEMAN.READ.file(url, true);
            if (latest.status) {
                await FILEMAN.WRITE.file(path, latest.data);
                return latest.data
            }
            const current = await FILEMAN.READ.file(path);
            return (current.status) ? current.data : ""
        },
        json: async (url, path) => {
            const latest = await FILEMAN.READ.json(url, true);
            if (latest.status) {
                await FILEMAN.WRITE.json(path, latest.data);
                return latest.data
            }
            const current = await FILEMAN.READ.json(path);
            return (current.status) ? current.data : {}
        },
        bulk: async (source, target, extensions = []) => {
            const result = { status: true, fileContent: {}, syncMap: {} };
            extensions = extensions.map(ext => '.' + ext);

            if (!fs.existsSync(source) && !fs.existsSync(target)) {
                return { status: false, fileContent: {}, syncMap: {} }
            } else if (!fs.existsSync(source)) {
                await FILEMAN.CLONE.safe(target, source);
            } else if (!fs.existsSync(target)) {
                await FILEMAN.CLONE.safe(source, target);
            }

            const sourceFiles = FILEMAN.PATH.listFiles(source);
            const targetFiles = FILEMAN.PATH.listFiles(target);

            const relativeSourceFiles = (await sourceFiles).map(file => path.relative(source, file));
            const relativeTargetFiles = (await targetFiles).map(file => path.relative(target, file));

            for (const file of relativeTargetFiles) {
                if (!relativeSourceFiles.includes(file)) {
                    fs.promises.unlink(path.join(source, file));
                }
            }

            for (const file of relativeSourceFiles) {
                const sourceFilePath = path.join(source, file);
                const targetFilePath = path.join(target, file);
                result.syncMap[sourceFilePath] = targetFilePath;
                result.syncMap[targetFilePath] = sourceFilePath;

                if (!fs.existsSync(targetFilePath)) {
                    const sourceDirPath = path.dirname(sourceFilePath);
                    if (!fs.existsSync(sourceDirPath)) await fs.promises.mkdir(sourceDirPath, { recursive: true });
                }
                if (extensions.includes(path.extname(file))) {
                    result.fileContent[file] = await fs.promises.readFile(sourceFilePath, 'utf-8');
                } else {
                    await fs.promises.copyFile(sourceFilePath, targetFilePath);
                }
            }

            // Delete excess folders in source
            const targetFolders = (await targetFiles)
                .map(file => path.dirname(path.relative(source, file)))
                .filter((value, index, self) => self.indexOf(value) === index);

            for (const folder of targetFolders) {
                const targetFolderPath = path.join(target, folder);
                if (!fs.existsSync(targetFolderPath)) continue;
                const relativeFolder = path.relative(source, targetFolderPath);
                const sourceFolderPath = path.join(target, relativeFolder);
                if (!fs.existsSync(sourceFolderPath)) {
                    fs.promises.rm(targetFolderPath, { recursive: true, force: true });
                }
            }
            return result;
        },
    },
    DELETE: async (pathToDelete) => {
        try {
            if (fs.existsSync(pathToDelete)) {
                const stats = await fs.promises.stat(pathToDelete);
                if (stats.isDirectory()) {
                    await fs.promises.rm(pathToDelete, { recursive: true, force: true });
                } else {
                    await fs.promises.unlink(pathToDelete);
                }
                return { success: true, message: 'Path deleted successfully.' };
            }
            return { success: false, message: 'Path does not exist.' };
        } catch (error) {
            console.error('Error deleting path:', error);
            return { success: false, message: 'Error deleting path.' };
        }
    }
};

export default FILEMAN;

export async function CSSImport(filePathArray = []) {
    const processedFiles = new Set(filePathArray);

    async function process(cssContent) {
        let result = cssContent;
        for (const [match, filePath] of cssContent.matchAll(/@import\s+url\(["']?(.*?)["']?\);/g)) {
            if (!processedFiles.has(filePath) && filePath.endsWith('.css')) {
                const content = (await FILEMAN.READ.file(filePath)).data || '';
                processedFiles.add(filePath);
                result = result.replace(match, await process(content));
            }
        }
        return result;
    }

    return process(
        (await Promise.all(filePathArray.map(file => FILEMAN.READ.file(file))))
            .map(result => result.data || '')
            .join('\n')
    );
}