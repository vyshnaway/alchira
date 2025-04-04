import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const FILEMAN = {
    path: {
        ofRoot: () => {
            return path.resolve(fileURLToPath(import.meta.url), "../..")
        },
        availability: async (pathString) => {
            const result = { exist: false, type: null};
            try {
                const stats = await fs.promises.stat(pathString);
                result.exist = true;
                result.type = stats.isDirectory() ? "folder" : "file";
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    console.error('Path check error:', error);
                }
            }
            return result;
        },
        ifFolder: async (pathString) => {
            return (await FILEMAN.path.availability(pathString)).type === "folder";
        },
        ifFile: async (pathString) => {
            return (await FILEMAN.path.availability(pathString)).type === "file";
        },
        isAncestor: (ancestor, descendant) => {
            const relative = path.relative(ancestor, descendant);
            return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
        },
        delete: async (pathToDelete) => {
            try {
                if (fs.existsSync(pathToDelete)) {
                    const stats = await fs.promises.stat(pathToDelete);
                    if (stats.isDirectory()) {
                        await fs.promises.rm(pathToDelete, { recursive: true, force: true });
                    } else {
                        await fs.promises.unlink(pathToDelete);
                    }
                    return { success: true, message: 'Path deleted successfully.' };
                } else {
                    return { success: false, message: 'Path does not exist.' };
                }
            } catch (error) {
                console.error('Error deleting path:', error);
                return { success: false, message: 'Error deleting path.' };
            }
        }
    },
    getAllFiles: async (dir, fileList = []) => {
        if (!fs.existsSync(dir)) return fileList;
        const files = await fs.promises.readdir(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await fs.promises.stat(filePath);
            if (stats.isDirectory()) {
                fileList = await FILEMAN.getAllFiles(filePath, fileList);
            } else {
                fileList.push(filePath);
            }
        }
        return fileList;
    },
    cloneFolder: async (source, destination, ignoreFiles = []) => {
        try {
            if (!fs.existsSync(source)) {
                throw new Error('Source folder does not exist.\n' + source);
            }

            const copyRecursiveAsync = async (src, dest) => {
                const exists = fs.existsSync(src);
                const stats = exists && (await fs.promises.stat(src));
                const isDirectory = exists && stats.isDirectory();

                if (isDirectory) {
                    await fs.promises.mkdir(dest, { recursive: true });
                    const children = await fs.promises.readdir(src);
                    for (const childItemName of children) {
                        const childSrcPath = path.join(src, childItemName);
                        const childDestPath = path.join(dest, childItemName);
                        if (!ignoreFiles.includes(childSrcPath)) {
                            await copyRecursiveAsync(childSrcPath, childDestPath);
                        }
                    }
                } else {
                    if (!ignoreFiles.includes(src)) {
                        await fs.promises.copyFile(src, dest);
                    }
                }
            };

            await copyRecursiveAsync(source, destination);
        } catch (err) {
            console.error(err);
        }
    },
    safeCloneFolder: async (source, destination, ignoreFiles = []) => {
        const destinationFiles = fs.existsSync(destination)
            ? (await FILEMAN.getAllFiles(destination)).map(file => path.join(source, file.replace(destination, '')))
            : [];
        const updatedIgnoreFiles = [...ignoreFiles, ...destinationFiles];
        await FILEMAN.cloneFolder(source, destination, updatedIgnoreFiles);
    },
    getFilesAndSync: async (target, extensions = [], source) => {
        const result = { fileContent: {}, syncMap: {} };
        extensions.map(ext => '.' + ext)

        if (source === undefined) {
            const files = await FILEMAN.getAllFiles(target);
            for (const file of files) {
                if (extensions.includes(path.extname(file)) || extensions.length === 0) {
                    result.fileContent[file] = await fs.promises.readFile(file, 'utf-8');
                }
            }
            return result;
        }

        if (!fs.existsSync(target)) await fs.promises.mkdir(target, { recursive: true });
        if (!fs.existsSync(source)) await fs.promises.mkdir(source, { recursive: true });

        const targetFiles = await FILEMAN.getAllFiles(target);
        const sourceFiles = await FILEMAN.getAllFiles(source);

        const relativeTargetFiles = targetFiles.map(file => path.relative(target, file));
        const relativeSourceFiles = sourceFiles.map(file => path.relative(source, file));

        // Delete excess files in source
        for (const file of relativeSourceFiles) {
            if (!relativeTargetFiles.includes(file)) {
                const sourceFilePath = path.join(target, file);
                await fs.promises.unlink(sourceFilePath);
            }
        }

        for (const file of relativeTargetFiles) {
            const targetFilePath = path.join(target, file);
            const sourceFilePath = path.join(source, file);
            result.syncMap[targetFilePath] = sourceFilePath;
            result.syncMap[sourceFilePath] = targetFilePath;

            if (!fs.existsSync(sourceFilePath)) {
                const targetDirPath = path.dirname(targetFilePath);
                if (!fs.existsSync(targetDirPath)) await fs.promises.mkdir(targetDirPath, { recursive: true });
            }
            if (extensions.includes(path.extname(file))) {
                result.fileContent[path.join(source, file)] = await fs.promises.readFile(targetFilePath, 'utf-8');
            } else {
                await fs.promises.copyFile(targetFilePath, sourceFilePath);
            }
        }

        // Delete excess folders in target
        const sourceFolders = sourceFiles
            .map(file => path.dirname(path.relative(target, file)))
            .filter((value, index, self) => self.indexOf(value) === index);

        for (const folder of sourceFolders) {
            const sourceFolderPath = path.join(source, folder);
            if (!fs.existsSync(sourceFolderPath)) continue;
            const relativeFolder = path.relative(target, sourceFolderPath);
            const targetFolderPath = path.join(source, relativeFolder);

            if (!fs.existsSync(targetFolderPath)) {
                await fs.promises.rm(sourceFolderPath, { recursive: true, force: true });
            }
        }

        return result;
    },
    writeToFile: async (filePath, content) => {
        try {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                await fs.promises.mkdir(dir, { recursive: true });
            }
            await fs.promises.writeFile(filePath, content, 'utf8');
        } catch (err) {
            console.error(`Error writing to file ${filePath}:`, err);
        }
    },
    bulkWriteFiles: async (fileContentArray) => {
        for (const fileContent of fileContentArray) {
            await FILEMAN.writeToFile(fileContent[0], fileContent[1]);
        }
    },
    JSON: {
        readData: async (pathString) => {
            try {
                if (!fs.existsSync(pathString)) {
                    throw new Error(`File does not exist: ${pathString}`);
                }
                const data = JSON.parse(await fs.promises.readFile(pathString, 'utf8'));
                return { status: true, data };
            } catch (err) {
                // console.error(`Error reading JSON data from ${filePath}:`, err);
                return { status: false, data: null };
            }
        },
        writeFile: async (pathString, object) => {
            try {
                const dir = path.dirname(pathString);
                if (!fs.existsSync(dir)) {
                    await fs.promises.mkdir(dir, { recursive: true });
                }
                await fs.promises.writeFile(pathString, JSON.stringify(object, null, 2), 'utf8');
            } catch (err) {
                console.error(`Error writing JSON data to ${pathString}:`, err);
            }
        },
        fetchData: async (source) => {
            try {
                const response = await fetch(source);
                if (!response.ok) {
                    return { status: false, data: null };
                }
                const data = await response.json();
                return { status: true, data };
            } catch (error) {
                // console.error(`Error fetching JSON data from ${source}:`, error);
                return { status: false, data: null };
            }
        }
    }
}

export default FILEMAN;