/* eslint-disable no-fallthrough */
import $ from "./Shell/main.js";
import * as $$ from "./shell.js";
import * as TYPE from "./types.js";
import * as SMITH from "./assemble.js";
import * as FETCH from "./Data/fetch.js";
import * as CACHE from "./Data/cache.js";
import * as ACTION from "./Data/action.js";
import * as worker from "./Data/watcher.js";

import fileman from "./fileman.js";
import { MemoryUsage } from "./Data/action.js";
import Use from "./Utils/main.js";
// import { FetchPortables, SplitGlobalForComponents } from "./portable.js";

function reporter(heading: string, targets: string[], report: string) {
    $.POST(
        $.MAKE("", [
            $.MAKE($.tag.H5(heading), targets.map(i => `Watching : ${i}`), [$.list.Bullets, 0, $.preset.tertiary]),
            report,
            $.MAKE($.tag.H5("Press Ctrl+C to stop watching.", $.preset.failed), MemoryUsage(), [$.list.Catalog, 0, $.preset.tertiary]),
        ]),
    );
}

async function execute(chapter: string) {
    let stopWatcher: null | (() => void) = null;
    let OutFiles: Record<string, string> = {};
    let SaveAction: Promise<void> | null = null;
    let report = "",
        targets: string[] = [],
        reportNext = false,
        step = "Initialize",
        staticsFetched = false,
        heading = "Initial Build";

    $.POST($.MAKE($.tag.H1(chapter)));

    do {

        switch (step) {
            case "Initialize":
            case "VerifySetupStruct": {
                const verifyStructResult = await FETCH.VerifySetupStruct();
                if (!verifyStructResult.proceed) {
                    report = verifyStructResult.report;
                    step = "WatchFolders";
                    break;
                } else {
                    report = "";
                }
            }
            case "ReadIndex": {
                await FETCH.SaveRootCSS();
            }
            case "ReadLibraries": {
                await FETCH.SaveLibrary();
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
            case "ReadPackages": {
                await FETCH.SavePackages();
            }
            case "ReadProxyFolders": {
                await FETCH.SaveProxies();
            }
            case "ReadHashrules": {
                const hashruleAnalysis = await FETCH.SaveHashrules();
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
                SMITH.SaveToTarget();
            }
            case "GenerateFinals": {
                const response = await SMITH.Generate();
                OutFiles = response.SaveFiles;
                report = response.ConsoleReport;
            }
            case "Publish": {
                if (Object.keys(OutFiles).length) {
                    if (SaveAction) {
                        await SaveAction;
                    }
                    // SaveAction = fileman.write.bulk(OutFiles);
                }
                if (reportNext) {
                    reporter(heading, targets, report);
                    reportNext = false;
                };
            }

            case "WatchFolders": {
                if (CACHE.STATIC.WATCH) {
                    step = "WatchFolders";
                } else {
                    if (stopWatcher) {
                        stopWatcher();
                        stopWatcher = null;
                    }
                    break;
                }

                if (!stopWatcher) {
                    targets = Object.keys(CACHE.STORAGE.TARGET);
                    const targetFolders = [...targets, CACHE._PATH.folder.setup.path];
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

                if (worker.EventQueue.hasEvents()) {
                    const event = worker.EventQueue.dequeue();
                    if (!event) { break; }
                    const filePath = `${event.folder}/${event.filePath}`;
                    if (filePath.startsWith(CACHE._PATH.folder.autogen.path)) {
                        break;
                    } else {
                        if (event.folder === CACHE._PATH.folder.setup.path) {
                            if (event.action === "add" || event.action === "change") {
                                switch (filePath) {
                                    case CACHE._PATH.json.configure.path:
                                        stopWatcher();
                                        stopWatcher = null;
                                        step = "VerifyConfigure";
                                        break;
                                    case CACHE._PATH.css.atrules.path:
                                    case CACHE._PATH.css.constants.path:
                                    case CACHE._PATH.css.elements.path:
                                    case CACHE._PATH.css.extends.path:
                                        await FETCH.SaveRootCSS();
                                        step = "GenerateFinals";
                                        break;
                                    case CACHE._PATH.json.hashrules.path:
                                        step = "ReadHashrules";
                                        break;
                                    default:
                                        if (filePath.startsWith(CACHE._PATH.folder.library.path) && event.extension === "css") {
                                            CACHE.STATIC.Library_Saved[filePath] = event.fileContent;
                                        } else if (filePath.startsWith(CACHE._PATH.folder.portables.path) && ["xcss", "css", "md"].includes(event.extension)) {
                                            CACHE.STATIC.Package_Saved[filePath] = event.fileContent;
                                        }
                                        step = "ProcessXtylesFolder";
                                }
                            } else {
                                step = "VerifySetupStruct";
                            }
                        } else if (event.action === "add" || event.action === "change" || event.action === "unlink") {
                            SMITH.SaveToTarget(event.action, event.folder, event.filePath, event.fileContent, event.extension);
                            step = "GenerateFinals";
                        } else { step = "VerifyConfigure"; }

                        heading = `[${event.timeStamp}] | ${event.filePath} | [${event.action}]`;
                        reportNext = true;
                    }
                }

                await new Promise((resolve) => setTimeout(resolve, 50));
            }
        }
    } while (CACHE.STATIC.WATCH);

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
    projectName,
    projectVersion,
    rootPackageEssential: originPackageEssential
}: {
    command: string,
    argument: string,
    rootPath: string,
    workPath: string,
    projectName: string,
    projectVersion: string,
    rootPackageEssential: TYPE.PackageEssential
}) {
    CACHE.STATIC.Command = command;
    CACHE.STATIC.Argument = argument;
    CACHE.STATIC.DEBUG = command === "debug";
    CACHE.STATIC.WATCH = (command === "debug" || command === "preview") && argument === "watch";
    CACHE.STATIC.Project_Name = Use.string.normalize(projectName);
    CACHE.STATIC.Project_Version = projectVersion;
    ACTION.SetENV(rootPath, workPath, originPackageEssential);
    $.init(command !== "debug" && command !== "archive");

    const APP_VERSION = `${CACHE._ROOT.name} @ ${CACHE._ROOT.version}`;

    switch (CACHE.STATIC.Command) {
        case "init": {
            const title = $.PLAY.Title(`${APP_VERSION} : Initialize`, 500);
            await FETCH.FetchDocs();
            await title;
            const setupInit = await FETCH.VerifySetupStruct();
            if (!setupInit.started) {
                $.POST(await FETCH.Initialize());
            } else if (setupInit.proceed) {
                $.POST((await FETCH.VerifyConfigure(true)).report);
            } else {
                $.POST(setupInit.report);
            }
            break;
        }
        case "debug": {
            await execute(`${APP_VERSION} : Debug ${CACHE.STATIC.WATCH ? "Watch" : "Build"}`);
            break;
        }
        case "preview": {
            await execute(`${APP_VERSION} : Preview ${CACHE.STATIC.WATCH ? "Watch" : "Build"}`);
            break;
        }
        case "publish": {
            await execute(`${APP_VERSION} : Publishing for Production`);
            break;
        }
        // case "archive": {
        //     await execute(CACHE.STATIC_CACHE.PACKAGE + " : Split for Components");
        //     break;
        // }
        // case "install": {
        //     $.POST("\n" + $.MAKE("Installing Portables"));

        //     const verifyStructResult = await FETCH.VerifySetupStruct();
        //     if (verifyStructResult.proceed) {
        //         const verifyConfigsResult = await FETCH.VerifyConfigure(true);
        //         if (verifyConfigsResult.status) {
        //             const fetchResult = await FETCH.FetchStatics(argument);
        //             await fileman.write.bulk(fetchResult.SaveFiles);
        //             $.POST($.MOLD.secondary.Footer("Installation status", fetchResult.Status));
        //         } else { $.POST(verifyConfigsResult.report); };
        //     } else { $.POST(verifyStructResult.report); };
        //     break;
        // }
        default: {
            await FETCH.FetchDocs();

            $.POST(
                $.MAKE($.tag.H1(APP_VERSION),
                    CACHE._SYNC.MARKDOWN.alerts.content ? [CACHE._SYNC.MARKDOWN.alerts.content] : []
                )
            );

            $.POST(
                $.MAKE(
                    "Available Commands",
                    $$.PropMap(CACHE._ROOT.commandList, []),
                    [$.list.Bullets, 0, $.preset.primary]
                ),
            );

            $.POST(
                $.MAKE(
                    "Agreements",
                    $$.PropMap(Object.fromEntries(Object.values(CACHE._SYNC.AGREEMENT).map((i) => [i.title, i.path]))),
                    [$.list.Bullets, 0, $.preset.primary]
                ),
            );

            $.POST(
                $.MAKE(
                    "References",
                    $$.PropMap(Object.fromEntries(Object.values(CACHE._SYNC.MARKDOWN).map((i) => [i.title, i.path]))),
                    [$.list.Bullets, 0, $.preset.primary]
                ),
            );

            $.POST(
                $.MAKE($.tag.H2("For more information visit : " + CACHE._ROOT.website)),
            );
        }
    }
}

export default commander;
