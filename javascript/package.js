import $ from './Shell/index.js';
import * as COLLECT from "./collector.js";
import * as ACTION from './actions.js';
import * as CRAFT from './craftsmen.js';
import { ProxyTargets } from './data-cache.js';
import * as CACHE from './data-cache.js';
import * as watcher from '../interface/watcher.js';
import Library from "./class-refers.js";
import fileman from '../interface/fileman.js';
import SETDATA, { ROOT, APP, DATA, NAV } from './data-meta.js';
import { hasEvents, dequeueEvent } from '../interface/eventface.js';

const executes = async (isDev = false, backRows = 0) => {

    if (isDev) {
        const heading = $.MOLD.primary.Chapter(`Active Runtime : ${nows}`)
        const footer = $.MOLD.failed.Footer("Press Ctrl+C to stop watching.");
        report = [heading, response.errors, footer].join('\n')
        $.custom.render.animation.Rewrite(report, backRows);
        backRows = report.split("\n").length;
    } else { $.POST(response.report) }; return backRows
}

async function execute(step = "Initialize") {
    let stopWatcher = null;

    do {
        switch (step) {
            case "Initialize":
                await ACTION.FetchPrefix();
                CACHE.Initialize();
                step = "VerifySetupStruct";
                break;

            case "VerifySetupStruct":
                const verifyStructResult = await COLLECT.Step0_VerifySetupStruct();
                if (!verifyStructResult.proceed) {
                    $.POST(verifyStructResult.report);
                    return;
                }
                step = "VerifyProxyMap";
                break;

            case "VerifyProxyMap":
                const verifyConfigsResult = await COLLECT.Step1_VerifyProxyMap();
                if (!verifyConfigsResult.status) {
                    $.POST(verifyConfigsResult.report);
                    return;
                }
                step = "ReadLibraries";
                break;

            case "ReadLibraries":
                await COLLECT.Step2_UpdateLibrary();
                step = "ReadTargetFolders";
                break;

            case "ReadTargetFolders":
                await COLLECT.Step3_UpdateProxies();
                step = "ReadAxiomFrags";
                break;

            case "ReadAxiomFrags":
                await COLLECT.Step4_FetchIndexContent();
                step = "ReadShorthands";
                break;

            case "ReadShorthands":
                const shorthandAnalysis = await COLLECT.Step5_AnalyzeShorthands();
                if (!shorthandAnalysis.status) {
                    $.POST(shorthandAnalysis.report);
                    return;
                }
                step = "ProcessLibraries";
                break;

            case "ProcessLibraries":
                CRAFT.UpdateLibrary();
                step = "ProcessShorthands";
                break;

            case "ProcessShorthands":
                CRAFT.UpdateShorthands();
                step = "ProcessTargetFolders";
                break;

            case "ProcessTargetFolders":
                // await CRAFT.ProcessProxies();
                step = "GenerateFinals";
                break;

            case "GenerateFinals":
                // await CRAFT.GenerateFinal();
                step = "Deploy";
                break;

            case "Deploy":
                // await fileman.write.bulk(response.files);
                step = "WatchFolders";
                break;

            case "WatchFolders":
                if (DATA.CMD !== "dev") {
                    if (stopWatcher) {
                        stopWatcher();
                    }
                    return;
                }

                if (!stopWatcher) {
                    stopWatcher = watcher.watchFolders(
                        Object.keys(ProxyTargets),
                        NAV.folder.setup
                    ); // Uses default handleEvent from eventInterface
                }

                if (hasEvents()) {
                    const response = dequeueEvent();
                    if (response) {
                        console.log(`Processing event: ${JSON.stringify(response)}`);
                        if (response.action === "folderUpdate") {
                            console.log("Folder update detected, restarting setup...");
                            step = "VerifySetupStruct";
                        } else if (["fileEdit", "fileAdd", "fileDelete"].includes(response.action)) {
                            console.log("File change detected, processing...");
                            step = "ReadTargetFolders";
                        } else if (response.action === "xtylesUpdate") {
                            console.log("Xstyles update detected, re-analyzing shorthands...");
                            step = "ReadShorthands";
                        }
                    }
                }

                await new Promise((resolve) => setTimeout(resolve, 100));
                break;
        }
    } while (DATA.CMD === "dev");

    if (stopWatcher) {
        stopWatcher();
    }
}

async function commander(cmd, arg, rootPath, consoleWidth, packageJson) {
    DATA.CMD = cmd; DATA.ARG = arg;
    SETDATA(rootPath, packageJson);
    $.initialize(consoleWidth, cmd !== "dev");

    switch (DATA.CMD) {
        case 'init':
            await $.PLAY.Title(APP.name + ' : Initialize', 500);
            const setupInit = await COLLECT.Step0_VerifySetupStruct();
            if (setupInit.unstart)
                $.POST(await ACTION.Initialize());
            else if (setupInit.proceed) {
                $.POST((await COLLECT.Step1_VerifyProxyMap()).report);
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