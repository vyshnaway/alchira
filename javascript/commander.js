import $ from './Shell/index.js';
import * as ACTION from './actions.js'
import EXECUTOR from './executor.js';
import fileman from '../interface/files.js';
import * as watcher from '../interface/watcher.js';
import SETDATA, { ROOT, NAV, APP, DATA } from './metadata.js';

const STEP = {
    VerifySetup: async () => {
        const result = { unstart: false, proceed: false, report: "" };

        if (fileman.path.ifFolder(NAV.folder.setup)) {
            const errors = {};
            await fileman.clone.safe(NAV.scaffold.setup, NAV.folder.setup);

            $.TASK("Verifying directory status", 0)
            for (const item of Object.values(NAV.css)) {
                $.STEP("Path : " + item);
                if (!fileman.path.ifFile(item)) { errors[item] = "File not found."; }
            }
            for (const item of Object.values(NAV.json)) {
                $.STEP("Path : " + item);
                if (!fileman.path.ifFile(item)) { errors[item] = "File not found."; }
            }
            $.TASK("Verification finished")

            return {
                unstart: true,
                proceed: Object.keys(errors).length === 0,
                report: (Object.keys(errors).length === 0) ?
                    $.MOLD.success.Footer("Setup Healthy") : $.MOLD.failed.Footer("Error Paths", errors, $.list.failed.Props)
            };
        } else {
            return result
        }
    },
    VerifyConfigs: async () => {
        const errors = {};
        const configure = fileman.read.json(NAV.json.configure)
        const shorthand = fileman.read.json(NAV.json.shorthand)

        $.TASK("Initializing configs")

        $.STEP("PATH : " + NAV.json.configure)
        if ((await configure).status) {
            ACTION.CONFIGURE = (await configure).data
            DATA.ARG = DATA.ARG ?? ACTION.CONFIGURE.key
            DATA.SOURCE = ACTION.CONFIGURE.source
            if (fileman.path.isAncestor(ACTION.CONFIGURE.source, NAV.folder.setup) || fileman.path.isAncestor(ACTION.CONFIGURE.source, NAV.folder.setup)) {
                errors[ACTION.CONFIGURE.source] = "Dependence with " + NAV.folder.setup + " not allowed."
            } else if (fileman.path.ifFolder(ACTION.CONFIGURE.source)) {
                if (fileman.path.isAncestor(ACTION.CONFIGURE.target, NAV.folder.setup) || fileman.path.isAncestor(ACTION.CONFIGURE.target, NAV.folder.setup)) {
                    errors[ACTION.CONFIGURE.target] = "Dependence with " + NAV.folder.setup + " not allowed."
                } else if (fileman.path.isAncestor(ACTION.CONFIGURE.target, ACTION.CONFIGURE.source) || fileman.path.isAncestor(ACTION.CONFIGURE.target, ACTION.CONFIGURE.source)) {
                    errors[ACTION.CONFIGURE.target] = "Dependence with " + ACTION.CONFIGURE.source + " not allowed."
                } else {
                    const av = fileman.path.available(ACTION.CONFIGURE.target);
                    if (!av.exist)
                        await fileman.clone.safe(ACTION.CONFIGURE.source, ACTION.CONFIGURE.target)
                    else if (av.type !== "folder")
                        errors[ACTION.CONFIGURE.target] = "Folder not found."
                    else if (!await fileman.path.ifFile(fileman.path.join(ACTION.CONFIGURE.target, ACTION.CONFIGURE.stylesheet)))
                        errors[fileman.path.join(ACTION.CONFIGURE.target, ACTION.CONFIGURE.stylesheet)] = "*.css file not found."
                }
            } else
                errors[ACTION.CONFIGURE.source] = "Folder not found."
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
                $.MOLD.success.Footer("Configs Healthy", errors, $.list.failed.Props) :
                $.MOLD.failed.Footer("Error Paths", errors, $.list.failed.Props)
        }
    },
    SaveSetup: async () => {
        $.TASK("Fetching from Setup", 0);
        $.STEP("Reading libraries");
        DATA.LIBRARY = await fileman.read.bulk(NAV.folder.refers, ["css"]);
        $.STEP("Reading index styles")
        DATA.CSSIndex = await watcher.cssImport(Object.values(NAV.css));;
    },
    SaveFiles: async () => {
        $.TASK("Syncing proxy folders", 0)
        DATA.TARGETS = await watcher.proxyMapSync(proxyMap);
    }
};

const begins = async () => {
    const setupInit = await ACTION.VerifySetup()
    const response = { status: setupInit.proceed, report: setupInit.report }
    if (setupInit.unstart) {
        response.report = $.MOLD.failed.Footer('Project not initialized. Use "init" command to initialize.')
    } else if (setupInit.proceed) {
        const configInit = await ACTION.VerifyConfigs();
        response.report = configInit.report;
        response.status = configInit.status;
    }
    return response
}

const execute = async (isDev = false, backRows = 0) => {
    const verified = await begins()
    if (verified.status) {
        await ACTION.SaveSetup()
        await ACTION.SaveFiles()
        const response = await EXECUTOR(DATA)

        if (isDev) {
            let report = "";
            const now = new Date();
            const nows = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
            const heading = $.MOLD.primary.Chapter(`Active Runtime : ${nows}`)
            const footer = $.MOLD.failed.Footer("Press Ctrl+C to stop watching.");
            report = [heading, response.errors, footer].join('\n')
            $.custom.render.animation.Rewrite(report, backRows);
            backRows = report.split("\n").length;
        } else {
            $.POST(response.report)
        }

        await fileman.write.bulk(response.files)
    }
    else {
        $.POST(verified.report)
    }
    return backRows
}

const commander = async (cmd, arg, rootPath, consoleWidth, packageJson) => {
    $.initialize(consoleWidth);
    DATA.CMD = cmd; DATA.ARG = arg;
    SETDATA(rootPath, packageJson);
    if (cmd === "dev") { $.canvas.settings.taskActive = false };

    switch (DATA.CMD) {
        case 'init':
            await $.PLAY.Title(APP.name + ' : Initialize', 500);
            const setupInit = await ACTION.VerifySetup()
            if (setupInit.unstart) {
                await ACTION.Initialize();
                $.POST($.MOLD.success.Footer("Initialized directory"))
            } else if (setupInit.proceed) {
                const configInit = await ACTION.VerifyConfigs();
                $.POST(configInit.report)
            } else {
                $.POST(setupInit.report)
            }
            break;
        case 'dev':
            $.POST($.MOLD.std.Chapter(APP.name + ' : Active Runtime'));
            await ACTION.FetchPrefix();
            process.on('SIGINT', () => {
                $.custom.render.animation.Backrow(4);
                $.POST();
                $.POST($.MOLD.primary.Footer("Command Terminated."));
                process.exit(0);
            });
            let backRows = await execute(true, 5);
            while (1) {
                backRows = await execute(true, backRows);
            }
            break;
        case 'preview':
            $.POST($.MOLD.std.Chapter(APP.name + ' : Preview Build'));
            await ACTION.FetchPrefix()
            await execute()
            break;
        case 'build':
            $.POST($.MOLD.std.Chapter(APP.name + ' : Preview Build'));
            await ACTION.FetchPrefix()
            await execute()
            break;
        default:
            await ACTION.FetchPrefix();
            await ACTION.FetchDocs();
            $.MOLD.std.Chapter(`${APP.command} @ ` + APP.version, [ROOT.DOCS.alerts.content])
            $.MOLD.secondary.Section('Available Commands', APP.commandList, $.list.std.Props)
            $.MOLD.secondary.Section('Agreements',
                Object.values(ROOT.AGREEMENT).reduce((acc, i) => { acc[i.title] = i.path; return acc }, {}), $.list.std.Props)
            $.MOLD.secondary.Section("Documentation : " + ROOT.DOCS.readme.path,
                ['For more information visit ' + $.custom.style.apply.bold.White(APP.website)])
    }
}

export default commander;