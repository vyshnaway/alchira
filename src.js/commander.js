import fs from 'fs';
import path from 'path';

import $ from './Shell/index.js';
import FILEMAN from './fileman.js';
import SHORTHAND from "./Style/shorthand.js"

const APP = {
    name: "XCSS",
    package: "xpktr-css",
    command: "xcss",
    version: '0.1.0',
    commandList: {
        init: 'Initiate or Update & Verify setup.',
        dev: 'Live build for dev environment',
        preview: 'Fast build, preserves class names.',
        build: 'Build minified.'
    },
    live: {
        vendorprefixes: "https://xcdn.xpktr.com/xcss/library/vendor-prefixes.json",
        agreements: "https://xcdn.xpktr.com/xcss/agreements-txt/index.json",
        build: "https://workers.xpktr.com/api/xcss-build-request"
    }
};

const DATA = {
    key: '',
    shorthand: {},
    vendorprefix: {},
    originstyle: {
        atrules: "",
        constants: "",
        tagstyles: "",
        stylesheet: ""
    },
    refers: {},
    files: {}
}

const NAV = {
    path: ".",
    root: "/",
    agreements: "AGREEMENTS",
    template: {
        setup: "templates/xtyles",
        refer: "templates/refers"
    },
    project: {
        setup: "xtyles",
        cache: ".cache",
        syncmap: "syncmap.json",
        styleslist: "styles-list.json",
        refers: "references",
        atrules: "#at-rules.css",
        constants: "#constants.css",
        tagstyles: "#tag-styles.css",
        configure: "configure.json",
        shorthand: "short-hands.json",
        vendorprefix: "vendor-prefix.json",
        source: "",
        target: "",
        sourceStyles: "",
        targetStyles: "",
        key: "",
        extensions: [],
    },
    INIT: async () => {
        $.TASK("Initializing navigaiton")

        NAV.root = FILEMAN.path.ofRoot();
        NAV.agreements = path.join(NAV.root, NAV.agreements);
        NAV.template.setup = path.join(NAV.root, NAV.template.setup);
        NAV.template.refer = path.join(NAV.root, NAV.template.refer);

        NAV.project.setup = path.join(NAV.path, NAV.project.setup);
        NAV.project.refers = path.join(NAV.project.setup, NAV.project.refers);
        NAV.project.cache = path.join(NAV.project.setup, NAV.project.cache);
        NAV.project.syncmap = path.join(NAV.project.cache, NAV.project.syncmap);
        NAV.project.styleslist = path.join(NAV.project.cache, NAV.project.styleslist);

        NAV.project.configure = path.join(NAV.project.setup, NAV.project.configure);
        NAV.project.shorthand = path.join(NAV.project.setup, NAV.project.shorthand);
        NAV.project.vendorprefix = path.join(NAV.project.setup, NAV.project.vendorprefix);

        NAV.project.atrules = path.join(NAV.project.setup, NAV.project.atrules);
        NAV.project.constants = path.join(NAV.project.setup, NAV.project.constants);
        NAV.project.tagstyles = path.join(NAV.project.setup, NAV.project.tagstyles);

        return NAV
    },
    START: async () => {
        $.TASK("Verifying directory status")
        await NAV.INIT();

        $.STEP("Path : " + NAV.project.setup)
        const ifSetup = await FILEMAN.path.availability(NAV.project.setup);
        if (ifSetup === "folder") {
            const modifyPackageJson = (xcssPackageJsonPath, destPackageJsonPath) => {
                const destJson = FILEMAN.readJsonData(destPackageJsonPath);
                const xcssScripts = FILEMAN.readJsonData(xcssPackageJsonPath).scripts;
                for (const key of ["dev", "preview", "build"])
                    if (xcssScripts.hasOwnProperty(key))
                        destJson.scripts[`${APP.command}:${key}`] = xcssScripts[key];
                destJson.scripts[`${APP.command}:install`] = `npm install -g ${APP.package}`;
                FILEMAN.JSON.writeFile(destPackageJsonPath, destJson)
            }

            const xcssPackageJasonPath = path.join(NAV.root, 'package.json');
            const destPackageJsonPath = path.join(NAV.path, 'package.json');

            if (await FILEMAN.path.ifFile(destPackageJsonPath)) {
                $.TASK('Adding additional scripts to project');
                modifyPackageJson(xcssPackageJasonPath, destPackageJsonPath)
            }
            
            $.TASK(`Cloning template to: ${NAV.path}`)
            await FILEMAN.safeCloneFolder(NAV.template.setup, NAV.project.setup);
            await FILEMAN.safeCloneFolder(NAV.template.refer, NAV.project.refers);
        } else if (!ifSetup.exist) {
            $.TASK("Initializing XCSS setup.")
            await FILEMAN.safeCloneFolder(NAV.template.setup, NAV.project.setup);
            $.WRITE.standard.Footer("XCSS Initalized.", [
                "Setup " + NAV.project.configure,
                "To verify run " + $.custom.style.apply("xcss start") + $.custom.style.Reset()
            ], $.list.std.Numbers)
            return false;
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.setup)
            return false;
        }

        $.STEP("Path : " + NAV.project.cache)
        if (!(await FILEMAN.path.ifFolder(NAV.project.cache))) {
            $.WRITE.failed.Footer("Path error : " + NAV.project.cache)
            return false;
        }
        $.STEP("Path : " + NAV.project.syncmap)
        if (!(await FILEMAN.path.ifFile(NAV.project.syncmap))) {
            $.WRITE.failed.Footer("Path error : " + NAV.project.syncmap)
            return false;
        }
        $.STEP("Path : " + NAV.project.styleslist)
        if (!(await FILEMAN.path.ifFile(NAV.project.styleslist))) {
            $.WRITE.failed.Footer("Path error : " + NAV.project.styleslist)
            return false;
        }

        $.STEP("Path : " + NAV.project.atrules)
        if (await FILEMAN.path.ifFile(NAV.project.atrules)) {
            DATA.originstyle.atrules = await fs.promises.readFileSync(NAV.project.atrules);
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.atrules)
            return false;
        }

        $.STEP("Path : " + NAV.project.constants)
        if (await FILEMAN.path.ifFile(NAV.project.constants)) {
            DATA.originstyle.constants = await fs.promises.readFileSync(NAV.project.constants);
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.constants)
            return false;
        }

        $.STEP("Path : " + NAV.project.tagstyles)
        if (!(await FILEMAN.path.ifFile(NAV.project.tagstyles))) {
            DATA.originstyle.tagstyles = await fs.promises.readFileSync(NAV.project.tagstyles);
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.tagstyles)
            return false;
        }

        $.STEP("Path : " + NAV.project.configure)
        if (await FILEMAN.path.ifFile(NAV.project.configure)) {
            const configure = await FILEMAN.JSON.readData(NAV.project.configure);
            if (configure.status) {
                NAV.project.source = configure.data["source"];
                NAV.project.target = configure.data["target"];
                NAV.project.sourceStyles = path.join(configure.data["source"], configure.data["stylesheet"]);
                NAV.project.targetStyles = path.join(configure.data["target"], configure.data["stylesheet"]);
                NAV.project.key = configure.data["project-key"];
                NAV.project.extensions = configure.data["extensions"].map(ext => ext.startsWith(".") ? ext : '.' + ext);
            } else $.WRITE.failed.Footer("JSON ERROR : " + NAV.project.vendorprefix)
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.configure)
            return false;
        }

        $.STEP("Path : " + NAV.project.shorthand)
        if (await FILEMAN.path.ifFile(NAV.project.shorthand)) {
            const shorthands = await FILEMAN.JSON.readData(NAV.project.shorthand);
            if (shorthands.status && typeof (shorthands.data) === "object")
                for (const tag in shorthands.data) {
                    if (typeof (shorthands.data[tag]) === "string") DATA.shorthand[tag] = shorthands.data[tag];
                }
            else $.WRITE.failed.Footer("JSON ERROR : " + NAV.project.shorthand)
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.shorthand)
            return false;
        }

        $.STEP("Path : " + NAV.project.vendorprefix)
        if (await FILEMAN.path.ifFile(NAV.project.vendorprefix)) {
            const shorthands = await FILEMAN.JSON.readData(NAV.project.vendorprefix);

            const latestVendorPrefixes = await FILEMAN.fetchJsonData(APP.live.vendorprefixes);
            const currentVendorPrefixes = await FILEMAN.readJsonData(NAV.project.vendorprefix);
            if (latestVendorPrefixes.status && (typeof (latestVendorPrefixes.data) === "object")) {
                if (typeof (currentVendorPrefixes) === "object") {
                    $.STEP("Updating vendor-prefixes.json")
                    const updatedVendorPrefixes = {
                        ...latestVendorPrefixes.data,
                        ...currentVendorPrefixes,
                    };
                    FILEMAN.JSON.writeFile(NAV.project.vendorprefix, updatedVendorPrefixes)
                } else {
                    FILEMAN.JSON.writeFile(NAV.project.vendorprefix, latestVendorPrefixes)
                }
            }

            if (shorthands.status && typeof (shorthands.data) === "object")
                for (const tag in shorthands.data) {
                    if (typeof (shorthands.data[tag]) === "array") DATA.vendorprefix[tag] = shorthands.data[tag];
                }
            else $.WRITE.failed.Footer("JSON ERROR : " + NAV.project.vendorprefix)
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.vendorprefix)
            return false;
        }

        $.STEP("Path : " + NAV.project.refers)
        if (await FILEMAN.path.ifFolder(NAV.project.refers)) {
            DATA.refers = await FILEMAN.getFilesAndSync(NAV.project.refers, ["css"]);
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.refers)
            return false;
        }

        $.STEP("Path : " + NAV.project.source)
        if (await FILEMAN.path.ifFolder(NAV.project.source)) {
            DATA.refers = await FILEMAN.getFilesAndSync(NAV.project.target, ["css"]);
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.refers)
            return false;
        }

        $.STEP("Path : " + NAV.project.target)
        const targetIf = await FILEMAN.path.availability(NAV.project.target);
        if (!targetIf.exist) {
            FILEMAN.safeCloneFolder(NAV.project.source, NAV.project.target)
        } else if (targetIf.type !== "folder") {
            $.WRITE.failed.Footer("Path error : " + NAV.project.refers)
            return false;
        }
        DATA.files = await FILEMAN.getFilesAndSync(NAV.project.target, NAV.project.extensions, NAV.project.source);

        $.STEP("Path : " + NAV.project.targetStyles)
        if (await FILEMAN.path.ifFile(NAV.project.targetStyles)) {
            DATA.originstyle.stylesheet = await fs.promises.readFileSync(NAV.project.targetStyles);
        } else if (targetIf.type !== "folder") {
            $.WRITE.failed.Footer("Path error : " + NAV.project.refers)
            return false;
        }

        $.STEP("Path : " + NAV.project.sourceStyles)
        if (await FILEMAN.path.ifFile(NAV.project.sourceStyles)) {
            DATA.originstyle.stylesheet = await fs.promises.readFileSync(NAV.project.sourceStyles);
        } else if (targetIf.type !== "folder") {
            $.WRITE.failed.Footer("Path error : " + NAV.project.refers)
            return false;
        }

        $.WRITE.success.Footer("Verification Success.")
        return true;
    }
};



const begin = async () => {
    await NAV.START();
    SHORTHAND.UPLOAD((await FILEMAN.readJsonData(NAV.project.shorthand)).data);
    if (!FILEMAN.path.ifFolder(NAV.project.target)) {
        $.WRITE.standard.Section('Creating missing targets')
        FILEMAN.safeCloneFolder(NAV.project.source, NAV.project.target)
    }
    FILEMAN.safeCloneFolder(NAV.template.setup, NAV.project.setup);
    const FILES = FILEMAN.getFilesAndSync(NAV.project.target, NAV.project.extensions, NAV.project.source)
    console.log(FILES)
    FILEMAN.JSON.writeFile(NAV.project.syncmap, FILES.syncMap)
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

    const cmd = args[2], key = args[3];

    if (cmd === 'start') {
        await $.PLAY.Title(APP.name + ' : Initialize', 500)
        await initialize()
        // const validity = await begin();
        // if (validity.start) {
        //     $.TASK('Importing setup to directory')
        //     await create()
        //     exitMessage = $.compose.success.Footer('Initialized setup.');
        // } else exitMessage = $.compose.failed.Footer(validity.message, validity.errors)
    }
    else if (['dev', 'preview', 'build'].includes(cmd)) {
        switch (cmd) {
            case 'dev': $.POST($.compose.standard.Chapter(config.name + ' : Active Runtime')); break;
            case 'preview': $.POST($.compose.standard.Chapter(config.name + ' : Preview Build')); break;
            case 'build': $.POST($.compose.standard.Chapter(config.name + ' : Build Project')); break;
        }

        const validity = await setupCheck();
        if (validity.proceed) {
            const report = await execute(cmd, data)
            exitMessage = $.compose[report.status ? "success" : "failed"].Section(report.message, report.blocks)
        } else $.compose.failed.Footer(validity.message, validity.errors);
    }
    else {
        $.WRITE.standard.Block([
            $.compose.standard.Section(`${APP.command} @ ` + APP.version, APP.commandList, $.list.std.Props),
            $.compose.standard.Footer('Available Commands.')
        ])
    }
}

export default execute;
