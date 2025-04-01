import $ from './Xhell/package.js';
import U from './Utils/package.js';
import FILEMAN from './fileman.js';
import path from 'path';
import fs from 'fs';

const APP = {
    name: "XCSS",
    command: "xcss",
    version: '0.1.0',
    commandList: {
        start: 'Start and verify setup',
        dev: 'Live build for dev environment',
        preview: 'Fast build, preserves class names.',
        build: 'Build minified.'
    }
};

const NAV = {
    root: FILEMAN.path.ofRoot(),
    path: ".",
    template: {
        setup: "templates/xtyles",
        refer: "templates/refer"
    },
    project: {
        setup: "xtyles",
        refer: "references",
        cache: ".cache",
        config: "configure.jsonc",
        shorthand: "short-hand.jsonc",
        vendorprefix: "vendor-prefix.jsonc",
        atrules: "# at-rules.css",
        constants: "# constants.css",
        tagstyles: "# tag-styles.css",
        source: "",
        target: "",
        styles: "",
        key: ""
    },
    INIT: function () {
        NAV.template.setup = path.join(NAV.root, NAV.template.setup);
        NAV.template.refer = path.join(NAV.root, NAV.template.refer);

        NAV.project.setup = path.join(NAV.path, NAV.project.setup);
        NAV.project.refer = path.join(NAV.project.setup, NAV.project.refer);
        NAV.project.cache = path.join(NAV.project.setup, NAV.project.cache);

        NAV.project.config = path.join(NAV.project.setup, NAV.project.config);
        NAV.project.shorthand = path.join(NAV.project.setup, NAV.project.shorthand);
        NAV.project.vendorprefix = path.join(NAV.project.setup, NAV.project.vendorprefix);

        NAV.project.atrules = path.join(NAV.project.setup, NAV.project.atrules);
        NAV.project.constants = path.join(NAV.project.setup, NAV.project.constants);
        NAV.project.tagstyles = path.join(NAV.project.setup, NAV.project.tagstyles);

        return NAV
    },
    BUILD: function () {
        NAV.INIT();

        const configure = U.code.jsonc.parse(fs.readFileSync(NAV.project.config))

        NAV.project.source = configure["source"];
        NAV.project.target = configure["target"];
        NAV.project.styles = configure["stylesheet"];
        NAV.project.key = configure["project-key"];

        return configure["extensions"]
    }
};


const create = async () => {
    const modifyPackageJson = (xcssPackageJsonPath, destPackageJsonPath) => {
        const destJson = U.code.jsonc.parse(fs.readFileSync(destPackageJsonPath, 'utf8'));
        const xcssScripts = U.code.jsonc.parse(fs.readFileSync(xcssPackageJsonPath, 'utf8')).scripts;
        for (const key of ["dev", "preview", "build"])
            if (xcssScripts.hasOwnProperty(key))
                destJson.scripts[`${APP.command}:${key}`] = xcssScripts[key];
        destJson.scripts[`${APP.command}:install`] = "npm install -g xcss-xpktr";
        fs.writeFileSync(destPackageJsonPath, JSON.stringify(destJson, null, 2))
    }

    const xcssPackageJasonPath = path.join(NAV.root, 'package.json');
    const destPackageJsonPath = path.join(NAV.path, 'package.json');

    if (await FILEMAN.path.isFile(destPackageJsonPath)) {
        $.TASK('Adding additional scripts to project');
        modifyPackageJson(xcssPackageJasonPath, destPackageJsonPath)
    }

    NAV.INIT();
    console.log(NAV)
    $.TASK(`Cloning template to: ${NAV.path}`)
    FILEMAN.cloneFolder(NAV.template.setup, NAV.project.setup);
    FILEMAN.cloneFolder(NAV.template.refer, NAV.project.refer);

    return { heading: 'Initialized setup.' }
}

// console.log(NAV.BUILD(), NAV)
const ignite = () => {
    const extensions = NAV.BUILD();
    FILEMAN.cloneFolder(NAV.template.setup, NAV.project.setup);
    if (!FILEMAN.path.isFolder(NAV.project.target)) {
        $.WRITE.std.Section('Creating missing targets')
        FILEMAN.safeCloneFolder(NAV.project.source, NAV.project.target)
    }
    return {
        setups: {
            shorthand: JSON.parse(U.code.uncomment.Script(fs.readFileSync(NAV.project.shorthand))),
            vendorprefix: fs.readFileSync(NAV.project.vendorprefix),
        },
        stylesheets: {
            origin: fs.readFileSync(path.join(NAV.project.source, NAV.project.styles)),
            atrules: fs.readFileSync(NAV.project.atrules),
            constants: fs.readFileSync(NAV.project.constants),
            tagstyles: fs.readFileSync(NAV.project.tagstyles)
        },
        refers: FILEMAN.getFilesAndSync(NAV.project.refer, [".css"]),
        files: FILEMAN.getFilesAndSync(NAV.project.target, extensions, NAV.project.source)
    }
}

const execute = async (args) => {

    const mapDataVerify = (dirMap) => {
        let response = {
            status: true,
            errors: []
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
            if (typeof item !== 'object' || item === null) {
                response.status = false;
                response.errors.push('Items in Array must be an object with valid entries.');
                return response
            }
            if (typeof item.source !== 'string') {
                response.status = false;
                response.errors.push("source : " + item.source + ' not a string.');
                return response
            }
            if (typeof item.target !== 'string') {
                response.status = false;
                response.errors.push("target : " + item.target + ' not a string.');
                return response
            }
            if (typeof item.globalCss !== 'string') {
                response.status = false;
                response.errors.push("globalCss : " + item.globalCss + ' not a string.');
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
        let message,
            dirMap = [],
            errors = [],
            validity = 0,
            jsonFound = false,
            jsonValid = false,
            mapsFound = false,
            mapsValid = false,
            pathsValid = false

        if (!setupFound) message = NAV.project.setup + ' undefined.'
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

    const begin = async () => {
        $.TASK('Searching for ' + config.setup)
        return await dirValidity(await pathExists.folder(config.setup))
    }

    let exitMessage;
    const cmd = args[2], key = args[3];

    if (cmd === 'start') {
        await $.PLAY.Title(APP.name + ' : Initialize', 500)
        await create()
        // const validity = await begin();
        // if (validity.start) {
        //     $.TASK('Importing setup to directory')
        //     await create()
        //     exitMessage = $.compose.success.Footer('Initialized setup.');
        // } else exitMessage = $.compose.failed.Footer(validity.message, validity.errors)
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
        exitMessage = [
            $.compose.std.Section(`${APP.command} @ ` + APP.version, APP.commandList, $.list.std.Props),
            $.compose.std.Footer('Available Commands.')
        ].join('\n')
    }

    $.POST('\n' + exitMessage)
}

export default execute;
