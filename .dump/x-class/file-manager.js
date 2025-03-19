import fs from 'fs'

export const parseListFile = (filePath) => {
    try {
        const ignoreContent = fs.readFileSync(filePath, 'utf8');
        return ignoreContent.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    } catch (err) {
        return [];
    }
};

export const cloneFolder = (source, destination, ignoreFiles = []) => {
    try {
        if (!fs.existsSync(source)) {
            throw new Error('Source folder does not exist');
        }

        const copyRecursiveSync = (src, dest) => {
            const exists = fs.existsSync(src);
            const stats = exists && fs.statSync(src);
            const isDirectory = exists && stats.isDirectory();

            if (isDirectory) {
                fs.mkdirSync(dest, { recursive: true });
                fs.readdirSync(src).forEach(childItemName => {
                    const childSrcPath = `${src}/${childItemName}`;
                    const childDestPath = `${dest}/${childItemName}`;
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
        console.log(`Folder cloned from ${source} to ${destination}`);
    } catch (err) {
        console.error(err);
    }
};

export const safeCloneFolder = (source, destination) => {
    const ignoreFiles = getAllFiles(destination).map(file => file.replace(destination, source));
    cloneFolder(source, destination, ignoreFiles);
};

export const syncDirectory = (source, destination, ignoreFiles) => {
    const deleteExtraneousFiles = (src, dest, ignoreFiles) => {
        const srcFiles = getAllFiles(src).map(file => file.replace(`${src}/`, ''));
        const destFiles = getAllFiles(dest).map(file => file.replace(`${dest}/`, ''));

        destFiles.forEach(file => {
            if (!srcFiles.includes(file) && !ignoreFiles.includes(`${dest}/${file}`)) {
                const filePath = `${dest}/${file}`;
                if (fs.statSync(filePath).isDirectory()) {
                    fs.rmdirSync(filePath, { recursive: true });
                } else {
                    fs.unlinkSync(filePath);
                }
                console.log(`Deleted: ${filePath}`);
            }
        });
    };

    deleteExtraneousFiles(source, destination, ignoreFiles);
    // safeCloneFolder(source, destination, ignoreFiles);
};

export const writeToFile = (filePath, content) => {
    try {
        const dir = filePath.substring(0, filePath.lastIndexOf('/'));
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Content written to ${filePath}`);
    } catch (err) {
        console.error(err);
    }
};

export const mergeFiles = (files, join = "\n") => {
    return files.reduce((acc, file) => {
        return acc + fs.readFileSync(file, 'utf8') + join;
    }, '');
};

export const getAllFiles = (dirPath, arrayOfFiles = []) => {
    try {
        const files = fs.readdirSync(dirPath);

        files.forEach(file => {
            const filePath = `${dirPath}/${file}`;
            if (fs.statSync(filePath).isDirectory()) {
                getAllFiles(filePath, arrayOfFiles);
            } else {
                arrayOfFiles.push(filePath);
            }
        });

        return arrayOfFiles;
    } catch (err) {
        return arrayOfFiles;
    }
};

export const clearDirectory = (dirPath, delDir = false) => {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
            const currentPath = `${dirPath}/${file}`;
            if (fs.lstatSync(currentPath).isDirectory()) {
                clearDirectory(currentPath);
            } else {
                fs.unlinkSync(currentPath);
            }
        });

        if (delDir) {
            // fs.rmdirSync(dirPath);
        }
    } else {
        console.log(`Directory ${dirPath} does not exist.`);
    }
};

export const fileProcessor = (source, file, opChart = [], parseIgnore = []) => {
    console.log(opChart)
    let updatedContent;
    const content = fs.readFileSync(file, 'utf8');

    opChart.forEach(op => {
        updatedContent = content;
        if (!parseIgnore.includes(file)) {
            updatedContent = op.contentCallback(content);
        }
        writeToFile(file.replace(source, op.destination), updatedContent);
    })
}

export const mergeFolderFiles = (dirPath, join = " ", destination = "") => {
    const files = getAllFiles(dirPath);
    const content = mergeFiles(files, join);
    console.log(files)
    if (destination !== "") writeToFile(destination, content)
    return content;
}

export const jsonFilesToObjects = (files) => {
    return files.map(file => {
        try {
            const content = fs.readFileSync(file, 'utf8');
            return JSON.parse(content);
        }
        catch (err) {
            return {};
        }
    });
};

////// Developer Functions //////

export const runLoadSetup = (dirMap) => {
    dirMap.forEach((map) => {
        safeCloneFolder(map.source, map.destination);
    })
}

export const runInitialize = (dirMap = []) => {
    dirMap.forEach((map) => {
        safeCloneFolder(map.source, map.destination);
    })
};

export const runReInitiate = (dirMap) => {
    dirMap.forEach((map) => {
        cloneFolder(map.destination, map.source);
    })
}

export const runDeveloper = (dirMap, cloneIgnore, parseIgnore, contentCallback) => {

    const watchOptions = {
        persistent: true, // Keep the process running as long as files are being watched
        recursive: false, // Watch all subdirectories (only supported on macOS and Windows)
        encoding: 'utf8'  // Encoding to use for the filename argument
    };
    cloneIgnore = parseListFile(cloneIgnore);
    parseIgnore = parseListFile(parseIgnore);

    dirMap.forEach((map) => {
        const destination = map.source;
        const source = map.destination;

        const opFiles = getAllFiles(source).filter(file => !cloneIgnore.find(ignore => file.includes(ignore)))

        opFiles.forEach(file => {
            const changeWatcher = fs.watch(file, options, (change) => {
                let content = fs.readFileSync(file, 'utf8');
                content = contentCallback(content);
                writeToFile(file.replace(source, destination), content);
            });
            const nameWatcher = fs.watch(file, options, (rename) => {
                changeWatcher.close()
                nameWatcher.close();
            });
        });
    })
};

export const runBuild = (dirMap, contentCallback, cloneIgnore, parseIgnore, opMaps = []) => {
    cloneIgnore = parseListFile(cloneIgnore);
    parseIgnore = parseListFile(parseIgnore);
    console.log(contentCallback());
    dirMap.forEach((map) => {
        const destination = map.source;
        const source = map.destination;
        const opFiles = getAllFiles(source).filter(file => !cloneIgnore.find(ignore => file.includes(ignore)))
        syncDirectory(source, destination, cloneIgnore);
        opFiles.forEach(file => {
            fileProcessor(source, file, [
                { destination, contentCallback },
                ...opMaps
            ], parseIgnore)
        });
    })
}
