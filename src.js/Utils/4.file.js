import fs from 'fs';
import path from 'path';

// Single object containing all optimized functions
const fileUtils = {
    remove: {
        Folders: (directory = '.', folders = [], invert = false) => {
            const folderSet = new Set(folders);
            const items = fs.readdirSync(directory, { withFileTypes: true });
            const directories = items.filter(item => item.isDirectory()).map(dir => dir.name);

            const foldersToDelete = invert
                ? directories.filter(dir => !folderSet.has(dir))
                : directories.filter(dir => folderSet.has(dir));

            foldersToDelete.forEach(folder => {
                const folderPath = path.join(directory, folder);
                fs.rmSync(folderPath, { recursive: true, force: true });
                console.log(`Deleted folder: ${folderPath}`);
            });
        },

        Files: (files = [], directory = '.', invert = false) => {
            const fileSet = new Set(files);
            const items = fs.readdirSync(directory, { withFileTypes: true });
            const fileNames = items.filter(item => item.isFile()).map(file => file.name);

            const filesToDelete = invert
                ? fileNames.filter(file => !fileSet.has(file))
                : fileNames.filter(file => fileSet.has(file));

            filesToDelete.forEach(file => {
                const filePath = path.join(directory, file);
                fs.unlinkSync(filePath);
                console.log(`Deleted file: ${filePath}`);
            });
        },
    },

    getFilesInDirectory: (source, prefixSource = true) => {
        try {
            console.log(source);
            const items = fs.readdirSync(source, { withFileTypes: true });
            return items
                .filter(item => item.isFile())
                .map(item => (prefixSource ? path.join(source, item.name) : item.name));
        } catch (err) {
            return [];
        }
    },

    getAllFilesInDirectory: (source, prefixSource = true, arrayOfFiles = []) => {
        if (!fs.existsSync(source)) {
            return [];
        }

        const items = fs.readdirSync(source, { withFileTypes: true });

        items.forEach(item => {
            const fullPath = path.join(source, item.name);
            if (item.isDirectory()) {
                fileUtils.getAllFilesInDirectory(fullPath, prefixSource, arrayOfFiles);
            } else {
                arrayOfFiles.push(prefixSource ? fullPath : item.name);
            }
        });
        return arrayOfFiles;
    },

    getPathsInDirectory: {
        files: (dir) => {
            try {
                const items = fs.readdirSync(dir, { withFileTypes: true });
                return items.filter(item => item.isDirectory()).map(item => item.name);
            } catch (error) {
                console.error(`Error reading directory: ${error.message}`);
                return [];
            }
        },

        folders: (dir) => {
            let results = [];

            function readDir(directory) {
                const items = fs.readdirSync(directory, { withFileTypes: true });
                items.forEach(item => {
                    if (item.isDirectory()) {
                        const fullPath = path.join(directory, item.name);
                        results.push(fullPath);
                        readDir(fullPath);
                    }
                });
            }
            readDir(dir);
            return results;
        },
    },

    readFromFile: (filePath) => {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (err) {
            console.error(err);
            return null;
        }
    },

    renameFolderIfExists: (oldFolderPath, newFolderName) => {
        try {
            const parentDir = path.dirname(oldFolderPath);
            const newFolderPath = path.join(parentDir, newFolderName);
            fs.renameSync(oldFolderPath, newFolderPath);
        } catch (error) {
            console.error(`Error renaming folder: ${error.message}`);
        }
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

    mergeFiles: (files = [], destination = "", join = "\n") => {
        const contents = files.map(file => fileUtils.readFromFile(file));
        if (destination !== "") fileUtils.writeToFile(destination, contents.join(join));
        return contents;
    },

    mergeFilesInDirectory: (dirPath, ignoreHidden = false, destination = "", join = "\n") => {
        let files = fileUtils.getFilesInDirectory(dirPath);
        if (ignoreHidden) files = files.filter(file => !file.includes('/.'));
        const content = fileUtils.mergeFiles(files, destination, join);
        return content;
    },

    clearDirectory: (dirPath, delDir = true) => {
        if (fs.existsSync(dirPath)) {
            fs.readdirSync(dirPath).forEach((file) => {
                const currentPath = path.join(dirPath, file);
                if (fs.lstatSync(currentPath).isDirectory()) {
                    fs.rmSync(currentPath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(currentPath);
                }
            });

            if (delDir) {
                fs.rmdirSync(dirPath);
            }
        }
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
            ? fileUtils.getAllFilesInDirectory(destination).map(file => path.join(source, file.replace(destination, '')))
            : [];
        const updatedIgnoreFiles = [...ignoreFiles, ...destinationFiles];
        fileUtils.cloneFolder(source, destination, updatedIgnoreFiles);
    },

    syncDirectory: (source, destination, ignoreFiles = []) => {
        const deleteExtraneousFiles = (src, dest, ignoreFilesList) => {
            const srcFiles = new Set(fileUtils.getFilesInDirectory(src).map(file => path.basename(file)));
            const destFiles = fileUtils.getFilesInDirectory(dest).map(file => path.basename(file));

            destFiles.forEach(file => {
                if (!srcFiles.has(file) && !ignoreFilesList.includes(path.join(dest, file))) {
                    const filePath = path.join(dest, file);
                    if (fs.statSync(filePath).isDirectory()) {
                        fs.rmSync(filePath, { recursive: true, force: true });
                    } else {
                        fs.unlinkSync(filePath);
                    }
                }
            });
        };

        deleteExtraneousFiles(source, destination, ignoreFiles);
        // fileUtils.safeCloneFolder(source, destination, ignoreFiles); // Uncomment to enable cloning
    },
};

// Export the entire object as default
export default fileUtils;