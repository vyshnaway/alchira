import $ from './Shell/index.js';
import EXECUTOR from './executor.js';
import FILEMAN, { CSSImport } from './fileman.js';
import WATCHDOG from './watchdog.js';

const PACKAGE = (await FILEMAN.READ.json(FILEMAN.PATH.fromRoot("package.json"))).data
// console.log(PACKAGE)

const APP = {
    name: PACKAGE.name,
    version: PACKAGE.version,
    website: PACKAGE.homepage,
    command: Object.keys(PACKAGE.bin),
    console: "https://console.xpktr.com/",
    content: "https://xcdn.xpktr.com/xcss/version/" + PACKAGE.version.split(".")[0],
    commandList: {
        init: 'Initiate or Update & Verify setup.',
        dev: 'Live build for dev environment',
        preview: 'Fast build, preserves class names.',
        build: 'Build minified.'
    },
};
// console.log(APP)
const LIVE = {
    DOCS: {
        readme: {
            title: "README",
            url: APP.content + "/readme.md",
            path: FILEMAN.PATH.fromRoot("readme.md")
        },
        alerts: {
            title: "ALERTS",
            url: APP.content + "/alerts.md",
            path: FILEMAN.PATH.fromRoot("alerts.md")
        },
    },
    AGREEMENT: {
        license: {
            title: "LICENSE",
            url: APP.content + "/agreements-txt/license.txt",
            path: FILEMAN.PATH.fromRoot('AGREEMENTS/license.txt')
        },
        terms: {
            title: "TERMS & CONDITIONS",
            url: APP.content + "/agreements-txt/terms.txt",
            path: FILEMAN.PATH.fromRoot('AGREEMENTS/terms.txt')
        },
        privacy: {
            title: "PRIVACY POLICY",
            url: APP.content + "/agreements-txt/privacy.txt",
            path: FILEMAN.PATH.fromRoot('AGREEMENTS/privacy.txt')
        },
    },
    PREFIX: {
        atrules: {
            url: APP.content + "/prefixes/atrules.json",
            path: FILEMAN.PATH.fromRoot("scaffold/prefix/atrules.json")
        },
        classes: {
            url: APP.content + "/prefixes/classes.json",
            path: FILEMAN.PATH.fromRoot("scaffold/prefix/classes.json")
        },
        elements: {
            url: APP.content + "/prefixes/elements.json",
            path: FILEMAN.PATH.fromRoot("scaffold/prefix/elements.json")
        },
        properties: {
            url: APP.content + "/prefixes/properties.json",
            path: FILEMAN.PATH.fromRoot("scaffold/prefix/properties.json")
        },
    },
}
// console.log(SYNC)
const NAV = {
    scaffold: {
        setup: FILEMAN.PATH.fromRoot("scaffold/setup"),
        refers: FILEMAN.PATH.fromRoot("scaffold/refers")
    },
    folder: {
        setup: "xtyles/",
        cache: "xtyles/.cache",
        refers: "xtyles/references",
    },
    css: {
        atrules: "xtyles/#at-rules.css",
        constants: "xtyles/#constants.css",
        elements: "xtyles/#elements.css",
        extends: "xtyles/#extends.css",
    },
    json: {
        configure: "xtyles/configure.jsonc",
        shorthand: "xtyles/shorthand.jsonc",
        syncmap: "xtyles/.cache/sync-map.json",
        styleslist: "xtyles/.cache/styles-list.json",
    }
}
// console.log(NAV)
const DATA = {
    PREFIX: {}
};
const ACTION = {
    FetchDocs: async () => {
        const readmeMd = FILEMAN.SYNC.file(LIVE.DOCS.readme.url, LIVE.DOCS.readme.path);
        const alertsMd = FILEMAN.SYNC.file(LIVE.DOCS.alerts.url, LIVE.DOCS.alerts.path);
        const license = FILEMAN.SYNC.file(LIVE.AGREEMENT.license.url, LIVE.AGREEMENT.license.path);
        const terms = FILEMAN.SYNC.file(LIVE.AGREEMENT.terms.url, LIVE.AGREEMENT.terms.path);
        const privacy = FILEMAN.SYNC.file(LIVE.AGREEMENT.privacy.url, LIVE.AGREEMENT.privacy.path);

        LIVE.DOCS.readme.content = await readmeMd;
        LIVE.DOCS.alerts.content = await alertsMd;
        LIVE.AGREEMENT.license.content = await license;
        LIVE.AGREEMENT.terms.content = await terms;
        LIVE.AGREEMENT.privacy.content = await privacy;
    },
    FetchPrefix: async () => {
        $.TASK("Loading vendor-prefixes", 0)

        const classes = FILEMAN.SYNC.json(LIVE.PREFIX.classes.url, LIVE.PREFIX.classes.path);
        const atrules = FILEMAN.SYNC.json(LIVE.PREFIX.atrules.url, LIVE.PREFIX.atrules.path);
        const elements = FILEMAN.SYNC.json(LIVE.PREFIX.elements.url, LIVE.PREFIX.elements.path);
        const properties = FILEMAN.SYNC.json(LIVE.PREFIX.properties.url, LIVE.PREFIX.properties.path);

        DATA.PREFIX.classes = await classes
        DATA.PREFIX.atrules = await atrules
        DATA.PREFIX.elements = await elements
        DATA.PREFIX.properties = await properties
    },
    Initialize: async () => {
        try {
            $.TASK("Initializing XCSS setup.", 0);

            $.TASK('Cloning scaffold to Project');
            await FILEMAN.CLONE.safe(NAV.scaffold.setup, NAV.folder.setup);
            await FILEMAN.CLONE.safe(NAV.scaffold.refers, NAV.folder.refers);

            if (await FILEMAN.PATH.ifFile('package.json')) {
                $.TASK('Adding additional scripts to project');
                const destJson = await FILEMAN.READ.json("./package.json");
                destJson.data.scripts[`${APP.command}:install`] = `npm install -g ${APP.name}`;
                for (const key of Object.keys(APP.commandList)) {
                    if (PACKAGE.scripts[key]) {
                        destJson.data.scripts[`${APP.command}:${key}`] = PACKAGE.scripts[key];
                    }
                }
                await FILEMAN.WRITE.json("./package.json", destJson.data);
            }

            $.WRITE.std.Section("Next Steps", [
                'Adjust ' + $.custom.style.apply.bold.Orange(NAV.json.configure) + $.custom.style.Reset + ' according to the requirements of your project.',
                'Execute ' + $.custom.style.apply.bold.Orange('"init"') + $.custom.style.Reset + ' again to generate the necessary configuration folders.',
                'During execution ' + $.custom.style.apply.bold.Orange('{target}') + $.custom.style.Reset + ' folder will be cloned from ' + $.custom.style.apply.bold.Orange('{source}') + $.custom.style.Reset + ' folder.',
                'This folder will act as proxy for ' + APP.name + '.',
                'In the ' + $.custom.style.apply.bold.Orange('{target}/{stylesheet}') + $.custom.style.Reset + ', content from ' + $.custom.style.apply.bold.Orange('{target}/{stylesheet}') + $.custom.style.Reset + ' will be appended.'
            ], $.list.std.Bullets);


            $.WRITE.std.Section('Available Commands', APP.commandList, $.list.std.Props)

            $.WRITE.std.Section("Build command instructions.",
                (PACKAGE.version.split(".")[0] === "0") ? ["This command uses an internet connection."]
                    : [
                        "Create a new project and use its access key. For action visit " + $.custom.style.apply.bold.Orange(LIVE.console),
                        "For personal projects, you can use the key in " + $.custom.style.apply.bold.Orange(NAV.json.configure),
                        "If using in CI/CD workflow, it is suggested to use " + $.custom.style.apply.bold.Orange("xcss build {key}")
                    ], $.list.std.Bullets);

            return true;
        } catch (err) {
            $.WRITE.failed.Footer("Initialization failed.", [err.message], $.list.failed.Bullets);
            return false;
        }
    },
    VerifySetup: async () => {
        const errors = {}, passed = {};

        $.TASK("Verifying directory status", 0)
        for (const item of Object.values(NAV.css)) {
            $.STEP("Path : " + item)
            if (await FILEMAN.PATH.ifFile(item)) {
                passed[item] = "Ok";
            } else {
                errors[item] = "File not found.";
            }
        }
        for (const item of Object.values(NAV.json)) {
            $.STEP("Path : " + item)
            if (await FILEMAN.PATH.ifFile(item)) {
                passed[item] = "Ok";
            } else {
                errors[item] = "File not found.";
            }
        }
        $.TASK("Verification complete")

        return {
            unstart: !(await FILEMAN.PATH.available(NAV.folder.setup)).exist,
            proceed: Object.keys(errors).length === 0,
            report: (Object.keys(errors).length !== 0 && Object.keys(passed).length !== 0) ?
                $.compose.failed.Footer("Error Paths", errors, $.list.failed.Props) : $.compose.success.Footer("Setup Healthy")
        };
    },
    VerifyConfigs: async () => {
        const errors = {};
        const configure = FILEMAN.READ.json(NAV.json.configure)
        const shorthand = FILEMAN.READ.json(NAV.json.shorthand)

        $.TASK("Initializing configs")
        $.STEP("PATH : " + NAV.json.configure)
        if ((await configure).status) {
            DATA.CONFIGURE = (await configure).data
            if (FILEMAN.PATH.ifFolder(DATA.CONFIGURE.source)) {
                const av = await FILEMAN.PATH.available(DATA.CONFIGURE.target);
                if (!av.exist)
                    await FILEMAN.CLONE.safe(DATA.CONFIGURE.source, DATA.CONFIGURE.target)
                else if (av.type !== "folder")
                    errors[DATA.CONFIGURE.target] = "Folder not found."
                else if (!await FILEMAN.PATH.ifFile(FILEMAN.PATH.join(DATA.CONFIGURE.target, DATA.CONFIGURE.stylesheet)))
                    errors[FILEMAN.PATH.join(DATA.CONFIGURE.target, DATA.CONFIGURE.stylesheet)] = "*.css file not found."
            } else
                errors[DATA.CONFIGURE.source] = "Folder not found."
        } else errors[NAV.json.configure] = "Bad json file."

        $.STEP("PATH : " + NAV.json.shorthand)
        if ((await shorthand).status) {
            if (typeof ((await shorthand).data) === "object") {
                DATA.SHORTHAND = Object.fromEntries(
                    Object.entries((await shorthand).data).filter(([key, value]) => typeof value === 'string')
                );
            } else errors[NAV.json.shorthand] = "Error data type"
        } else errors[NAV.json.shorthand] = "Bad json file."

        $.TASK("Initializing complete")
        return {
            status: Object.keys(errors).length === 0,
            report: Object.keys(errors).length === 0 ?
                $.compose.success.Footer("Configs Healthy", errors, $.list.failed.Props) :
                $.compose.failed.Footer("Error Paths", errors, $.list.failed.Props)
        }
    },
    SaveSetup: async () => {
        $.TASK("Fetching from Setup", 0)
        $.STEP("Loading Reference styles")
        const refers = FILEMAN.READ.bulk(NAV.folder.refers, ["css"]);
        $.STEP("Loading Origin styles")
        const stylePrefix = CSSImport([
            NAV.css.atrules,
            NAV.css.constants,
            NAV.css.elements,
            NAV.css.extends,
        ]);
        $.TASK("Saving styles")
        DATA.refers = await refers;
        DATA.CSS.Index = await stylePrefix;
        DATA.shorthand = {
            ...DATA.SHORTHAND,
            ...DATA.CONFIGURE.shorthand
        };
    },
    SaveFiles: async () => {
        const files = FILEMAN.SYNC.bulk(CONFIGURE.target, CONFIGURE.source, CONFIGURE.extensions);
        const stylePath = FILEMAN.PATH.join(CONFIGURE.target, CONFIGURE.stylesheet);
        const styleSuffix = CSSImport([stylePath]);

        DATA.CSS.Path = stylePath
        DATA.CSS.Appendix = await styleSuffix
        DATA.Files = (await files).fileContent

        await FILEMAN.WRITE.json(NAV.setup.syncmap, (await files).syncMap)
    }
}

const begins = async () => {
    const setupInit = await ACTION.VerifySetup()
    const response = { status: setupInit.proceed, report: setupInit.report }
    if (setupInit.unstart) {
        response.report = $.compose.failed.Footer('Project not initialized. Use "init" command to initialize.')
    } else if (setupInit.proceed) {
        const configInit = await ACTION.VerifyConfigs();
        response.report = configInit.report;
        response.status = configInit.status;
    }
    return response
}

const commander = async (args) => {
    const CMD = args[2], KEY = args[3];

    switch (CMD) {
        case 'init':
            await $.PLAY.Title(APP.name + ' : Initialize', 500);
            const setupInit = await ACTION.VerifySetup()
            if (setupInit.unstart) {
                await ACTION.Initialize();
                $.WRITE.success.Footer("Initialized directory")
            } else if (setupInit.proceed) {
                const configInit = await ACTION.VerifyConfigs();
                $.POST(configInit.report)
            } else {
                $.POST(setupInit.report)
            }
            break;
        case 'dev':
            await Initialize(CMD)
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
            await ACTION.FetchPrefix()
            const verifiedPreview = await begins()
            if (verifiedPreview.status) {
                $.POST(verifiedPreview.report)
            } else $.POST(verifiedPreview.report)
            break;
        case 'build':
            await ACTION.FetchPrefix(CMD)
            $.POST($.compose.std.Chapter(APP.name + ' : Build Project'));
            if (await NAV.FETCH(CMD)) {
                await EXECUTOR(DATA, CMD, KEY);
                $.WRITE.primary.Footer("Command Success")
            }
            break;
        default:
            await ACTION.FetchDocs()
            $.WRITE.std.Chapter(`${APP.command} @ ` + APP.version, [LIVE.DOCS.alerts.content])
            $.WRITE.success.Section('Available Commands', APP.commandList, $.list.std.Props)
            $.WRITE.success.Section('Agreements',
                Object.values(LIVE.AGREEMENT).reduce((acc, i) => { acc[i.title] = i.path; return acc }, {}), $.list.std.Props)
            $.WRITE.success.Section("Documentation : " + LIVE.DOCS.readme.path,
                ['For more information visit ' + $.custom.style.apply.bold.White(APP.website)])
    }
}
export default commander;
