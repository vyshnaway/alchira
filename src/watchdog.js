import fs from 'fs';
import path from 'path';

export default function WATCHDOG(directories = [], callbackFuntion) {
    // if (!Array.isArray(directories) || directories.length === 0 || typeof callbackFuntion !== 'function') {
    //     console.error("Error: Invalid arguments");
    //     return;
    // }

    const resolvedDirs = directories.map(dir => path.resolve(dir));
    // console.log(`Watching directories: ${resolvedDirs.join(', ')}`);

    resolvedDirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            console.error(`Error: Directory ${dir} does not exist`);
            return;
        }
        try {
            fs.accessSync(dir, fs.constants.R_OK);
        } catch (error) {
            console.error(`Error: No read access to ${dir}: ${error.message}`);
            return;
        }

        try {
            const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
                const fullPath = filename ? path.join(dir, filename) : dir;
                callbackFuntion(eventType, fullPath);
            });
            watcher.on('error', (error) => console.error(`Watcher error for ${dir}: ${error.message}`));
        } catch (error) {
            console.error(`Error setting up watcher for ${dir}: ${error.message}`);
        }

        // let lastStats = {};
        setInterval(() => {
            fs.readdir(dir, { withFileTypes: true }, (err, files) => {
                if (err) {
                    console.error(`Polling error reading ${dir}: ${err.message}`);
                    return;
                }

                const currentStats = {};
                files.forEach(file => {
                    const fullPath = path.join(dir, file.name);
                    try {
                        currentStats[fullPath] = fs.statSync(fullPath).mtimeMs;
                    } catch (error) {
                        console.error(`Stat error for ${fullPath}: ${error.message}`);
                    }
                });

                Object.keys(lastStats).forEach(file => {
                    if (!currentStats[file]) callbackFuntion('delete', file);
                });
                Object.keys(currentStats).forEach(file => {
                    if (!lastStats[file]) callbackFuntion('add', file);
                    else if (lastStats[file] !== currentStats[file]) callbackFuntion('change', file);
                });

                lastStats = { ...currentStats };
            });

            fs.readdir(dir, { withFileTypes: true }, (err, files) => {
                if (err) return;
                files.forEach(file => {
                    if (file.isDirectory()) {
                        const subDir = path.join(dir, file.name);
                        if (!resolvedDirs.includes(subDir)) WATCHDOG([subDir], callbackFuntion);
                    }
                });
            });
        }, 1000);
    });
}
