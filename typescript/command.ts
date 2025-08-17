/* eslint-disable no-fallthrough */
import $ from "./Shell/main.js";
import * as $$ from "./shell.js";
import * as DATA from "./Data/init.js";
import * as FETCH from "./Data/fetch.js";
import * as SMITH from "./data-smith.js";
import * as worker from "./Data/watch.js";

import fileman from "./fileman.js";
import { MemoryUsage } from "./Data/init.js";
import { SYNC, APP, RAW, NAV, STACK } from "./Data/cache.js";
import { FetchPortables, SplitGlobalForComponents } from "./portable.js";
import { T_PackageEssential } from "./types.js";

function reporter(heading, targets, report) {
    $.POST(
        $.MOLD.std.Block([
            $.MOLD.title.Chapter(heading, targets.map(i => `Watching : ${i}`), $.list.tertiary.Bullets),
            report,
            $.MOLD.failed.Footer("Press Ctrl+C to stop watching.", MemoryUsage(), $.list.tertiary.Entries),
        ]),
    );
}

async function execute(chapter) {
    let stopWatcher = null | NodeJs.Timeout;
    let report = "",
        targets = [],
        reportNext = false,
        step = "Initialize",
        staticsFetched = false,
        heading = "Initial Build";

    $.POST($.MOLD.tertiary.Chapter(chapter));

    do {
        switch (step) {
            case "Initialize":
            case "VerifySetupStruct": {
                const verifyStructResult = await FETCH.VerifySetupStruct();
                if (!verifyStructResult.proceed) {
                    report = verifyStructResult.report;
                    step = "WatchFolders";
                    break;
                } else { report = ""; }
            }
            case "ReadIndex": {
                await FETCH.FetchIndexContent();
            }
            case "ReadLibraries": {
                await FETCH.ReloadLibrary();
            }
            case "VerifyConfigure": {
                const verifyConfigsResult = await FETCH.VerifyConfigure(!staticsFetched);
                if (!verifyConfigsResult.status) {
                    report = verifyConfigsResult.report;
                    step = "WatchFolders";
                    break;
                } else {
                    staticsFetched = true;
                    report = "";
                }
            }
            case "ReadProxyFolders": {
                await FETCH.UpdateProxies();
            }
            case "ReadHashrules": {
                const hashruleAnalysis = await FETCH.AnalyzeHashrules();
                if (!hashruleAnalysis.status) {
                    report = hashruleAnalysis.report;
                    step = "WatchFolders";
                    break;
                } else { report = ""; }
            }
            case "ProcessXtylesFolder": {
                SMITH.UpdateXtylesFolder();
            }
            case "ProcessProxyFolders": {
                SMITH.ProcessProxies();
            }
            case "GenerateFinals":
                {
                    const {
                        SaveFiles,
                        ConsoleReport
                    } = RAW.COMMAND === "split" ? SplitGlobalForComponents() : await SMITH.Generate();
                    report = ConsoleReport;
                }

            case "Publish":
                if (Object.keys(SaveFiles).length) { await fileman.write.bulk(SaveFiles); }
                if (reportNext) { reporter(heading, targets, report); reportNext = false };

            case "WatchFolders":
                if (RAW.WATCH) {
                    step = "WatchFolders";
                } else {
                    if (stopWatcher) {
                        stopWatcher();
                        stopWatcher = null;
                    }
                    break;
                }

                if (!stopWatcher) {
                    targets = Object.keys(STACK.PROXYCACHE);
                    const targetFolders = [...targets, NAV.folder.setup];
                    process.on("SIGINT", () => {
                        if (stopWatcher) {
                            stopWatcher();
                            stopWatcher = null;
                            $.render.write("\n", 2);
                        }
                        process.exit();
                    });
                    stopWatcher = worker.watchFolders(targetFolders);
                    reporter(heading, targets, report);
                }

                if (worker.hasEvents()) {
                    const event = worker.dequeueEvent();
                    $.initialize(event.consoleWidth, !RAW.WATCH);
                    const filePath = `${event.folder}/${event.filePath}`;
                    if (filePath.startsWith(NAV.folder.autogen)) {
                        break;
                    } else {
                        if (event.folder === NAV.folder.setup) {
                            if (event.action === "add" || event.action === "change") {
                                switch (filePath) {
                                    case NAV.json.configure.path:
                                        stopWatcher();
                                        stopWatcher = null;
                                        step = "VerifyConfigure";
                                        break;
                                    case NAV.css.atrules.path:
                                    case NAV.css.constants.path:
                                    case NAV.css.elements.path:
                                    case NAV.css.extends.path:
                                        await FETCH.FetchIndexContent();
                                        step = "GenerateFinals";
                                        break;
                                    case NAV.json.hashrules:
                                        step = "ReadHashrules";
                                        break;
                                    default:
                                        if (filePath.startsWith(NAV.folder.library) && event.extension === "css") { RAW.LIBRARIES[filePath] = event.fileContent; }
                                        else if (filePath.startsWith(NAV.folder.portables) && ["xcss", "css", "md"].includes(event.extension)) { RAW.PORTABLES[filePath] = event.fileContent; }
                                        step = "ProcessXtylesFolder";
                                }
                            } else {
                                step = "VerifySetupStruct";
                            }
                        } else if (event.action === "add" || event.action === "change" || event.action === "unlink") {
                            SMITH.ProcessProxies(event.action, event.folder, event.filePath, event.fileContent, event.extension);
                            step = "GenerateFinals";
                        } else { step = "VerifyConfigure"; }

                        heading = `[${event.timeStamp}] | ${event.filePath} | [${event.action}]`;
                        reportNext = true;
                    }
                }

                await new Promise((resolve) => setTimeout(resolve, 50));
        }
    } while (RAW.WATCH);

    if (stopWatcher) {
        stopWatcher();
        stopWatcher = null;
    } else {
        $.POST(report);
    }
}

async function commander({
    command,
    argument,
    rootPath,
    workPath,
    originPackageEssential
}: {
    command: string,
    argument: string,
    rootPath: string,
    workPath: string,
    originPackageEssential: T_PackageEssential
}) {
    // RAW.CMD = ["watch", "preview", "publish"].includes(command) ? "watch" : command;
    RAW.COMMAND = command;
    RAW.ARGUMENT = argument;
    RAW.WATCH = command === "watch";
    RAW.PACKAGE = originPackageEssential.name;
    RAW.VERSION = originPackageEssential.version;
    DATA.SetENV(rootPath, workPath, originPackageEssential);
    $.initialize(consoleWidth, command !== "watch" && command !== "archive");

    switch (RAW.COMMAND) {
        case "init":
            await $.PLAY.Title(APP.name + " : Initialize", 500);
            const setupInit = await FETCH.VerifySetupStruct();
            if (setupInit.unstart) { $.POST(await FETCH.Initialize()); }
            else if (setupInit.proceed) {
                $.POST((await FETCH.VerifyConfigure()).report);
            } else {
                $.POST(setupInit.report);
            }
            break;
        case "watch":
            execute(RAW.PACKAGE + " : Active Runtime");
            break;
        case "preview":
            await execute(RAW.PACKAGE + " : Preview Build");
            break;
        case "publish":
            await execute(RAW.PACKAGE + " : Final Build");
            break;
        case "split":
            await execute(RAW.PACKAGE + " : Split for Components");
            break;
        case "install":
            $.POST("\n" + $.MOLD.secondary.Section("Installing Portables"));

            const verifyStructResult = await FETCH.VerifySetupStruct();
            if (verifyStructResult.proceed) {
                const verifyConfigsResult = await FETCH.VerifyConfigure();
                if (verifyConfigsResult.status) {
                    const fetchResult = await FetchPortables(argument);
                    await fileman.write.bulk(fetchResult.SaveFiles);
                    $.POST($.MOLD.secondary.Footer("Installation status", fetchResult.Status));
                } else { $.POST(verifyConfigsResult.report); };
            } else { $.POST(verifyStructResult.report); };
            break;
        default:
            await FETCH.FetchDocs();
            $.POST(
                $.MOLD.std.Chapter(`${RAW.COMMAND} @ ` + APP.version, [
                    SYNC.DOCS.alerts.content || '',
                ]),
            );
            $.POST(
                $.MOLD.secondary.Section(
                    "Available Commands",
                    $$.Props.std(APP.commandList),
                ),
            );
            $.POST(
                $.MOLD.secondary.Section(
                    "Agreements",
                    $$.Props.std(Object.fromEntries(Object.values(SYNC.AGREEMENT).map((i) => [i.title, i.path])))
                ),
            );
            $.POST(
                $.MOLD.secondary.Section("Documentation : " + SYNC.DOCS.readme.path, [
                    "For more information visit " + $.style.bold.White(APP.website),
                ]),
            );
    }
}

export default commander;
