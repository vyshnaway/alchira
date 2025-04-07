import $ from './Shell/index.js';
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
    live: {
        atrules: "https://xcdn.xpktr.com/xcss/library/prefixes/atrules.json",
        classes: "https://xcdn.xpktr.com/xcss/library/prefixes/classes.json",
        elements: "https://xcdn.xpktr.com/xcss/library/prefixes/elements.json",
        properties: "https://xcdn.xpktr.com/xcss/library/prefixes/properties.json",
        agreements: "https://xcdn.xpktr.com/xcss/agreements-txt/index.json",
        build: "https://workers.xpktr.com/api/xcss-build-request",
        console: "https://console.xpktr.com/"
    }
};

const DATA = {
    key: "",
    stylePath: "",
    originstyle: {
        atrules: "",
        constants: "",
        tagstyles: "",
        stylesheet: ""
    },
    vendorprefix: {},
    shorthand: {},
    refers: {},
    files: {},
}

const NAV = {
    status: false,
    agreements: "AGREEMENTS",
    root: {
        root: "/",
        setup: "template/xtyles",
        refer: "template/refers",
        atrules: "template/prefixes/atrules.json",
        classes: "template/prefixes/classes.json",
        elements: "template/prefixes/elements.json",
        properties: "template/prefixes/properties.json",

    },
    setup: {
        path: "xtyles/",
        cache: "xtyles/.cache",
        syncmap: "xtyles/.cache/sync-map.json",
        styleslist: "xtyles/.caches/tyles-list.json",
        refers: "xtyles/references",
        atrules: "xtyles/#at-rules.css",
        constants: "xtyles/#constants.css",
        elements: "xtyles/#tag-styles.css",
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
    INIT: async () => {
        $.TASK("Initializing navigaiton", 0)

        NAV.root = FILEMAN.path.ofRoot();
        NAV.agreements = FILEMAN.JOIN(NAV.root, NAV.agreements);
        NAV.template.setup = FILEMAN.JOIN(NAV.root, NAV.template.setup);
        NAV.template.refer = FILEMAN.JOIN(NAV.root, NAV.template.refer);

        NAV.project.setup = FILEMAN.JOIN(NAV.path, NAV.project.setup);
        NAV.project.refers = FILEMAN.JOIN(NAV.project.setup, NAV.project.refers);
        NAV.project.cache = FILEMAN.JOIN(NAV.project.setup, NAV.project.cache);
        NAV.project.syncmap = FILEMAN.JOIN(NAV.project.cache, NAV.project.syncmap);
        NAV.project.styleslist = FILEMAN.JOIN(NAV.project.cache, NAV.project.styleslist);

        NAV.project.configure = FILEMAN.JOIN(NAV.project.setup, NAV.project.configure);
        NAV.project.shorthand = FILEMAN.JOIN(NAV.project.setup, NAV.project.shorthand);
        NAV.project.vendorprefix = FILEMAN.JOIN(NAV.project.setup, NAV.project.vendorprefix);

        NAV.project.atrules = FILEMAN.JOIN(NAV.project.setup, NAV.project.atrules);
        NAV.project.constants = FILEMAN.JOIN(NAV.project.setup, NAV.project.constants);
        NAV.project.tagstyles = FILEMAN.JOIN(NAV.project.setup, NAV.project.tagstyles);

        return NAV
    },
    START: async (CMD) => {
        await NAV.INIT();
        $.TASK("Verifying directory status")

        $.STEP("Path : " + NAV.project.setup)
        const ifSetup = await FILEMAN.path.availability(NAV.project.setup);
        if (ifSetup.type === "folder") {
            await FILEMAN.safeCloneFolder(NAV.template.setup, NAV.project.setup);
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

            const xcssPackageJasonPath = FILEMAN.JOIN(NAV.root, 'package.json');
            const destPackageJsonPath = FILEMAN.JOIN(NAV.path, 'package.json');

            $.TASK(`Cloning template to : ${NAV.path} `)
            await FILEMAN.safeCloneFolder(NAV.template.setup, NAV.project.setup);
            await FILEMAN.safeCloneFolder(NAV.template.refer, NAV.project.refers);

            if (await FILEMAN.path.ifFile(destPackageJsonPath)) {
                $.TASK('Adding additional scripts to project');
                await modifyPackageJson(xcssPackageJasonPath, destPackageJsonPath)
            }

            $.WRITE.std.Section("XCSS Initalized.", {
                "Configure file": NAV.project.configure,
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
                    "Create a new project and use its access key. For action visit " + $.custom.style.apply.bold.Orange((APP.live.console)),
                    "For personal projects you can use key in " + $.custom.style.apply.bold.Orange(NAV.project.configure),
                    "If you are using it in CI/CD workflow it is suggested to use as " + $.custom.style.apply.bold.Orange("xcss build {key}"),
                ]
                , $.list.std.Bullets)
            return false;
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.setup, ["Folder expected."], $.list.failed.Bullets)
            return false;
        }

        $.STEP("Path : " + NAV.project.cache)
        if (!(await FILEMAN.path.ifFolder(NAV.project.cache))) {
            $.WRITE.failed.Footer("Path error : " + NAV.project.cache, ["Folder expected."], $.list.failed.Bullets)
            return false;
        }

        $.STEP("Path : " + NAV.project.syncmap)
        if (!(await FILEMAN.path.ifFile(NAV.project.syncmap))) {
            $.WRITE.failed.Footer("Path error : " + NAV.project.syncmap, ["File expected."], $.list.failed.Bullets)
            return false;
        }

        $.STEP("Path : " + NAV.project.styleslist)
        if (!(await FILEMAN.path.ifFile(NAV.project.styleslist))) {
            $.WRITE.failed.Footer("Path error : " + NAV.project.styleslist, ["File expected."], $.list.failed.Bullets)
            return false;
        }

        $.STEP("Path : " + NAV.project.atrules)
        if (await FILEMAN.path.ifFile(NAV.project.atrules)) {
            DATA.originstyle.atrules = await FILEMAN.READ(NAV.project.atrules);
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.atrules, ["File expected."], $.list.failed.Bullets)
            return false;
        }

        $.STEP("Path : " + NAV.project.constants)
        if (await FILEMAN.path.ifFile(NAV.project.constants)) {
            DATA.originstyle.constants = await FILEMAN.READ(NAV.project.constants);
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.constants, ["File expected."], $.list.failed.Bullets)
            return false;
        }

        $.STEP("Path : " + NAV.project.tagstyles)
        if (await FILEMAN.path.ifFile(NAV.project.tagstyles)) {
            DATA.originstyle.tagstyles = await FILEMAN.READ(NAV.project.tagstyles);
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.tagstyles, ["File expected."], $.list.failed.Bullets)
            return false;
        }

        $.STEP("Path : " + NAV.project.refers)
        if (await FILEMAN.path.ifFolder(NAV.project.refers)) {
            DATA.refers = (await FILEMAN.getFilesAndSync(NAV.project.refers, ["css"])).fileContent;
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.refers, ["Folder expected."], $.list.failed.Bullets)
            return false;
        }

        $.STEP("Path : " + NAV.project.shorthand)
        if (await FILEMAN.path.ifFile(NAV.project.shorthand)) {
            const shorthands = await FILEMAN.JSON.readData(NAV.project.shorthand);
            if (shorthands.status && typeof (shorthands.data) === "object") {
                DATA.shorthand = {};
                for (const tag in shorthands.data) {
                    if (typeof (shorthands.data[tag]) === "string") DATA.shorthand[tag] = shorthands.data[tag];
                }
            } else $.WRITE.failed.Footer("JSON ERROR : " + NAV.project.shorthand)
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.shorthand, ["File expected."], $.list.failed.Bullets)
            return false;
        }

        $.STEP("Path : " + NAV.project.vendorprefix)
        if (await FILEMAN.path.ifFile(NAV.project.vendorprefix)) {
            const current = await FILEMAN.JSON.readData(NAV.project.vendorprefix);
            const latest = ["init", "build"].includes(CMD) ?
                await FILEMAN.JSON.fetchData(APP.live.vendorprefixes) : { status: false, data: {} };
            let vendorprefixes = {
                ...((latest.status && (typeof (latest.data) === "object")) ? latest.data : {}),
                ...((current.status && (typeof (current.data) === "object")) ? current.data : {})
            }
            DATA.vendorprefix = {};
            for (const prefix in vendorprefixes) {
                if (Array.isArray(vendorprefixes[prefix])) DATA.vendorprefix[prefix] = vendorprefixes[prefix];
            }

            if ("init" === CMD) {
                if (current.status && latest.status) {
                    $.TASK("Updating vendor-prefixes.json")
                    FILEMAN.JSON.writeFile(NAV.project.vendorprefix, vendorprefixes)
                } else {
                    const errors = []
                    if (!current.status) errors.push("SYNTAX ERROR: Unable to read JSON data.")
                    if (!latest.status) errors.push("NO INTERNET: Unable to fetch latest Vendor Prefixes.")
                    $.WRITE.failed.Footer("Unable to update " + $.custom.style.apply.bold.White(NAV.project.vendorprefix), errors, $.list.failed.Bullets)
                    return
                }
            }
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.vendorprefix)
            return false;
        }

        $.STEP("Path : " + NAV.project.configure)
        if (await FILEMAN.path.ifFile(NAV.project.configure)) {
            const configure = await FILEMAN.JSON.readData(NAV.project.configure);
            if (configure.status) {
                const errors = []

                if (typeof (configure.data.source) === 'string') {
                    NAV.project.source = configure.data.source;
                } else {
                    errors.push('Entry: "source" must be of type string.')
                }

                if (typeof (configure.data.target) === 'string') {
                    NAV.project.target = configure.data.target;
                } else {
                    errors.push('Entry: "target" must be of type string.')
                }

                if (typeof (configure.data.stylesheet) === 'string') {
                    NAV.project.stylesheet = FILEMAN.JOIN(configure.data.target, configure.data.stylesheet);
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
                        if (typeof (ext) === "string") NAV.project.extensions.push(ext)
                    });
                } else {
                    errors.push('Entry: "extensions" must be of type array.')
                }

                if (FILEMAN.path.isAncestor(NAV.project.source, NAV.project.target) || FILEMAN.path.isAncestor(NAV.project.target, NAV.project.source)) {
                    errors.push('Source and Target folders must be independent.')
                }

                if (errors.length) {
                    $.WRITE.failed.Footer("Errors in definition", errors, $.list.failed.Bullets)
                    return false
                }
            } else $.WRITE.failed.Item("SYNTAX ERROR: Unable to read JSON data.")
        } else {
            $.WRITE.failed.Footer("Path error : " + NAV.project.configure, ["File expected."], $.list.failed.Bullets)
            return false;
        }


        $.TASK("Verified all files")
        NAV.status = await NAV.FETCH();
        return NAV.status;
    },
    FETCH: async () => {
        if (NAV.status) {
            $.STEP("Path : " + NAV.project.source)
            if (!(await FILEMAN.path.ifFolder(NAV.project.source))) {
                $.WRITE.failed.Footer("Path error : " + NAV.project.source, ["Folder expected."], $.list.failed.Bullets)
                return false;
            }

            $.STEP("Path : " + NAV.project.target)
            const targetIf = await FILEMAN.path.availability(NAV.project.target);
            if (!targetIf.exist) {
                $.STEP("Creating target folder")
                await FILEMAN.safeCloneFolder(NAV.project.source, NAV.project.target)
                const files = await FILEMAN.getFilesAndSync(NAV.project.target, NAV.project.extensions, NAV.project.source);
                DATA.files = files.fileContent;
                FILEMAN.JSON.writeFile(NAV.project.syncmap, files.syncMap)
            } else if (targetIf.type !== "folder") {
                $.WRITE.failed.Footer("Path error : " + NAV.project.refers, ["Folder expected."], $.list.failed.Bullets)
                return false;
            } else {
                const files = await FILEMAN.getFilesAndSync(NAV.project.target, NAV.project.extensions, NAV.project.source);
                DATA.files = files.fileContent;
                FILEMAN.JSON.writeFile(NAV.project.syncmap, files.syncMap)
            }

            $.STEP("Path : " + NAV.project.stylesheet)
            if (await FILEMAN.path.ifFile(NAV.project.stylesheet)) {
                DATA.originstyle.stylesheet = await FILEMAN.READ(NAV.project.stylesheet);
            } else {
                $.WRITE.failed.Footer("Path error : " + NAV.project.stylesheet)
                return false;
            }
            $.TASK("Collected latest files")
            return true
        } else {
            return false
        }
    }
};

const commander = async (args) => {
    const CMD = args[2], KEY = args[3];

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
                WATCHDOG([NAV.project.setup], async () => {
                    NAV.status = false;
                    if (await NAV.FETCH(CMD)) {
                        await EXECUTOR(DATA, CMD);
                        $.WRITE.success.Footer("Build Success.")
                    } else $.WRITE.failed.Footer("Build Failed.")
                });
                WATCHDOG([NAV.project.target], async () => {
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
