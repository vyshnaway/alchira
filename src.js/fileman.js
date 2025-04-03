import fs, { read, write } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

async function checkPath(pathStr, checkFn) {
    try {
        const stats = await fs.promises.stat(pathStr);
        return checkFn(stats);
    } catch (error) {
        if (error.code === 'ENOENT') return false;
        console.error('Path check error:', error);
        return false;
    }
}


const FILEMAN = {
    path: {
        ofRoot: () => {
            return path.resolve(fileURLToPath(import.meta.url), "../..")
        },
        isFolder: async (folderPath) => {
            return checkPath(folderPath, stats => stats.isDirectory());
        },
        isFile: async (filePath) => {
            return checkPath(filePath, stats => stats.isFile());
        },
        isAncestor: (ancestor, descendant) => {
            const relative = path.relative(ancestor, descendant);
            return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
        }
    },
    getAllFiles: (dir, fileList = []) => {
        if (!fs.existsSync(dir)) return fileList;
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                fileList = FILEMAN.getAllFiles(filePath, fileList);
            } else {
                fileList.push(filePath);
            }
        });
        return fileList;
    },
    cloneFolder: (source, destination, ignoreFiles = []) => {
        try {
            if (!fs.existsSync(source)) {
                throw new Error('Source folder does not exist.\n' + source);
            }

            const copyRecursiveSync = (src, dest) => {
                const exists = fs.existsSync(src);
                const stats = exists && fs.statSync(src);
                const isDirectory = exists && stats.isDirectory();

                if (isDirectory) {
                    fs.mkdirSync(dest, { recursive: true });
                    fs.readdirSync(src).forEach(childItemName => {
                        const childSrcPath = path.join(src, childItemName);
                        const childDestPath = path.join(dest, childItemName);
                        if (!ignoreFiles.includes(childSrcPath)) {
                            copyRecursiveSync(childSrcPath, childDestPath);
                        }
                    });
                } else {
                    if (!ignoreFiles.includes(src)) {
                        fs.copyFileSync(src, dest);
                    }
                }
            };

            copyRecursiveSync(source, destination);
        } catch (err) {
            console.error(err);
        }
    },
    safeCloneFolder: (source, destination, ignoreFiles = []) => {
        const destinationFiles = fs.existsSync(destination)
            ? FILEMAN.getAllFiles(destination).map(file => path.join(source, file.replace(destination, '')))
            : [];
        const updatedIgnoreFiles = [...ignoreFiles, ...destinationFiles];
        FILEMAN.cloneFolder(source, destination, updatedIgnoreFiles);
    },
    getFilesAndSync: (target, extensions = [], source) => {
        const result = { fileContent: {}, syncMap: {} };

        if (source === undefined) {
            FILEMAN.getAllFiles(target).forEach((file) => {
                if (extensions.includes(path.extname(file)) || (extensions.length === 0))
                    result.fileContent[file] = fs.readFileSync(file, 'utf-8')
            })
            return result;
        }

        if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
        if (!fs.existsSync(source)) fs.mkdirSync(source, { recursive: true });

        const targetFiles = FILEMAN.getAllFiles(target);
        const sourceFiles = FILEMAN.getAllFiles(source);

        const relativeTargetFiles = targetFiles.map(file => path.relative(target, file));
        const relativeSourceFiles = sourceFiles.map(file => path.relative(source, file));

        // Delete excess files in source
        relativeSourceFiles.forEach(file => {
            if (!relativeTargetFiles.includes(file)) {
                const sourceFilePath = path.join(target, file);
                fs.unlinkSync(sourceFilePath);
            }
        });


        relativeTargetFiles.forEach(file => {
            const targetFilePath = path.join(target, file);
            const sourceFilePath = path.join(source, file);
            result.syncMap[targetFilePath] = sourceFilePath;
            result.syncMap[sourceFilePath] = targetFilePath;

            if (!fs.existsSync(sourceFilePath)) {
                const targetDirPath = path.dirname(targetFilePath);
                if (!fs.existsSync(targetDirPath)) fs.mkdirSync(targetDirPath, { recursive: true });
            }
            if (extensions.includes(path.extname(file))) {
                result.fileContent[path.join(source, file)] = fs.readFileSync(targetFilePath, 'utf-8');
            } else {
                fs.copyFileSync(targetFilePath, sourceFilePath);
            }
        });

        // Delete excess folders in target
        const sourceFolders = sourceFiles
            .map(file => path.dirname(path.relative(target, file)))
            .filter((value, index, self) => self.indexOf(value) === index);

        sourceFolders.forEach(folder => {
            const sourceFolderPath = path.join(source, folder);
            if (!fs.existsSync(sourceFolderPath)) return;
            const relativeFolder = path.relative(target, sourceFolderPath);
            const targetFolderPath = path.join(source, relativeFolder);

            if (!fs.existsSync(targetFolderPath)) {
                fs.rmSync(sourceFolderPath, { recursive: true, force: true });
            }
        });

        return result;
    },
    writeToFile: (filePath, content) => {
        try {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(filePath, content, 'utf8');
        } catch (err) {
            console.error(`Error writing to file ${filePath}:`, err);
        }
    },
    bulkWriteFiles: (fileContentArray) => {
        fileContentArray.forEach(fileContent => FILEMAN.writeToFile(fileContent[0], fileContent[1]))
    },
    readJsonData: async (filePath) => {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`File does not exist: ${filePath}`);
            }
            const data = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
            return { status: true, data };
        } catch (err) {
            // console.error(`Error reading JSON data from ${filePath}:`, err);
            return { status: false, data: null };
        }
    },
    writeJsonFile: async (filePath, object) => {
        try {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                await fs.promises.mkdir(dir, { recursive: true });
            }
            await fs.promises.writeFile(filePath, JSON.stringify(object, null, 2), 'utf8');
        } catch (err) {
            console.error(`Error writing JSON data to ${filePath}:`, err);
        }
    },
    fetchJsonData: async (source) => {
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

export default FILEMAN;