import $ from './Shell/index.js';
import * as COLLECT from "./collector.js";
import * as ACTION from './actions.js';
import * as CRAFT from './craftsmen.js';
import * as watcher from '../interface/watcher.js';
import fileman from '../interface/fileman.js';
import SETDATA, { ROOT, APP, DATA } from './metadata.js';

const executes = async (isDev = false, backRows = 0) => {
    const verified = await begins()
    if (verified.status) {
        await ACTION.SaveSetup()
        await ACTION.SaveFiles()
        const response = await CRAFT(DATA)

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
    }
    else {
        $.POST(verified.report)
    }
    return backRows
}

async function execute(step = "initialize") {
    do {
        switch (step) {
            case "initialize":
                await ACTION.FetchPrefix();
                CRAFT.Initialize();
            case "VerifySetupStructure":
                const verifyStructResult = await COLLECT.Step0_VerifySetupStructure();
                if (!verifyStructResult.proceed) {
                    $.POST(verifyStructResult.report);
                    break;
                }
            case "VerifySetupConfigs":
                const verifyConfigsResult = await COLLECT.Step1_VerifySetupConfigs();
                if (!verifyConfigsResult.status) {
                    $.POST(verifyConfigsResult.report);
                    break;
                }
            case "updateSetup":
                await COLLECT.Step2_UpdateSetupContent();
                CRAFT.UpdateLibrary();
                CRAFT.UpdateShorthands();
            case "updateTargets":
                await COLLECT.Step3_UpdateTargets();
                await CRAFT.ProcessProxies();
            case "deploy":
                await CRAFT.GenerateFinal();
            // await fileman.write.bulk(response.files)
        }
        if (DATA.CMD === "devs"){
            watcher.watchFolders
        }
    } while (DATA.CMD === "devs");
}

async function commander(cmd, arg, rootPath, consoleWidth, packageJson) {
    DATA.CMD = cmd; DATA.ARG = arg;
    SETDATA(rootPath, packageJson);
    $.initialize(consoleWidth, cmd !== "dev");

    switch (DATA.CMD) {
        case 'init':
            await $.PLAY.Title(APP.name + ' : Initialize', 500);
            const setupInit = await COLLECT.Step0_VerifySetupStructure();
            if (setupInit.unstart)
                $.POST(await ACTION.Initialize());
            else if (setupInit.proceed) {
                $.POST((await COLLECT.Step1_VerifySetupConfigs()).report);
            } else {
                $.POST(setupInit.report);
            }
            break;
        case 'dev':
            $.POST($.MOLD.std.Chapter(APP.name + ' : Active Runtime'));
            execute();
            break;
        case 'preview':
            $.POST($.MOLD.std.Chapter(APP.name + ' : Preview Build'));
            await execute()
            break;
        case 'build':
            $.POST($.MOLD.std.Chapter(APP.name + ' : Final Build'));
            await execute()
            break;
        default:
            await ACTION.FetchDocs();
            $.POST($.MOLD.std.Chapter(`${APP.command} @ ` + APP.version, [ROOT.DOCS.alerts.content]));
            $.POST($.MOLD.secondary.Section('Available Commands', APP.commandList, $.list.std.Props));
            $.POST($.MOLD.secondary.Section('Agreements',
                Object.values(ROOT.AGREEMENT).reduce((acc, i) => { acc[i.title] = i.path; return acc }, {}), $.list.std.Props));
            $.POST($.MOLD.secondary.Section("Documentation : " + ROOT.DOCS.readme.path,
                ['For more information visit ' + $.style.bold.White(APP.website)]));
    }
}

export default commander;