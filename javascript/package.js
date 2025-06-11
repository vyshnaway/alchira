import $ from './Shell/index.js';
import * as COLLECT from "./collector.js";
import * as ACTION from './actions.js';
import * as CRAFT from './craftsmen.js';
import * as worker from '../interface/worker.js';
import { PROXY } from './data-cache.js';
import { hasEvents, dequeueEvent } from '../interface/eventface.js';
import SETDATA, { ROOT, APP, DATA, NAV } from './data-meta.js';
import fileman from '../interface/fileman.js';


function reporter(chapter, heading, report) {
    // $.POST($.MOLD.std.Block([
    //     $.MOLD.title.Chapter(chapter, Object.keys(PROXY.CACHE), $.list.text.Entries),
    //     $.MOLD.primary.Chapter(heading, [report]),
    //     $.MOLD.failed.Footer("Press Ctrl+C to stop watching.")
    // ]))
}

async function execute(chapter) {
    let stopWatcher = null;
    let report = "",
        step = "Initialize",
        heading = "Initial Build";

    if (!DATA.WATCH) $.POST($.MOLD.success.Chapter(chapter))

    do {
        switch (step) {
            case "Initialize":
                await ACTION.FetchPrefix();

            case "VerifySetupStruct":
                const verifyStructResult = await COLLECT.VerifySetupStruct();
                if (!verifyStructResult.proceed) {
                    report = verifyStructResult.report
                    break;
                };

            case "ReadIndex":
                await COLLECT.FetchIndexContent();

            case "ReadLibraries":
                await COLLECT.UpdateLibrary();

            case "VerifyProxyMap":
                const verifyConfigsResult = await COLLECT.VerifyProxyMap();
                if (!verifyConfigsResult.status) {
                    report = verifyConfigsResult.report;
                    break;
                };

            case "ReadProxyFolders":
                await COLLECT.UpdateProxies();

            case "ReadShorthands":
                const shorthandAnalysis = await COLLECT.AnalyzeShorthands();
                if (!shorthandAnalysis.status) {
                    report = shorthandAnalysis.report;
                    break;
                }

            case "ProcessLibraries":
                CRAFT.UpdateLibrary();

            case "ProcessShorthands":
                CRAFT.UpdateShorthands();

            case "ProcessProxyFolders":
                CRAFT.ProcessProxies();

            case "GenerateFinals":
                const { SaveFiles, ConsoleReport } = await CRAFT.GenerateFinal();
                report = ConsoleReport;

            case "Publish":
                if (Object.keys(SaveFiles).length)
                    await fileman.write.bulk(SaveFiles);

            case "WatchFolders":

                if (DATA.WATCH) {
                    step = "WatchFolders";
                } else {
                    if (stopWatcher) {
                        stopWatcher();
                        stopWatcher = null;
                    }
                    break;
                }

                if (!stopWatcher) {
                    const targetFolders = [...Object.keys(PROXY.CACHE), NAV.folder.setup];
                    const ignoreFolders = [NAV.folder.buffer];
                    process.on('SIGINT', () => {
                        if (stopWatcher) { stopWatcher(); stopWatcher = null; $.render.write("\n", 2) }
                        process.exit();
                    });
                    stopWatcher = worker.watchFolders(targetFolders, ignoreFolders, "");
                    reporter(chapter, heading, report);
                }

                if (hasEvents()) {
                    const event = dequeueEvent();
                    $.initialize(event.consoleWidth, !DATA.WATCH);
                    if (event.folder === NAV.folder.setup || event.folder === NAV.folder.library) {
                        const filePath = `${event.folder}/${event.filePath}`;
                        if (event.action === "add" || event.action === "change") {
                            switch (filePath) {
                                case NAV.json.proxymap:
                                    stopWatcher();
                                    stopWatcher = null;
                                    step = "VerifyProxyMap"
                                    break;
                                case NAV.css.atrules:
                                case NAV.css.constants:
                                case NAV.css.elements:
                                case NAV.css.extends:
                                    await COLLECT.FetchIndexContent();
                                    step = "GenerateFinals";
                                    break;
                                case NAV.json.shorthand:
                                    step = "ReadShorthands"
                                    break;
                                default:
                                    DATA.LIBRARY[filePath] = event.fileContent;
                                    step = "ProcessLibraries"
                            }
                        } else {
                            step = "VerifySetupStruct"
                        }
                    } else {
                        if (event.action === "add" || event.action === "change") {
                            CRAFT.ProcessProxies(event.action, event.folder, event.filePath, event.fileContent, event.extension);
                            step = "GenerateFinals"
                        } else {
                            step = "ReadProxyFolders";
                        }
                    }

                    heading = `[${event.timeStamp}] | ${event.filePath} | [${event.action}]`;
                    reporter(chapter, heading, report)
                }

                await new Promise((resolve) => setTimeout(resolve, 50));
        }
    } while (DATA.WATCHS);

    if (stopWatcher) {
        stopWatcher();
        stopWatcher = null;
    } else {
        // $.POST(report);
    }
}

async function commander(
    command,
    argument,
    rootPath,
    workPath,
    consoleWidth,
    packageJson,
    projectName,
    projectVersion
) {
    DATA.CMD = command;
    DATA.ARG = argument;
    DATA.WATCH = command === 'watch';
    DATA.PACKAGE = projectName;
    DATA.VERSION = projectVersion;
    SETDATA(rootPath, workPath, packageJson);
    $.initialize(consoleWidth, !DATA.WATCH);

    switch (DATA.CMD) {
        case 'init':
            await $.PLAY.Title(APP.name + ' : Initialize', 500);
            const setupInit = await COLLECT.VerifySetupStruct();
            if (setupInit.unstart)
                $.POST(await ACTION.Initialize());
            else if (setupInit.proceed) {
                $.POST((await COLLECT.VerifyProxyMap()).report);
            } else {
                $.POST(setupInit.report);
            }
            break;
        case 'watch':
            execute(APP.name + ' : Active Runtime');
            break;
        case 'preview':
            await execute(APP.name + ' : Preview Build')
            break;
        case 'publish':
            await execute(APP.name + ' : Final Build');
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