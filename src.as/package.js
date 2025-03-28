import $ from './shell-docs/package.js';
import {
    pathExists,
    hostHtmlFile,
    isAncestorDir,
    safeCloneFolder,
    writeToFile,
    JSONCparse,
    readFromFile,
    fetchRoot
} from './4.utils.js';
import {
    config,
    initConfig,
    buildConfig,
    buildShorthands
} from './1.config.js';
import run from './0.core.js';
import path from 'path';

const start = async () => {

    const modifyPackageJson = (packageJsonOfxClass, packageJsonOfDestination) => {
        const target = packageJsonOfDestination
        const targetConfig = JSON.parse(readFromFile(target));
        const xClassScripts = {
            ...JSON.parse(readFromFile(packageJsonOfxClass)).scripts,
            install: `npm install -g ${config.name}@${config.version}`,
        }
        for (const key in xClassScripts)
            if (["install", "dev", "preview", "build"].includes(key))
                targetConfig.scripts[`${config.cmd}-${key}`] = targetConfig.scripts[`${config.cmd}-${key}`] ?? xClassScripts[key]
        const modifiedJson = JSON.stringify(targetConfig, null, 2)
        writeToFile(target, modifiedJson)
    }


    const packageJsonOfxClass = path.join(config.root, 'package.json');
    const packageJsonOfDestination = path.join(config.path, 'package.json');

    if (await pathExists.file(packageJsonOfDestination)) {
        $.TASK('Adding additional scripts to project');
        modifyPackageJson(packageJsonOfxClass, packageJsonOfDestination)
    }
    $.TASK(`Cloning template to: ./${config.setup}`);

    safeCloneFolder(config.template, config.setup);
}

const dev = async () => {
    const response = run.dev();
    return {
        status: true,
        message: "",
        reports: []
    }
}

const preview = async () => {
    const response = run.preview();
    return {
        status: true,
        message: "",
        reports: []
    }
}

const build = async () => {
    const response = run.build();
    return {
        status: true,
        message: "",
        reports: []
    }
}

const docs = async (port) => {
    hostHtmlFile(config.browser, port)
    return `${config.name}-docs @ http://localhost:${port}`
}

const executor = async (args) => {
    const cmd = args[2];
    let exitMessage, cmdListHead = `${config.name}/${config.cmd} @ ` + config.version

    const mapPathAvailability = async (dirMaps) => {
        const response = {
            status: true,
            reports: []
        };

        for (let index = 0; index < dirMaps.length; index++) {
            const map = dirMaps[index],
                mapErrors = [],
                source = path.join(config.path, map.source),
                target = path.join(config.path, map.target);

            const sourceExists = await pathExists.folder(source);
            const targetExists = await pathExists.folder(target);

            if (!sourceExists && !targetExists)
                mapErrors.push(`Both source and target doesn't exist.`);
            else {
                let globalCssPath, isCssFile = path.extname(map.globalCss) === '.css';

                if (sourceExists)
                    globalCssPath = path.join(source, map.globalCss);
                else if (targetExists)
                    globalCssPath = path.join(target, map.globalCss);

                const cssFileExists = await pathExists.file(globalCssPath);
                if (!cssFileExists || !isCssFile)
                    mapErrors.push(`"${globalCssPath}" invalid stylesheet.`);
            }
            if (mapErrors.length) response.reports.push($.compose.failed.List(`Map ${index}`, mapErrors, $.list.std.Bullets));
        }

        response.status = response.reports.length === 0
        return response;
    };
    const dirMapValidity = (dirMaps) => {
        const response = {
            status: true,
            reports: []
        }, checkedDirs = [];

        for (let index = 0; index < dirMaps.length; index++) {
            const map = dirMaps[index];
            let mapErrors = [];

            const checkConflicts = (key) => {
                const pathInvalid = /^[\.\/]/.test(map[key]) || /\/$/.test(map[key]);
                const normalPath = path.resolve(map[key]);
                let conflictFlag = false;

                if (pathInvalid) {
                    mapErrors.push(`${key}: "${map[key]}" invalid path detected`);
                    conflictFlag = true;
                } else {
                    conflictFlag = checkedDirs.some((dir) => {
                        const isConflict = isAncestorDir(dir, normalPath) || isAncestorDir(normalPath, dir) || (path.resolve(dir) === normalPath);
                        if (isConflict) {
                            mapErrors.push(`${key}: "${map[key]}" overlaps with "${dir}"`);
                        }
                        return isConflict;
                    });
                }
                return conflictFlag;
            };

            if (!checkConflicts('source')) checkedDirs.push(map.source);
            if (!checkConflicts('target')) checkedDirs.push(map.target);

            if (/^[\.\/]/.test(map.globalCss) || /\/$/.test(map.globalCss)) mapErrors.push(`globalCss: "${map.globalCss}" invalid path detected`);
            else checkedDirs.push(map.globalCss)

            if (mapErrors.length) response.reports.push($.compose.failed.List(`Map ${index}`, mapErrors, $.list.failed.Bullets));
        }

        response.status = response.reports.length === 0;
        return response;
    };
    const structureVerify = (dirMap) => {
        const response = {
            status: true,
            reports: []
        };

        if (!Array.isArray(dirMap)) {
            response.status = false;
            response.reports.push(`${config.dirMap} is not an Array`);
            return response;
        }

        if (dirMap.length === 0) {
            response.status = false;
            response.reports.push('Configure at least one Directory-map to continue.');
            return response;
        }
        dirMap.forEach((map, index) => {
            let mapErrors = [];
            if (typeof map !== 'object' || map === null) {
                response.status = false;
                mapErrors.push('Items in Array must be an object with valid entries.');
                return;
            }

            if (typeof map.source !== 'string') {
                response.status = false;
                mapErrors.push(`source: ${map.source} is not a string.`);
            }

            if (typeof map.target !== 'string') {
                response.status = false;
                mapErrors.push(`target: ${map.target} is not a string.`);
            }

            if (typeof map.globalCss !== 'string') {
                response.status = false;
                mapErrors.push(`globalCss: ${map.globalCss} is not a string.`);
            }

            if (typeof map.targetExtensions !== 'object' || map.targetExtensions === null || Array.isArray(map.targetExtensions)) {
                response.status = false;
                mapErrors.push(`targetExtensions: ${map.targetExtensions} is not an object.`);
            } else {
                for (const key in map.targetExtensions) {
                    if (typeof map.targetExtensions[key] !== 'object' || map.targetExtensions[key] === null || Array.isArray(map.targetExtensions[key])) {
                        response.status = false;
                        mapErrors.push(`targetExtensions: ${key} : ${map.targetExtensions[key]} is not an object.`);
                    }
                }
            }
            response.reports.push($.compose.failed.List(`Map ${index}`, mapErrors, $.list.failed.Bullets))
        });

        return response;
    };
    const dirValidity = async (setupFound) => {
        const response = {
            start: false,
            proceed: false,
            message: '',
            reports: [],
        };

        if (setupFound) {
            safeCloneFolder(config.template, config.setup);

            $.STEP('Reading ' + config.dirMap);
            const dirMap = await JSONCparse(config.dirMap);
            if (!dirMap) {
                response.message = `${config.dirMap} : bad *.jsonc file`;
                return response;
            }

            $.STEP('Verifying structure of ' + config.dirMap);
            let lastResponse = structureVerify(dirMap);
            if (!lastResponse.status) {
                response.message = `${config.dirMap} : invalid/insufficient structural definition.`;
                response.reports.push(...lastResponse.reports);
                return response;
            }

            $.STEP('Checking validity of data in ' + config.dirMap);
            lastResponse = dirMapValidity(dirMap);
            if (!lastResponse.status) {
                response.message = `${config.dirMap} : has invalid path-strings defined.`;
                response.reports.push(...lastResponse.reports);
                return response;
            }

            $.STEP('Checking availability of path in ' + config.dirMap);
            lastResponse = await mapPathAvailability(dirMap);
            if (!lastResponse.status) {
                response.message = `${config.dirMap} has unavailable paths defined.`;
                response.reports.push(...lastResponse.reports);
                return response;
            }
            response.proceed = true
            config.dirMaps = dirMap;
        } else {
            response.start = true;
            response.message = 'Unable to locate setup folder.';
            response.reports.push(`Run "${config.name} start" to initialize setup.`);
            response.reports.push(`Run "${config.name} docs" for documentation.`);
        }
        return response;
    };


    const begin = async () => {
        const normalizePath = (dir) => {
            if (!dir) return '.';
            const normalizedDir = path.normalize(dir);
            const noTrailingSlash = normalizedDir.replace(/\/$/g, '');
            return path.isAbsolute(normalizedDir) ? '.' + path.sep + noTrailingSlash.substring(1) : noTrailingSlash;
        };

        await initConfig(await fetchRoot(), normalizePath(args[3]));
        $.STEP('Searching for ' + config.setup);
        return await dirValidity(await pathExists.folder(config.setup));
    };



    if (cmd === 'start') {
        await $.PLAY.Title(config.name + ' : Initialize', 500)
        const validity = await begin();
        if (validity.start) {
            $.STEP('Importing setup to directory')
            await start()
            exitMessage = $.compose.success.Footer('Setup initialized.', ['Define ' + config.dirMap, 'Run "start" create target paths.', 'Run "dev" to to start a active runtime'], $.list.secondary.Numbers);
        } else if (validity.proceed) {
            await buildConfig();
            exitMessage = $.compose.success.Footer('Initialized target folders. Run "dev" to start Active-Runtime.')
        } else exitMessage = $.compose.failed.Footer(validity.message, validity.reports)
    } else if (['dev', 'preview', 'build'].includes(cmd)) {
        switch (cmd) {
            case 'dev': $.WRITE.std.Chapter(config.name + ' : Active Runtime'); break;
            case 'preview': $.WRITE.std.Chapter(config.name + ' : Preview Build'); break;
            case 'build': $.WRITE.std.Chapter(config.name + ' : Build Project'); break;
        }

        let validity = await begin(),
            response = {
                status: true,
                message: "",
                reports: []
            }

        if (validity.proceed) {
            await buildConfig();
            await buildShorthands();

            switch (cmd) {
                case 'dev':
                    response = await dev()
                    break;

                case 'preview':
                    response = await preview()
                    break;

                case 'build':
                    response = await build()
                    break;
            }
            exitMessage = response.status ?
                $.compose.success.Section(response.message, response.reports) :
                $.compose.failed.Section(response.message, response.reports);
        } else
            exitMessage = $.compose.failed.Footer(validity.message, validity.reports)
    } else {
        if (cmd === 'docs') {
            cmdListHead = await docs(isNaN(args[3]) ? 1248 : args[3]);
            exitMessage = $.compose.failed.Footer('[ ctrl + C ] to terminate.');
        } else exitMessage = $.compose.std.Footer('Available Commands.');
        exitMessage = [$.compose.std.Section(cmdListHead, config.activeCommands, $.list.std.Props), exitMessage].join('\n')
    }

    $.POST('\n' + exitMessage)
}

export default executor;
