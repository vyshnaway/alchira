import $ from './docshell/package.js';
import {
    pathExists,
    hostHtmlFile,
    cloneFolder,
    isAncestorDir,
    safeCloneFolder,
    getFilesInDirectory,
    writeToFile,
    JSONCparse,
    readFromFile,
    fetchRoot
} from './file-manager.js';
import {
    config,
    initConfig,
    buildConfig
} from './config.js';
import path from 'path';
import { error } from 'console';

const start = async () => {

    const modifyPackageJson = (packageJsonOfxClass, packageJsonOfDestination) => {
        const target = packageJsonOfDestination
        const targetConfig = JSON.parse(readFromFile(target));
        const xClassScripts = {
            ...JSON.parse(readFromFile(packageJsonOfxClass)).scripts,
            install: `npm install -g ${config.name}`,
        }
        for (const key in xClassScripts)
            if (["install", "dev", "preview", "build"].includes(key))
                targetConfig.scripts[`${config.cmd}-${key}`] = xClassScripts[key]
        const modifiedJson = JSON.stringify(targetConfig, null, 2)
        writeToFile(target, modifiedJson)
    }

    const packageJsonOfxClass = path.join(config.root, 'package.json');
    const packageJsonOfDestination = path.join(config.path, 'package.json');

    if (await pathExists.file(packageJsonOfDestination)) {

        $.TASK('Adding additional scripts to project');
        modifyPackageJson(packageJsonOfxClass, packageJsonOfDestination)
    }
    $.TASK(`Cloning template to: ./${config.setup}`)
    cloneFolder(config.template, config.setup);

    return { heading: 'Initialized setup.' }

}

const dev = async (dir, frame = false) => {

}

const preview = async (dir, frame = false) => {

}

const build = async (dir, frame = false) => {
    await start(dir);
    run.build(await buildConfig(dir));


}

const docs = async (port) => {
    hostHtmlFile(config.browser, port)
    return `${config.name}-docs @ http://localhost:${port}`
}

const executor = async (args) => {
    const mapDataVerify = (dirMap) => {
        let response = {
            status: true,
            errors : []
        }
        if (!Array.isArray(dirMap)) {
            response.status = false
            response.errors.push(config.dirMap + ' is not an Array');
            return response
        }
        if (dirMap.length === 0) {
            response.status = false;
            response.errors.push('Configure atleast one Directory-map to continue.');
            return response
        }
        for (const item of dirMap) {
            if (typeof item !== 'object' || item === null){
                response.status = false;
                response.errors.push('Items in Array must be an object with valid entries.');
                return response
            }
            if (typeof item.source !== 'string') {
                response.status = false;
                response.errors.push("source : "+item.source + ' not a string.');
                return response
            }
            if (typeof item.target !== 'string') {
                response.status = false;
                response.errors.push("target : " +item.target + ' not a string.');
                return response
            }
            if (typeof item.globalCss !== 'string') {
                response.status = false;
                response.errors.push("globalCss : " +item.globalCss + ' not a string.');
                return response
            }
            if (typeof item.targetExtensions !== 'object' || item.targetExtensions === null || Array.isArray(item.targetExtensions)) {
                response.status = false;
                response.errors.push("targetExtensions : " + item.targetExtensions + ' not an object');
                return response
            }

            for (const key in item.targetExtensions) {
                if (typeof item.targetExtensions[key] !== 'object') {
                    response.status = false;
                    response.errors.push("targetExtensions : " + key + ' : ' + item.targetExtensions[key] + ' not an object');
                    return response
                }
            }
        }

        return response;
    }


    const dirMapCheck = (dirMaps) => {
        let errorMatches = [], message = { heading: 'Subfolder or duplicate, "source" or "target" path:' };

        dirMaps.reduce((acc, map) => {
            const checkConflicts = (key) => {
                const pathInvalid = /^[\.\/]/.test(map[key]) || /\/$/.test(map[key])
                const normalPath = path.resolve(map[key])
                let conflitFlag = true;
                if (pathInvalid) {
                    errorMatches.push(`${key}: "${map[key]}" invalid path detected`);
                    conflitFlag = true
                } else {
                    conflitFlag = acc.reduce((hasConflict, dir) => {
                        const isConflict = isAncestorDir(dir, normalPath) || isAncestorDir(normalPath, dir) || (path.resolve(dir) === normalPath);
                        if (isConflict) {
                            errorMatches.push(`${key}: "${map[key]}" overlaps with "${dir}"`);
                            return true;
                        }
                        return hasConflict;
                    }, false);
                }
                return conflitFlag
            }
            const sourceConflict = checkConflicts('source');
            if (!sourceConflict) acc.push(map.source);

            const targetConflict = checkConflicts('target');
            if (!targetConflict) acc.push(map.target);

            return acc;
        }, []);
        if (errorMatches.length) {
            message.contents = errorMatches
        }
        return { status: !errorMatches.length, message }
    }
    const dirMapPathCheck = async (dirMaps) => {
        const errorMatches = [];
        for (const map of dirMaps) {
            try {
                if (!(await pathExists.folder(map.source)))
                    errorMatches.push(`source: "${map.source}" directory not found.`);

                const globalCssPath = path.join(map.source, map.globalCss);
                const isCssFile = path.extname(map.globalCss) === '.css';
                const cssFileExists = await pathExists.file(globalCssPath);

                if (!cssFileExists || !isCssFile)
                    errorMatches.push(`source: "${map.source}" -> "${map.globalCss}" stylesheet invalid or unavailable.`);
            } catch (error) {
                console.error(`Error processing map: ${map.globalCss}`, error);
            }
        }

        if (errorMatches.length) {
            const message = { heading: 'Path not found:\n', errorMatches };
            return { status: false, message };
        }
        return { status: true, message };
    };
    const dirValidity = async (setupFound) => {
        let
            message,
            dirMap = [],
            errors = [],
            validity = 0,
            jsonFound = false,
            jsonValid = false,
            mapsFound = false,
            mapsValid = false,
            pathsValid = false

        if (!setupFound) message = config.setup + ' undefined.'
        else {
            $.TASK('Searching for ' + config.dirMap)
            validity++;
            jsonFound = await pathExists.file(config.dirMap);
        }
        if (!jsonFound) message = config.dirMap + ' not found.'
        else {
            $.TASK('Reading ' + config.dirMap)
            validity++;
            dirMap = await JSONCparse(config.dirMap);
            jsonValid = Boolean(dirMap);
        }
        if (!jsonValid) message = `${config.dirMap} : Bad *.jsonc file`
        else {
            $.TASK('Checking  ' + config.dirMap)
            validity++
            const response = mapDataVerify(dirMap)
            $.POST(dirMap)
        }
        // if (!dataValid) message = `Invalid data in ${config.dirMap}`
        // else {

        // }
        // if (mapsFound) {
        //     message = `Invalid definitions in ${config.dirMap}`
        //     validity++;
        //     const response = dirMapValidity(dirMap)
        //     mapsValid = Boolean(dirMap);
        // }
        // if (mapsValid) {
        //     validity++
        //     const response = await mapPathVerify(dirMap)
        //     dataValid = true;
        // }
        // if (pathsValid) {
        //     message = `Unavailable directoris specified in ${config.dirMap}`
        //     validity++
        //     pathsValid = response.status;
        //     message = response.message
        // }

        console.log({
            setupFound,
            jsonFound,
            jsonValid,
            mapsFound,
            mapsValid,
            pathsValid,
        })

        if (pathsValid) config.dirMaps = dirMap;
        return { start: (validity === 0), proceed: (validity === 6), message, errors }
    }
    const normalizePath = (dir) => {
        if (!dir) return '.';
        const normalizedDir = path.normalize(dir);
        const noTrailingSlash = normalizedDir.replace(/\/$/g, '');

        if (path.isAbsolute(normalizedDir))
            return '.' + path.sep + noTrailingSlash.substring(1);
        else
            return noTrailingSlash;
    }

    const begin = async () => {
        await initConfig(await fetchRoot(), normalizePath(args[3]));

        $.TASK('Searching for ' + config.setup)
        return await dirValidity(await pathExists.folder(config.setup))
    }

    const cmd = args[2];
    let exitMessage, cmdListHead = `${config.name}/${config.cmd} @ ` + config.version

    if (cmd === 'start') {
        await $.PLAY.Title(config.name + ' : Initialize', 500)
        const validity = await begin();
        if (validity.start) {
            $.TASK('Importing setup to directory')
            await start()
            exitMessage = $.compose.success.Footer('Initialized setup.');
        } else exitMessage = $.compose.failed.Footer(validity.message, validity.errors)
    }
    else if (['dev', 'preview', 'build'].includes(cmd)) {
        let report, validity;
        switch (cmd) {
            case 'dev':
                $.POST($.compose.std.Chapter(config.name + ' : Active Runtime'));
                validity = await begin();
                if (validity.start) {
                    report = await dev()
                }
                break;

            case 'preview':
                $.POST($.compose.std.Chapter(config.name + ' : Preview Build'));
                validity = await begin();
                if (validity.start)
                    await preview()
                break;

            case 'build':
                $.POST($.compose.std.Chapter(config.name + ' : Build Project'))
                validity = await begin();
                if (validity.start)
                    report = await build()
                break;
        }
        if (validity.proceed) {
            exitMessage = report.status ?
                $.compose.success.Section(report.message, report.blocks) :
                $.compose.failed.Section(report.message, report.blocks);
        } else exitMessage = $.compose.failed.Footer(validity.message, validity.errors)
    }
    else {
        if (cmd === 'docs') {
            cmdListHead = await docs(isNaN(args[3]) ? 1248 : args[3]);
            exitMessage = $.compose.failed.Footer('[ ctrl + C ] to terminate.');
        } else exitMessage = $.compose.std.Footer('Available Commands.');
        exitMessage = [$.compose.std.Section(cmdListHead, config.activeCommands, $.list.std.Props), exitMessage].join('\n')
    }

    $.POST('\n' + exitMessage)
}

export default executor;
