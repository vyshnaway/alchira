import $ from '../src.as/Shell/index.js';
import EXECUTOR from './executor.js';
import FILEMAN from './fileman.js';
import WATCHDOG from './watchdog.js';

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
    agreements: {
        LICENSE: 'license.txt',
        TERMS: 'terms.txt',
        PRIVACY: 'privacy.txt',
    },
};

const NAV = {
    status: false,
    agreements: "AGREEMENTS",
    scaffold: {
        path: "scaffold",
        setup: "scaffold/xtyles",
        refers: "scaffold/refers",
        prefix: "scaffold/prefix"
    },
    prefix: {
        atrules: "scaffold/prefix/atrules.json",
        classes: "scaffold/prefix/classes.json",
        elements: "scaffold/prefix/elements.json",
        properties: "scaffold/prefix/properties.json",
    },
    setup: {
        path: "xtyles/",
        cache: "xtyles/.cache",
        syncmap: "xtyles/.cache/sync-map.json",
        styleslist: "xtyles/.caches/styles-list.json",
        refers: "xtyles/references",
        atrules: "xtyles/#at-rules.css",
        constants: "xtyles/#constants.css",
        elements: "xtyles/#elements.css",
        extends: "xtyles/#extends.css",
        configure: "xtyles/configure.json",
        shorthand: "xtyles/short-hands.json",
    },
    project: {
        source: "",
        target: "",
        stylesheet: "",
        key: "",
        extensions: [],
    },
}

const LIVE = {
    xcdn: "https://xcdn.xpktr.com/",
    console: "https://console.xpktr.com/",
    agreements: "https://xcdn.xpktr.com/xcss/agreements-txt/index.json",
    prefix: {
        classes: "https://xcdn.xpktr.com/xcss/library/prefixes/classes.json",
        atrules: "https://xcdn.xpktr.com/xcss/library/prefixes/atrules.json",
        elements: "https://xcdn.xpktr.com/xcss/library/prefixes/elements.json",
        properties: "https://xcdn.xpktr.com/xcss/library/prefixes/properties.json",
    }
}

const DATA = {
    key: "",
    stylePath: "",
    shorthand: {},
    stylesheet: {
        // prefix: "",
        // suffix: ""
    },
    prefix: {
        // atrules: {},
        // classes: {},
        // elements: {},
        // properties: {}
    },
    refers: {},
    files: {},
}

async function initialize(cmd) {
    $.TASK("Initializing navigaiton", 0)
    const root = FILEMAN.path.ofRoot();

    NAV.agreements = FILEMAN.JOIN(root, NAV.agreements)

    NAV.scaffold.path = FILEMAN.JOIN(root, NAV.scaffold.path);
    NAV.scaffold.setup = FILEMAN.JOIN(root, NAV.scaffold.setup);
    NAV.scaffold.refers = FILEMAN.JOIN(root, NAV.scaffold.refers);

    for (const agreement in NAV.prefix)
        NAV.prefix[agreement] = FILEMAN.JOIN(root, NAV.prefix[agreement]);

    for (const agreement in APP.agreements)
        APP.agreements[agreement] = FILEMAN.JOIN(NAV.agreements, agreement);

    $.TASK("Updating Vendor Prefixes")
    await Promise.all(Object.keys(NAV.prefix).map(async source => {
        const latest = ["init", "build"].includes(cmd) ?
            await FILEMAN.JSON.fetchData(LIVE.prefix[source]) : { status: false, data: {} };
        const current = (latest.status && (typeof (latest.data) === "object")) ?
            { status: false, data: {} } : await FILEMAN.JSON.readData(NAV.prefix[source]);
        DATA.prefix[source] = (current.status) ? current.data : latest.data;
        if (latest.status && cmd !== "build") {
            await FILEMAN.JSON.writeFile(NAV.prefix[source], DATA.prefix[source]);
        }
    }));

    if(cmd === "init"){
        $.TASK("Updating Agreements")
        const agreements = await FILEMAN.JSON.fetchData(LIVE.agreements);
        if (agreements.status) {
            await Promise.all(agreements.data.files.map(async file => {
                const agreement = await fetch(LIVE.xcdn + file.path);
                if (agreement.ok)
                    FILEMAN.writeToFile(FILEMAN.JOIN(NAV.agreements, file.name), await agreement.text());
            }))
        }
    }
}

async function verify(CMD) {
    await initialize();
    $.TASK("Verifying directory status")

    $.STEP("Path : " + NAV.setup.setup)
    const ifSetup = await FILEMAN.path.availability(NAV.setup.setup);
    if (ifSetup.type === "folder") {
        await FILEMAN.safeCloneFolder(NAV.scaffold.setup, NAV.setup.setup);
    } else if (!ifSetup.exist && CMD === "dev") {
        $.TASK("Initializing XCSS setup.")
        const modifyPackageJson = async (xcssPackageJsonPath, destPackageJsonPath) => {
            const destJson = await FILEMAN.JSON.readData(destPackageJsonPath);
            const xcssJson = await FILEMAN.JSON.readData(xcssPackageJsonPath);
            destJson.data.scripts[`${APP.command}:install`] = `npm install -g ${APP.package}`;
            for (const key of ["init", "dev", "preview", "build"])
                if (xcssJson.data.scripts.hasOwnProperty(key))
                    destJson.data.scripts[`${APP.command}:${key}`] = xcssJson.data.scripts[key];
            await FILEMAN.JSON.writeFile(destPackageJsonPath, destJson.data)
        }

        const xcssPackageJasonPath = FILEMAN.JOIN(NAV.scaffold, 'package.json');
        const destPackageJsonPath = FILEMAN.JOIN(NAV.path, 'package.json');

        $.TASK(`Cloning scaffold to : ${NAV.path} `)
        await FILEMAN.safeCloneFolder(NAV.scaffold.setup, NAV.setup.setup);
        await FILEMAN.safeCloneFolder(NAV.scaffold.refers, NAV.setup.refers);

        if (await FILEMAN.path.ifFile(destPackageJsonPath)) {
            $.TASK('Adding additional scripts to project');
            await modifyPackageJson(xcssPackageJasonPath, destPackageJsonPath)
        }

        $.WRITE.std.Section("XCSS Initalized.", {
            "Configure file": NAV.setup.configure,
            "To verify run ": $.custom.style.apply.bold.White("xcss start") + $.custom.style.Reset,
            "To start dev environment": $.custom.style.apply.bold.White("xcss dev") + $.custom.style.Reset,
            "To create preview build": $.custom.style.apply.bold.White("xcss preview") + $.custom.style.Reset,
            "To create production build": $.custom.style.apply.bold.White("xcss build") + $.custom.style.Reset
        }, $.list.std.Props)

        $.WRITE.std.Footer("Build command instructions.", APP.version.startsWith("0") ?
            [
                "This command uses internet connection."
            ] :
            [
                "Create a new project and use its access key. For action visit " + $.custom.style.apply.bold.Orange((LIVE.console)),
                "For personal projects you can use key in " + $.custom.style.apply.bold.Orange(NAV.setup.configure),
                "If you are using it in CI/CD workflow it is suggested to use as " + $.custom.style.apply.bold.Orange("xcss build {key}"),
            ]
            , $.list.std.Bullets)
        return false;
    } else {
        $.WRITE.failed.Footer("Path error : " + NAV.setup.setup, ["Folder expected."], $.list.failed.Bullets)
        return false;
    }

    $.STEP("Path : " + NAV.setup.cache)
    if (!(await FILEMAN.path.ifFolder(NAV.setup.cache))) {
        $.WRITE.failed.Footer("Path error : " + NAV.setup.cache, ["Folder expected."], $.list.failed.Bullets)
        return false;
    }

    $.STEP("Path : " + NAV.setup.syncmap)
    if (!(await FILEMAN.path.ifFile(NAV.setup.syncmap))) {
        $.WRITE.failed.Footer("Path error : " + NAV.setup.syncmap, ["File expected."], $.list.failed.Bullets)
        return false;
    }

    $.STEP("Path : " + NAV.setup.styleslist)
    if (!(await FILEMAN.path.ifFile(NAV.setup.styleslist))) {
        $.WRITE.failed.Footer("Path error : " + NAV.setup.styleslist, ["File expected."], $.list.failed.Bullets)
        return false;
    }

    $.STEP("Path : " + NAV.setup.atrules)
    if (await FILEMAN.path.ifFile(NAV.setup.atrules)) {
        DATA.originstyle.atrules = await FILEMAN.READ(NAV.setup.atrules);
    } else {
        $.WRITE.failed.Footer("Path error : " + NAV.setup.atrules, ["File expected."], $.list.failed.Bullets)
        return false;
    }

    $.STEP("Path : " + NAV.setup.constants)
    if (await FILEMAN.path.ifFile(NAV.setup.constants)) {
        DATA.originstyle.constants = await FILEMAN.READ(NAV.setup.constants);
    } else {
        $.WRITE.failed.Footer("Path error : " + NAV.setup.constants, ["File expected."], $.list.failed.Bullets)
        return false;
    }

    $.STEP("Path : " + NAV.setup.tagstyles)
    if (await FILEMAN.path.ifFile(NAV.setup.tagstyles)) {
        DATA.originstyle.tagstyles = await FILEMAN.READ(NAV.setup.tagstyles);
    } else {
        $.WRITE.failed.Footer("Path error : " + NAV.setup.tagstyles, ["File expected."], $.list.failed.Bullets)
        return false;
    }

    $.STEP("Path : " + NAV.setup.refers)
    if (await FILEMAN.path.ifFolder(NAV.setup.refers)) {
        DATA.refers = (await FILEMAN.getFilesAndSync(NAV.setup.refers, ["css"])).fileContent;
    } else {
        $.WRITE.failed.Footer("Path error : " + NAV.setup.refers, ["Folder expected."], $.list.failed.Bullets)
        return false;
    }

    $.STEP("Path : " + NAV.setup.shorthand)
    if (await FILEMAN.path.ifFile(NAV.setup.shorthand)) {
        const shorthands = await FILEMAN.JSON.readData(NAV.setup.shorthand);
        if (shorthands.status && typeof (shorthands.data) === "object") {
            DATA.shorthand = {};
            for (const tag in shorthands.data) {
                if (typeof (shorthands.data[tag]) === "string") DATA.shorthand[tag] = shorthands.data[tag];
            }
        } else $.WRITE.failed.Footer("JSON ERROR : " + NAV.setup.shorthand)
    } else {
        $.WRITE.failed.Footer("Path error : " + NAV.setup.shorthand, ["File expected."], $.list.failed.Bullets)
        return false;
    }

    $.STEP("Path : " + NAV.setup.configure)
    if (await FILEMAN.path.ifFile(NAV.setup.configure)) {
        const configure = await FILEMAN.JSON.readData(NAV.setup.configure);
        if (configure.status) {
            const errors = []

            if (typeof (configure.data.source) === 'string') {
                NAV.setup.source = configure.data.source;
            } else {
                errors.push('Entry: "source" must be of type string.')
            }

            if (typeof (configure.data.target) === 'string') {
                NAV.setup.target = configure.data.target;
            } else {
                errors.push('Entry: "target" must be of type string.')
            }

            if (typeof (configure.data.stylesheet) === 'string') {
                NAV.setup.stylesheet = FILEMAN.JOIN(configure.data.target, configure.data.stylesheet);
                DATA.stylePath = FILEMAN.JOIN(configure.data.source, configure.data.stylesheet);
            } else {
                errors.push('Entry: "stylesheet" must be of type string.')
            }

            if (typeof (configure.data.key) === 'string' || configure.data.key === undefined) {
                DATA.key = configure.data.key ?? '';
            } else {
                errors.push('Entry: "key" must be of type string or undefined.')
            }

            if (Array.isArray(configure.data.extensions)) {
                configure.data.extensions.forEach(ext => {
                    if (typeof (ext) === "string") NAV.setup.extensions.push(ext)
                });
            } else {
                errors.push('Entry: "extensions" must be of type array.')
            }

            if (FILEMAN.path.isAncestor(NAV.setup.source, NAV.setup.target) || FILEMAN.path.isAncestor(NAV.setup.target, NAV.setup.source)) {
                errors.push('Source and Target folders must be independent.')
            }

            if (errors.length) {
                $.WRITE.failed.Footer("Errors in definition", errors, $.list.failed.Bullets)
                return false
            }
        } else $.WRITE.failed.Item("SYNTAX ERROR: Unable to read JSON data.")
    } else {
        $.WRITE.failed.Footer("Path error : " + NAV.setup.configure, ["File expected."], $.list.failed.Bullets)
        return false;
    }


    $.TASK("Verified all files")
    NAV.status = await NAV.FETCH();
    return NAV.status;
}

async function fetchFiles(CMD) {
    if (NAV.status) {
        $.STEP("Path : " + NAV.setup.source)
        if (!(await FILEMAN.path.ifFolder(NAV.setup.source))) {
            $.WRITE.failed.Footer("Path error : " + NAV.setup.source, ["Folder expected."], $.list.failed.Bullets)
            return false;
        }

        $.STEP("Path : " + NAV.setup.target)
        const targetIf = await FILEMAN.path.availability(NAV.setup.target);
        if (!targetIf.exist) {
            $.STEP("Creating target folder")
            await FILEMAN.safeCloneFolder(NAV.setup.source, NAV.setup.target)
            const files = await FILEMAN.getFilesAndSync(NAV.setup.target, NAV.setup.extensions, NAV.setup.source);
            DATA.files = files.fileContent;
            FILEMAN.JSON.writeFile(NAV.setup.syncmap, files.syncMap)
        } else if (targetIf.type !== "folder") {
            $.WRITE.failed.Footer("Path error : " + NAV.setup.refers, ["Folder expected."], $.list.failed.Bullets)
            return false;
        } else {
            const files = await FILEMAN.getFilesAndSync(NAV.setup.target, NAV.setup.extensions, NAV.setup.source);
            DATA.files = files.fileContent;
            FILEMAN.JSON.writeFile(NAV.setup.syncmap, files.syncMap)
        }

        $.STEP("Path : " + NAV.setup.stylesheet)
        if (await FILEMAN.path.ifFile(NAV.setup.stylesheet)) {
            DATA.originstyle.stylesheet = await FILEMAN.READ(NAV.setup.stylesheet);
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.setup.stylesheet)
            return false;
        }
        $.TASK("Collected latest files")
        return true
    } else {
        return false
    }
}

const commander = async (args) => {
    const CMD = args[2], KEY = args[3];
    await initialize(CMD)

    switch (CMD) {
        case 'init':
            await $.PLAY.Title(APP.name + ' : Initialize', 500);
            if (await NAV.START(CMD))
                $.WRITE.success.Footer("Initialization Successfull.")
            break;
        case 'dev':
            $.POST($.compose.std.Chapter(APP.name + ' : Active Runtime'));
            if (await NAV.START(CMD)) {
                EXECUTOR(DATA, CMD);
                $.WRITE.primary.Section(new Date())
                WATCHDOG([NAV.setup.setup], async () => {
                    NAV.status = false;
                    if (await NAV.FETCH(CMD)) {
                        await EXECUTOR(DATA, CMD);
                        $.WRITE.success.Footer("Build Success.")
                    } else $.WRITE.failed.Footer("Build Failed.")
                });
                WATCHDOG([NAV.setup.target], async () => {
                    if (await NAV.FETCH(CMD)) {
                        await EXECUTOR(DATA, CMD);
                        $.WRITE.success.Footer("Build Success.")
                    } else $.WRITE.failed.Footer("Build Failed.")
                });
                process.on('SIGINT', () => {
                    $.custom.render.animation.Backrow(),
                        $.POST()
                    $.WRITE.primary.Footer("Command Terminated.")
                    process.exit(0);
                });
                $.WRITE.failed.Footer("Press Ctrl+C to stop watching.")
            }
            break;
        case 'preview':
            $.POST($.compose.std.Chapter(APP.name + ' : Preview Build'));
            if (await NAV.FETCH(CMD)) {
                await EXECUTOR(DATA, CMD);
                $.WRITE.primary.Footer("Command Success")
            }
            break;
        case 'build':
            $.POST($.compose.std.Chapter(APP.name + ' : Build Project'));
            if (await NAV.FETCH(CMD)) {
                await EXECUTOR(DATA, CMD, KEY);
                $.WRITE.primary.Footer("Command Success")
            }
            break;
        default:
            $.POST()
            $.WRITE.std.Section(`${APP.command} @ ` + APP.version, APP.commandList, $.list.std.Props)
            $.WRITE.std.Footer('Available Commands.')
    }
}
export default commander;
