import $ from './Shell/index.js';
import * as COLLECT from "./collector.js";
import * as ACTION from './actions.js';
import * as CRAFT from './craftsmen.js';
import { ProxyTargets } from './data-cache.js';
import * as CACHE from './data-cache.js';
import * as watcher from '../interface/watcher.js';
import fileman from '../interface/fileman.js';
import SETDATA, { ROOT, APP, DATA, NAV } from './data-meta.js';
import { hasEvents, dequeueEvent } from '../interface/eventface.js';

let stopWatcher = null;

async function execute(step = "Initialize") {
    const footer = $.MOLD.failed.Footer("Press Ctrl+C to stop watching.");
    let backRows = 0,
        outputMessage = '',
        heading = $.MOLD.primary.Chapter(`Initial Build`);

    do {
        switch (step) {
            case "Initialize":
                await ACTION.FetchPrefix();
                CACHE.Initialize();
            case "VerifySetupStruct":
                const verifyStructResult = await COLLECT.VerifySetupStruct();
                if (!verifyStructResult.proceed) {
                    outputMessage = verifyStructResult.report
                    break;
                };

            case "ReadIndex":
                await COLLECT.FetchIndexContent();

            case "ReadLibraries":
                await COLLECT.UpdateLibrary();

            case "VerifyProxyMap":
                const verifyConfigsResult = await COLLECT.VerifyProxyMap();
                if (!verifyConfigsResult.status) {
                    outputMessage = verifyConfigsResult.report;
                    break;
                };

            case "ReadProxyFolders":
                await COLLECT.UpdateProxies();

            case "ReadShorthands":
                const shorthandAnalysis = await COLLECT.AnalyzeShorthands();
                if (!shorthandAnalysis.status) {
                    outputMessage = shorthandAnalysis.report;
                    break;
                }

            case "ProcessLibraries":
                CRAFT.UpdateLibrary();

            case "ProcessShorthands":
                CRAFT.UpdateShorthands();

            case "ProcessProxyFolders":
                CRAFT.ProcessProxies();

            case "GenerateFinals":
                const { SaveFiles, DeleteFiles, ConsoleReport } = await CRAFT.GenerateFinal();
                outputMessage = ConsoleReport;

            case "Publish":
                await fileman.write.bulk(SaveFiles);
                await fileman.delete.bulk(DeleteFiles);

            case "WatchFolders":
                if (DATA.CMD !== "dev") {
                    if (stopWatcher) {
                        stopWatcher();
                        stopWatcher = null;
                    }
                    break;
                }

                if (!stopWatcher) {
                    const targetFolders = [...Object.keys(ProxyTargets), NAV.folder.setup];
                    const ignoreFolders = [NAV.folder.cache];
                    stopWatcher = watcher.watchFolders(targetFolders, ignoreFolders, $.MOLD.primary.Block([
                        $.MOLD.success.Section("Target Folders", Object.keys(ProxyTargets), $.list.primary.Bullets)
                    ]));
                }

                if (hasEvents()) {
                    const event = dequeueEvent();
                    // console.log(event);
                    if (event.folder === NAV.folder.setup) {
                        if (event.action === "change") {
                            switch (event.filePath) {
                                case NAV.css.atrules:
                                case NAV.css.constants:
                                case NAV.css.elements:
                                case NAV.css.extends:
                                    await COLLECT.FetchIndexContent();
                                    step = "GenerateFinals";
                                    break;
                                case NAV.json.proxymap:
                                    step = "VerifyProxyMap"
                                    break;
                                case NAV.json.shorthand:
                                    step = "ReadShorthands"
                                    break;
                                default:
                                    CRAFT.UpdateLibrary(event.action, event.filePath, event.fileContent)
                                    step = "ProcessTargetFolders"
                            }
                        } else {
                            const verifyStructResult = await COLLECT.VerifySetupStruct();
                            if (!verifyStructResult.proceed) {
                                outputMessage = verifyStructResult.report
                                break;
                            };
                        }
                    } else {
                        switch (event.action) {
                            case "change":
                                await CRAFT.ProcessProxies(event.action, event.folder, event.filePath, event.fileContent);
                                step = "GenerateFinals"
                                break;
                            default:
                                step = "ReadProxyFolders";
                        }
                    }
                    heading = $.MOLD.primary.Chapter(`Active Runtime : ${event.timestamp}`);
                    if (DATA.CMD === "dev") outputMessage = [heading, outputMessage, footer].join('\n');
                    backRows = $.render.write(outputMessage, backRows);
                    outputMessage = "";
                }

                await new Promise((resolve) => setTimeout(resolve, 100));
        }
    } while (DATA.CMD === "devs");
    
    if (stopWatcher) {
        stopWatcher();
        stopWatcher = null;
    } else {
        // $.POST(outputMessage);
    }
}

async function commander(cmd, arg, rootPath, workPath, consoleWidth, packageJson) {
    DATA.CMD = cmd; DATA.ARG = arg; DATA.ISDEV = cmd === 'dev';
    SETDATA(rootPath, workPath, packageJson);
    $.initialize(consoleWidth, cmd !== "dev");

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
        case 'dev':
            $.POST($.MOLD.std.Chapter(APP.name + ' : Active Runtime'));
            process.on('SIGINT', () => {
                if (stopWatcher) {
                    stopWatcher();
                    stopWatcher = null;
                    $.render.write("\n", 2)
                }
                process.exit();
            });
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